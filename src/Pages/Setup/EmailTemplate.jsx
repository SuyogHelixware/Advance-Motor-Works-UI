import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Description,
  People,
  AttachFile,
  Visibility,
} from "@mui/icons-material";
import "react-quill/dist/quill.snow.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import CardComponent from "../Components/CardComponent";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  // InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import useAuth from "../../Routing/AuthContext";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Email, MenuBook, Subject } from "@mui/icons-material";

export default function EmailTemplate() {
  const theme = useTheme();
  const perms = usePermissions(54);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [MenuData, setMenuData] = useState([]);
  const [subMenuData, setSubMenuData] = useState([]);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftParams, setDraftParams] = useState({});
  const [appliedParams, setAppliedParams] = useState({});

  const [recipientDialogOpen, setRecipientDialogOpen] = useState(false);
  const [currentRecipientType, setCurrentRecipientType] = useState(""); // 'to', 'cc', 'bcc'
  const [selectedSourceType, setSelectedSourceType] = useState("STATIC");
  const [staticEmail, setStaticEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipientLists, setRecipientLists] = useState({
    to: [],
    cc: [],
    bcc: [],
  }); // To store added recipients for each type

  // States for infinite scroll
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListQuery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const initial = {
    TemplateName: "",
    SubjectTemplate: "",
    BodyTemplate: "",
    MenuID: "",
    MenuName: "",
    SubMenuID: "",
    SubMenuName: "",
    AddTrigger: false,
    UpdateTrigger: false,
    IsBodyHtml: false,
    ApprvTrigger: false,
    oEmailReceiptLines: [],
    oEmailAttachLines: [],
    oEmailParameterLines: [],
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const GetMenuData = async () => {
    try {
      const res = await apiClient.get(`/Menu/all`);
      const data = res.data.values || [];

      const filteredData = data.filter((item) => item.DocEntry !== "1");

      setMenuData(filteredData);
    } catch (error) {
      console.error("Error fetching Menu:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch Menu. Please try again later.",
      });
    }
  };

  // ===============Main list handlesearch====================================
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
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };
  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/EmailTemplate?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
        : `/EmailTemplate?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    GetMenuData();
  }, []);
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDraftParams({});
    setAppliedParams({});

    setSelectedData([]);
  };

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setbusinessPartner(CardCode, CntctCode);
      if (isDirty || "UPDATE" === ok) {
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
          setEmailData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setEmailData(DocEntry);
        setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const setEmailData = async (DocEntry) => {
    if (!DocEntry) {
      return;
    }

    try {
      const response = await apiClient.get(
        `/EmailTemplate?DocEntry=${DocEntry}`,
      );
      const data = response.data.values;
      toggleDrawer();
      const formData = {
        ...data,
        AddTrigger: data.AddTrigger === "Y",
        UpdateTrigger: data.UpdateTrigger === "Y",
        ApprvTrigger: data.ApprvTrigger === "Y",
      };

      reset(formData);
      const paramObj =
        formData.oEmailParameterLines?.reduce((acc, item) => {
          acc[item.Name] = item.Description || "";
          return acc;
        }, {}) || {};

      // 👇 show values in inputs
      setDraftParams(paramObj);

      // 👇 preview stays frozen until button click
      setAppliedParams({});
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("Error fetching data:", error);

      // SweetAlert for error in the catch block
      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching the Email data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  // ==============useForm====================================

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const selectedMenuId = useWatch({
    control,
    name: "MenuId",
  });
  const isBodyHtml = watch("IsBodyHtml");

  const { isDirty } = useFormState({ control });
  // Update the parameters useMemo to exclude CSS and JS
  const parameters = useMemo(() => {
    let body = watch("BodyTemplate") || "";
    // Remove <style> and <script> blocks to avoid extracting from CSS/JS
    body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    // Match parameters in double braces {{param}}
    const matches = body.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(2, -2)))];
  }, [watch("BodyTemplate")]);

  // Update the previewBody useMemo to use double braces
  const previewBody = useMemo(() => {
    let body = watch("BodyTemplate") || "";
    parameters.forEach((param) => {
      const regex = new RegExp(`\\{\\{${param}\\}\\}`, "g");
      body = body.replace(regex, appliedParams[param] || `{{${param}}}`);
    });
    return body;
  }, [watch("BodyTemplate"), parameters, appliedParams]);

  useEffect(() => {
    if (!selectedMenuId || !MenuData.length) {
      setSubMenuData([]);
      return;
    }

    const selectedMenu = MenuData.find(
      (m) => String(m.DocEntry) === String(selectedMenuId),
    );

    // Set MenuName automatically (even for edit / setValue)
    setValue("MenuName", selectedMenu?.Name || "");

    const subMenuOptions =
      selectedMenu?.oLines?.map((line) => ({
        key: line.LineNum,
        value: line.TileName,
      })) || [];

    setSubMenuData(subMenuOptions);
  }, [selectedMenuId, MenuData]);

  // Function to open dialog for a specific recipient type
  const openRecipientDialog = (type) => {
    setCurrentRecipientType(type);
    setRecipientDialogOpen(true);
    setSelectedSourceType("STATIC");
    setStaticEmail("");
    setSelectedItems([]);
    setGetListData([]);
    setGetListPage(0);
    setHasMoreGetList(true);
    setGetListQuery("");
    setGetListSearching(false);
  };

  // Function to close dialog
  const closeRecipientDialog = () => {
    setRecipientDialogOpen(false);
  };

  // Function to handle source type change
  const handleSourceTypeChange = (value) => {
    setSelectedSourceType(value);
    setStaticEmail("");
    setSelectedItems([]);
    if (value !== "STATIC") {
      fetchListData(0, "", value);
    }
  };

  // Fetch data for USER or BP
  const fetchListData = async (pageNum, searchTerm = "", type) => {
    try {
      const endpoint = type === "USER" ? "users" : "bps"; // Adjust endpoints
      const url = searchTerm
        ? `/Users/Search/${searchTerm}/1/${pageNum}/20`
        : `/Users/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url); // Assuming apiClient is defined

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreGetList(newData.length === 20);
        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      // Handle error
    }
  };

  // Handle search
  const handleListSearch = (res, type) => {
    setGetListData([]);
    setGetListSearching(true);
    setGetListQuery(res);
    setGetListPage(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchListData(0, res, type);
    }, 600);
  };

  // Handle clear search
  const handleListClear = (type) => {
    fetchListData(0, "", type);
    setGetListData([]);
    setGetListSearching(true);
    setGetListQuery("");
    setGetListPage(0);
  };

  // Fetch more data
  const fetchMoreListData = (type) => {
    fetchListData(getListPage + 1, getListSearching ? getListQuery : "", type);
    setGetListPage((prev) => prev + 1);
  };

  // Toggle selection
  const toggleSelection = (item) => {
    setSelectedItems((prev) =>
      prev.some((selected) => selected.DocEntry === item.DocEntry)
        ? prev.filter((selected) => selected.DocEntry !== item.DocEntry)
        : [...prev, item],
    );
  };

  // Save recipients
  const saveRecipients = () => {
    let newRecipients = [];
    if (selectedSourceType === "STATIC") {
      if (staticEmail) {
        newRecipients = [
          { type: "STATIC", value: staticEmail, display: staticEmail },
        ];
      }
    } else {
      newRecipients = selectedItems.map((item) => ({
        type: selectedSourceType,
        value: item.Email || item.CardCode,
        display: item.Email || item.name,
        id: item.DocEntry,
      }));
    }

    setRecipientLists((prev) => ({
      ...prev,
      [currentRecipientType]: [...prev[currentRecipientType], ...newRecipients],
    }));

    closeRecipientDialog();
  };

  // Remove recipient
  const removeRecipient = (type, index) => {
    setRecipientLists((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // ===============PUT and POST API ===================================
  const handleSendEmail = async () => {
    // Construct the payload
    const payload = {
      To: recipientLists.to
        .map((recipient) => recipient.value || recipient.display)
        .join(", "),
      CC: recipientLists.cc
        .map((recipient) => recipient.value || recipient.display)
        .join(", "),
      BCC: recipientLists.bcc
        .map((recipient) => recipient.value || recipient.display)
        .join(", "),
      Subject: watch("SubjectTemplate") || "",
      MailBody: previewBody || watch("BodyTemplate") || "", // Use previewBody if available, else raw BodyTemplate
      IsBodyHtml: watch("IsBodyHtml") || false,
      AttcLines: [], // Empty collection as specified
    };

    try {
      setLoading(true);
      const response = await apiClient.post("/Email/Send", payload);
      setLoading(false);
      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Email sent successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to send email",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error sending email:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while sending the email.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: data.DocEntry || 0,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: 1,

      /* ===== TEMPLATE MASTER ===== */
      TemplateName: String(data.TemplateName || ""),
      SubjectTemplate: String(data.SubjectTemplate || ""),
      BodyTemplate: String(data.BodyTemplate || ""),
      MenuId: Number(data.MenuId || 0),
      MenuName: String(data.MenuName || ""),
      SubMenuId: Number(data.SubMenuId || 0),
      SubMenuName: String(data.SubMenuName || ""),
      AddTrigger: data.AddTrigger ? "Y" : "N",
      UpdateTrigger: data.UpdateTrigger ? "Y" : "N",
      ApprvTrigger: data.ApprvTrigger ? "Y" : "N",
      IsBodyHtml: Boolean(data.IsBodyHtml),

      /* ===== RECIPIENTS ===== */
      oEmailReceiptLines: (data.oEmailReceiptLines || []).map(
        (item, index) => ({
          LineNum: index,
          DocEntry: data.DocEntry || 0,
          UserId: user.UserId,
          CreatedBy: user.UserName || "",
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: item.Status ?? 1,

          RecipientType: String(item.RecipientType || ""), // TO / CC / BCC
          EmailType: String(item.EmailType || ""), // BP / USER / STATIC
          EmailValue: String(item.EmailValue || ""),
        }),
      ),

      /* ===== ATTACHMENTS ===== */
      oEmailAttachLines: (data.oEmailAttachLines || []).map((item, index) => ({
        LineNum: index,
        DocEntry: data.DocEntry || 0,
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: item.Status ?? 1,

        AttachmentId: Number(item.AttachmentId || 0),
        AttachmentType: String(item.AttachmentType || ""), // PDF / REPORT
        SourceValue: String(item.SourceValue || ""),
        IsMandatory: item.IsMandatory ? "Y" : "N",
      })),
      oEmailParameterLines: parameters.map((param, index) => ({
        LineNum: index,
        DocEntry: data.DocEntry || 0,
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: 1,
        Name: param,
        Description: appliedParams[param] || "",
      })),
    };
    console.log("obj", obj);

    try {
      if (SaveUpdateName === "SAVE") {
        setLoading(true);

        const resp = await apiClient.post(`/EmailTemplate`, obj);
        setLoading(false);

        if (resp.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Email Template is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Email Template is not Added",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.TemplateName}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          setLoading(true);
          const response = await apiClient.put(
            `/EmailTemplate/${DocEntry}`,
            obj,
          );
          setLoading(false);
          if (response.data.success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);

            Swal.fire({
              title: "Success!",
              text: "Email Template Updated",
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
        } else {
          Swal.fire({
            text: "Email Template is Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });

      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async (data) => {
    const result = await Swal.fire({
      text: `Do You Want to Delete ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await apiClient.delete(`/EmailTemplate/${DocEntry}`);
        const { success } = response.data;
        setLoading(false);
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "Email Template Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            text: "Email Template not Deleted",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting Email:", error);
        Swal.fire({
          text: "An error occurred while deleting the Email.",
          icon: "error",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
      }
    } else {
      Swal.fire({
        text: "Email Template Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };
  const tabData = [
    { label: "Template Details", icon: <Description /> },
    // { label: "Recipients", icon: <People /> },
    // { label: "Attachments", icon: <AttachFile /> },
    { label: "New", icon: <AddIcon /> },
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
          Email Template List
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
                  title={item.TemplateName}
                  subtitle={item.Email}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setOldOpenData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  return (
    <>
      {loading && <Loader open={loading} />}
      <Dialog
        open={recipientDialogOpen}
        onClose={closeRecipientDialog}
        scroll="paper"
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            width: "30vw",
            maxWidth: "400px",
            height: "90vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Typography fontWeight="bold">
            Add {currentRecipientType.toUpperCase()} Recipient
          </Typography>
          <IconButton
            onClick={closeRecipientDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            select
            label="Email Source Type"
            value={selectedSourceType}
            onChange={(e) => handleSourceTypeChange(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="STATIC">STATIC</MenuItem>
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="BP">BP</MenuItem>
          </TextField>

          {selectedSourceType === "STATIC" ? (
            <TextField
              label="Email Value"
              value={staticEmail}
              onChange={(e) => setStaticEmail(e.target.value)}
              fullWidth
              type="email"
            />
          ) : (
            <>
              <SearchInputField
                value={getListQuery}
                onChange={(e) =>
                  handleListSearch(e.target.value, selectedSourceType)
                }
                onClickClear={() => handleListClear(selectedSourceType)}
              />
              <Box
                id="recipientListScroll"
                sx={{
                  height: "70vh",
                  overflow: "auto",
                  mt: 1,
                }}
              >
                <InfiniteScroll
                  dataLength={getListData.length}
                  hasMore={hasMoreGetList}
                  next={() => fetchMoreListData(selectedSourceType)}
                  scrollableTarget="recipientListScroll"
                  loader={
                    <Box display="flex" justifyContent="center" py={2}>
                      <BeatLoader
                        color={
                          theme.palette.mode === "light" ? "black" : "white"
                        }
                      />
                    </Box>
                  }
                  endMessage={
                    <Typography align="center">No More Records</Typography>
                  }
                >
                  {getListData.map((item, i) => {
                    const isSelected = selectedItems.some(
                      (selected) => selected.id === item.id,
                    );
                    return (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          width: "100%",
                        }}
                      >
                        <Checkbox
                          checked={selectedItems.some(
                            (selected) => selected.DocEntry === item.DocEntry,
                          )}
                          onChange={() => toggleSelection(item)}
                          sx={{ mr: 1 }}
                        />
                        <Box sx={{ flex: 1, mr: 1.5 }}>
                          <CardComponent
                            title={item.Email || item.name}
                            subtitle={item.CardCode || item.email}
                            description={item.Cellular || item.phone}
                            searchResult={getListQuery}
                            // isSelected={isSelected}
                            onClick={() => toggleSelection(item)}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </InfiniteScroll>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={saveRecipients}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* <Spinner open={loading} /> */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
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
            onClick={clearFormData}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              // top: "10px",
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
              Email Template
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
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="email tabs"
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
                    mb: 2,
                  }}
                >
                  {tabData.map((tab, index) => (
                    <Tab
                      key={tab.label}
                      value={index}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>

                {activeTab === 0 && (
                  <Box sx={{ p: 1, minHeight: "100vh" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Paper
                          elevation={4}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            // background: 'white',
                            // boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Grid container spacing={3}>
                            {/* Template Name - One line, bottom border only, with icon */}
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="TemplateName"
                                control={control}
                                rules={{
                                  required: "Template Name is required",
                                  validate: (value) =>
                                    value.trim() !== "" ||
                                    "Template Name cannot be empty",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <TextField
                                    {...field}
                                    variant="standard" // Only bottom border
                                    label="TEMPLATE NAME"
                                    type="text"
                                    autoComplete="off"
                                    inputProps={{ maxLength: 100 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <InputAdornment position="start">
                                    //       <MenuBook
                                    //         sx={{ color: "primary.main" }}
                                    //       />
                                    //     </InputAdornment>
                                    //   ),
                                    // }}
                                    sx={{
                                      width: "100%",
                                      "& .MuiInput-underline:before": {
                                        borderBottomColor: "silver",
                                      },
                                      "& .MuiInput-underline:after": {
                                        borderBottomColor: "silver",
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Email Subject - One line, bottom border only, with icon */}
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="SubjectTemplate"
                                control={control}
                                rules={{
                                  required: "Subject Template is required",
                                  validate: (value) =>
                                    value.trim() !== "" ||
                                    "Subject Template cannot be empty",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <TextField
                                    {...field}
                                    variant="standard" // Only bottom border
                                    label="EMAIL SUBJECT"
                                    type="text"
                                    autoComplete="off"
                                    inputProps={{ maxLength: 300 }}
                                    error={!!error}
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <InputAdornment position="start">
                                    //       <Subject
                                    //         sx={{ color: "primary.main" }}
                                    //       />
                                    //     </InputAdornment>
                                    //   ),
                                    // }}
                                    sx={{
                                      width: "100%",
                                      "& .MuiInput-underline:before": {
                                        borderBottomColor: "silver",
                                      },
                                      "& .MuiInput-underline:after": {
                                        borderBottomColor: "silver",
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Controller
                                name="MenuId"
                                control={control}
                                rules={{ required: "Menu is required" }}
                                defaultValue=""
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="MENU"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    data={MenuData.map((item) => ({
                                      key: item.DocEntry,
                                      value: item.Name,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={3}>
                              <Controller
                                name="SubMenuId"
                                control={control}
                                rules={{ required: "Sub Menu is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="SUB MENU"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    data={subMenuData}
                                    onChange={(event) => {
                                      const selectedValue = event.target.value;
                                      field.onChange(selectedValue);
                                      const selectedSubMenu = subMenuData.find(
                                        (s) =>
                                          String(s.key) ===
                                          String(selectedValue),
                                      );
                                      setValue(
                                        "SubMenuName",
                                        selectedSubMenu?.value || "",
                                      );
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                            {/* Event Triggers - After Subject, in a row */}
                            <Grid item xs={12}>
                              <Grid
                                container
                                spacing={2}
                                justifyContent="flex-start"
                              >
                                <Grid item xs={12} sm={6} md={3}>
                                  <Controller
                                    name="AddTrigger"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            {...field}
                                            checked={field.value}
                                            sx={{
                                              color: "primary.main",
                                              "&.Mui-checked": {
                                                color: "primary.main",
                                              },
                                            }}
                                          />
                                        }
                                        label="ADD EVENT"
                                        sx={{
                                          "& .MuiFormControlLabel-label": {
                                            fontWeight: "medium",
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                  <Controller
                                    name="UpdateTrigger"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            {...field}
                                            checked={field.value}
                                            sx={{
                                              color: "primary.main",
                                              "&.Mui-checked": {
                                                color: "primary.main",
                                              },
                                            }}
                                          />
                                        }
                                        label="UPDATE EVENT"
                                        sx={{
                                          "& .MuiFormControlLabel-label": {
                                            fontWeight: "medium",
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                  <Controller
                                    name="IsBodyHtml"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            {...field}
                                            checked={field.value}
                                            sx={{
                                              color: "primary.main",
                                              "&.Mui-checked": {
                                                color: "primary.main",
                                              },
                                            }}
                                          />
                                        }
                                        label="HTML FORMAT"
                                        sx={{
                                          "& .MuiFormControlLabel-label": {
                                            fontWeight: "medium",
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                  <Controller
                                    name="ApprvTrigger"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            {...field}
                                            checked={field.value}
                                            sx={{
                                              color: "primary.main",
                                              "&.Mui-checked": {
                                                color: "primary.main",
                                              },
                                            }}
                                          />
                                        }
                                        label="APPROVAL EVENT"
                                        sx={{
                                          "& .MuiFormControlLabel-label": {
                                            fontWeight: "medium",
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {activeTab === 2 && (
                  <Grid container spacing={3}>
                    {/* ======================= TO ======================= */}
                    <Grid item xs={12}>
                      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={2}
                        >
                          TO
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="to.EmailType"
                              control={control}
                              rules={{ required: "TO Email Type is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  label="EMAIL SOURCE TYPE"
                                  {...field}
                                  error={!!error}
                                  helperText={error?.message}
                                  data={[
                                    { key: "1", value: "BP" },
                                    { key: "2", value: "USER" },
                                    { key: "3", value: "STATIC" },
                                  ]}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Controller
                              name="to.EmailValue"
                              control={control}
                              rules={{ required: "TO Email Value is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  {...field}
                                  label="EMAIL VALUE"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* ======================= CC ======================= */}
                    <Grid item xs={12}>
                      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={2}
                        >
                          CC
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="cc.EmailType"
                              control={control}
                              rules={{ required: "CC Email Type is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  label="EMAIL SOURCE TYPE"
                                  {...field}
                                  error={!!error}
                                  helperText={error?.message}
                                  data={[
                                    { key: "1", value: "BP" },
                                    { key: "2", value: "USER" },
                                    { key: "3", value: "STATIC" },
                                  ]}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Controller
                              name="cc.EmailValue"
                              control={control}
                              rules={{ required: "CC Email Value is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  {...field}
                                  label="EMAIL VALUE"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* ======================= BCC ======================= */}
                    <Grid item xs={12}>
                      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={2}
                        >
                          BCC
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="bcc.EmailType"
                              control={control}
                              rules={{ required: "BCC Email Type is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  label="EMAIL SOURCE TYPE"
                                  {...field}
                                  error={!!error}
                                  helperText={error?.message}
                                  data={[
                                    { key: "1", value: "BP" },
                                    { key: "2", value: "USER" },
                                    { key: "3", value: "STATIC" },
                                  ]}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Controller
                              name="bcc.EmailValue"
                              control={control}
                              rules={{
                                required: "BCC Email Value is required",
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  {...field}
                                  label="EMAIL VALUE"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 3 && (
                  <Grid container spacing={2}>
                    {/* -------------------- BASIC EMAIL SETTINGS -------------------- */}
                    <Grid item xs={12}>
                      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                        <Grid container spacing={2} textTransform={"uppercase"}>
                          <Grid
                            item
                            xs={12}
                            md={4}
                            lg={4}
                            sm={6}
                            textAlign={"center"}
                          >
                            <Controller
                              name="AttachmentType"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  {...field}
                                  label="ATTACHMENT TYPE"
                                  value={field.value}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  readOnly
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Backspace" ||
                                      e.key === "Delete"
                                    ) {
                                      e.preventDefault();
                                      setValue("AttachmentType", "");
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>{" "}
                          <Grid
                            item
                            xs={12}
                            md={4}
                            lg={4}
                            sm={6}
                            textAlign={"center"}
                          >
                            <Controller
                              name="SourceValue"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  {...field}
                                  label="SOURCE VALUE"
                                  value={field.value}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  readOnly
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Backspace" ||
                                      e.key === "Delete"
                                    ) {
                                      e.preventDefault();
                                      setValue("SourceValue", "");
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Controller
                              name="IsMandatory"
                              control={control}
                              defaultValue={false}
                              render={({ field }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      {...field}
                                      checked={field.value}
                                      sx={{
                                        color: "primary.main",
                                        "&.Mui-checked": {
                                          color: "primary.main",
                                        },
                                      }}
                                    />
                                  }
                                  label="MANDATORY"
                                  sx={{
                                    "& .MuiFormControlLabel-label": {
                                      fontWeight: "medium",
                                    },
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Box sx={{ height: "80vh", p: 2 }}>
                    {/* Compressed Accordion for Recipients */}
                    <Accordion
                      defaultExpanded={false}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        "&:before": { display: "none" }, // Remove default border
                        backgroundColor: theme.palette.background.paper,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "primary.main" }} />
                        }
                        sx={{
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 2,
                          "& .MuiAccordionSummary-content": {
                            alignItems: "center",
                          },
                        }}
                      >
                        <People sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Recipients
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 1 }}>
                        <Grid container spacing={1} textTransform={"uppercase"}>
                          {/* TO Section */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: theme.palette.grey[25],
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={500}
                                mb={1}
                              >
                                TO
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Box
                                    sx={(theme) => ({
                                      display: "flex",
                                      flexWrap: "wrap",
                                      alignItems: "center",
                                      gap: 1,
                                      p: 1,
                                      border:
                                        theme.palette.mode === "dark"
                                          ? "1px solid #555"
                                          : "1px solid #ddd",
                                      borderRadius: "6px",
                                      minHeight: "50px",
                                    })}
                                  >
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={(theme) => ({
                                        textTransform: "none",
                                        py: 0.3,
                                        px: 1.2,
                                        fontSize: "12px",
                                        borderRadius: "20px",
                                        borderColor:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        color:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        "&:hover": {
                                          background:
                                            theme.palette.mode === "dark"
                                              ? "rgba(144,202,249,0.1)"
                                              : "rgba(25,118,210,0.08)",
                                        },
                                      })}
                                      onClick={() => openRecipientDialog("to")}
                                    >
                                      + Add Recipient
                                    </Button>
                                    {recipientLists.to.map(
                                      (recipient, index) => (
                                        <Chip
                                          key={index}
                                          label={recipient.display}
                                          onDelete={() =>
                                            removeRecipient("to", index)
                                          }
                                          size="small"
                                        />
                                      ),
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>

                          {/* CC Section */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: theme.palette.grey[25],
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={500}
                                mb={1}
                              >
                                CC
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Box
                                    sx={(theme) => ({
                                      display: "flex",
                                      flexWrap: "wrap",
                                      alignItems: "center",
                                      gap: 1,
                                      p: 1,
                                      border:
                                        theme.palette.mode === "dark"
                                          ? "1px solid #555"
                                          : "1px solid #ddd",
                                      borderRadius: "6px",
                                      minHeight: "50px",
                                    })}
                                  >
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={(theme) => ({
                                        textTransform: "none",
                                        py: 0.3,
                                        px: 1.2,
                                        fontSize: "12px",
                                        borderRadius: "20px",
                                        borderColor:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        color:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        "&:hover": {
                                          background:
                                            theme.palette.mode === "dark"
                                              ? "rgba(144,202,249,0.1)"
                                              : "rgba(25,118,210,0.08)",
                                        },
                                      })}
                                      onClick={() => openRecipientDialog("cc")}
                                    >
                                      + Add Recipient
                                    </Button>
                                    {recipientLists.cc.map(
                                      (recipient, index) => (
                                        <Chip
                                          key={index}
                                          label={recipient.display}
                                          onDelete={() =>
                                            removeRecipient("cc", index)
                                          }
                                          size="small"
                                        />
                                      ),
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>

                          {/* BCC Section */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: theme.palette.grey[25],
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={500}
                                mb={1}
                              >
                                BCC
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Box
                                    sx={(theme) => ({
                                      display: "flex",
                                      flexWrap: "wrap",
                                      alignItems: "center",
                                      gap: 1,
                                      p: 1,
                                      border:
                                        theme.palette.mode === "dark"
                                          ? "1px solid #555"
                                          : "1px solid #ddd",
                                      borderRadius: "6px",
                                      minHeight: "50px",
                                    })}
                                  >
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={(theme) => ({
                                        textTransform: "none",
                                        py: 0.3,
                                        px: 1.2,
                                        fontSize: "12px",
                                        borderRadius: "20px",
                                        borderColor:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        color:
                                          theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976D2",
                                        "&:hover": {
                                          background:
                                            theme.palette.mode === "dark"
                                              ? "rgba(144,202,249,0.1)"
                                              : "rgba(25,118,210,0.08)",
                                        },
                                      })}
                                      onClick={() => openRecipientDialog("bcc")}
                                    >
                                      + Add Recipient
                                    </Button>
                                    {recipientLists.bcc.map(
                                      (recipient, index) => (
                                        <Chip
                                          key={index}
                                          label={recipient.display}
                                          onDelete={() =>
                                            removeRecipient("bcc", index)
                                          }
                                          size="small"
                                        />
                                      ),
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    {/* Existing 50-50 Column Section */}
                    <Grid container spacing={2} sx={{ height: "100%" }}>
                      {/* ================= LEFT COLUMN ================= */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                        <Box
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {/* -------- Email Body (40vh) -------- */}
                          <Paper
                            elevation={3}
                            sx={{
                              height: "40vh",
                              borderRadius: 2,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* ===== FIXED HEADER ===== */}
                            <Box
                              sx={{
                                p: 2,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "background.paper",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Email sx={{ color: "primary.main" }} />
                                <Typography fontWeight={600}>
                                  EMAIL BODY
                                </Typography>
                              </Box>
                            </Box>

                            {/* ===== SCROLLABLE CONTENT ===== */}
                            <Box
                              sx={{
                                flex: 1,
                                p: 2,
                                overflow: "auto", // ✅ scroll appears here
                              }}
                            >
                              <Controller
                                name="BodyTemplate"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    multiline
                                    fullWidth
                                    placeholder="Enter email body..."
                                    variant="outlined"
                                    minRows={10} // ✅ let textarea grow but still scroll
                                    maxRows={50} // optional
                                    sx={{
                                      "& textarea": {
                                        fontFamily: "monospace",
                                        fontSize: "14px",
                                        overflow: "auto",
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          </Paper>

                          {/* -------- Parameters (40vh) -------- */}
                          <Paper
                            elevation={3}
                            sx={{
                              height: "40vh",
                              borderRadius: 2,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* ===== FIXED HEADER ===== */}
                            <Box
                              sx={{
                                p: 2,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "background.paper",
                                zIndex: 1,
                              }}
                            >
                              <Typography fontWeight={600}>
                                DYNAMIC PARAMETERS
                              </Typography>
                            </Box>

                            {/* ===== SCROLLABLE CONTENT ===== */}
                            <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                              <Grid container spacing={2}>
                                {parameters.map((param) => (
                                  <Grid item xs={12} md={6} key={param}>
                                    <TextField
                                      fullWidth
                                      label={param}
                                      value={draftParams[param] || ""}
                                      onChange={(e) =>
                                        setDraftParams((prev) => ({
                                          ...prev,
                                          [param]: e.target.value,
                                        }))
                                      }
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Paper>
                        </Box>
                      </Grid>

                      {/* ================= RIGHT COLUMN ================= */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                        <Paper
                          elevation={3}
                          sx={{
                            height: "80vh",
                            p: 2,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          <Typography fontWeight={600}>
                            EMAIL PREVIEW
                          </Typography>

                          <Button
                            variant="contained"
                            size="small"
                            sx={{ mb: 1, MT: 1, alignSelf: "flex-start" }}
                            onClick={() => setAppliedParams(draftParams)}
                          >
                           Preview
                          </Button>

                          <Divider sx={{ mb: 1 }} />

                          {/* Preview Area (scrolls internally) */}
                          <Box sx={{ flex: 1 }}>
                            {previewBody ? (
                              watch("IsBodyHtml") ? (
                                <iframe
                                  srcDoc={previewBody}
                                  title="Email Preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                  }}
                                />
                              ) : (
                                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                  {previewBody}
                                </Typography>
                              )
                            ) : (
                              <Typography color="text.secondary">
                                No email body to preview
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* <Grid
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
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid> */}
            <Grid
              item
              xs={12}
              px={2}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                bottom: 0,
                background: theme.palette.mode === "light" ? "#fff" : "#080D2B",

                // py: 2,
                borderTop: "1px solid #e0e0e0",
                boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                  }
                  type="submit"
                >
                  {SaveUpdateName}
                </Button>

                <Button
                  variant="contained"
                  // startIcon={<PlayArrowIcon />}
                  onClick={handleSendEmail}
                  // disabled={}
                >
                  SEND
                </Button>
              </Box>

              <Button
                variant="contained"
                color="error"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                onClick={handleOnDelete}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
