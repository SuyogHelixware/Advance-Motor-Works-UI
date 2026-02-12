import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SendIcon from "@mui/icons-material/Send";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { useFileUpload } from "../FileUpload/useFileUpload";
import CardCopyFrom from "./CardCopyFrom";
import { Loader } from "./Loader";
import SearchInputField from "./SearchInputField";
import { useSignalR } from "../../Routing/SignalRContext";

/* ----------------- Helpers ----------------- */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationCardPremium = ({
  title,
  FromUserName,
  UserName,
  date,
  onClick,
  isSentTab,
}) => {
  const theme = useTheme();

  // Extract initials (first letters of the name)
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Select correct username (From / To)
  const displayName = isSentTab ? UserName : FromUserName;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        p: "16px",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "0.25s ease",
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 8px 20px rgba(0,0,0,0.35)"
            : "0 6px 16px rgba(0,0,0,0.08)",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 10px 25px rgba(0,0,0,0.45)"
              : "0 10px 25px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* LEFT — USER INITIAL CIRCLE */}
      <Box
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.main, 0.15),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
          color: theme.palette.primary.main,
          textTransform: "uppercase",
        }}
      >
        {getInitials(displayName)}
      </Box>

      {/* RIGHT — CONTENT */}
      <Box sx={{ flex: 1 }}>
        {/* TITLE */}
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            mb: "4px",
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>

        {/* FROM / TO + DATE ROW */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              color: theme.palette.text.secondary,
            }}
          >
            {isSentTab ? "To " : "From "}
            <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>
              {displayName}
            </span>
          </Typography>

          <Typography
            sx={{
              fontSize: "12px",
              color: theme.palette.text.secondary,
              whiteSpace: "nowrap",
            }}
          >
            {date}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};


/* ----------------- Component ----------------- */
export default function NotificationDrawer({ open, onClose,setUnreadCount  }) {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { user, registerNotificationListener } = useSignalR();

  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const timeoutRef = useRef(null);

  // Reply + Forward states
  const [replyMode, setReplyMode] = useState(false);
  const [getListUserData, setGetListUserData] = useState([]);
  const [hasMoreUserList, setHasMoreUserList] = useState(true);
  const [getListPageCopyFrom, setGetListPageCopyFrom] = useState(0);
  const [getListqueryCopyFrom, setGetLIstQueryCopyFrom] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  // const { user } = useAuth();

  const [getListSearchingCopyFrom, setGetListSearchingCopyFrom] =
    useState(false);
  // const [attachments, setAttachments] = useState([]);
  const [openAttachmentList, setOpenAttachmentList] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [openCopyForm, setOpenCopyForm] = useState(false);
  const theme = useTheme();
  const {
    fileData, // replaces attachments
    handleFileChange, // replaces onChange for file select
    handleRemove, // replaces delete logic
    clearFiles, // if needed
    setFilesFromApi, // if editing existing
  } = useFileUpload();

  const openAttachment = (file) => {
    try {
      const fileName = file.FileName || file.Description || "download";
      let ext = (file.FileExt || fileName.split(".").pop() || "")
        .replace(".", "")
        .toLowerCase();

      const previewExt = [
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "bmp",
        "webp",
        "svg",
      ];

      const mimeMap = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        bmp: "image/bmp",
        webp: "image/webp",
        svg: "image/svg+xml",
        zip: "application/zip",
        rar: "application/x-rar-compressed",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
        txt: "text/plain",
      };

      const mime = mimeMap[ext] || "application/octet-stream";

      // ---------------------------------------------------
      // ⭐ CASE 1: BASE64 FROM API
      // ---------------------------------------------------
      if (file.FileBase64) {
        const cleanBase64 = file.FileBase64.replace(/\s+/g, "");
        const base64URL = `data:${mime};base64,${cleanBase64}`;

        if (previewExt.includes(ext)) {
          // 🔥 FIX: Properly open image/PDF
          const win = window.open();
          win.document.write(
            `<iframe src="${base64URL}" 
              style="width:100%;height:100%;border:none;"></iframe>`
          );
        } else {
          // 🔥 FIX: non-previewable file download
          const a = document.createElement("a");
          a.href = base64URL;
          a.download = fileName;
          a.click();
        }
        return;
      }

      // ---------------------------------------------------
      // ⭐ CASE 2: LOCAL FILE OBJECT
      // ---------------------------------------------------
      if (file.File instanceof File) {
        const fileURL = file.SrcPath || URL.createObjectURL(file.File);

        if (previewExt.includes(ext)) {
          window.open(fileURL, "_blank");
        } else {
          const a = document.createElement("a");
          a.href = fileURL;
          a.download = fileName;
          a.click();
        }
        return;
      }

      Swal.fire({ icon: "error", title: "Cannot open file" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  // Form (main) + reply field
  const { register, handleSubmit, reset, setValue, getValues, control } =
    useForm({
      defaultValues: {
        Subject: "",
        UserText: "",
        Priority: "Medium",
        ReplyText: "",
      },
    });

  const priorityMap = {
    High: "H",
    Medium: "M",
    Low: "L",
  };
  const priorityReverseMap = {
    H: "High",
    M: "Medium",
    L: "Low",
  };
    const assignDocEntryIfMissing = (notification) => ({
    ...notification,
    DocEntry:
      notification.DocEntry && notification.DocEntry !== 0
        ? notification.DocEntry
        : `custom-${Date.now()}-${Math.random()}`,
  });
 
    useEffect(() => {
    const handleNewNotification = (rawNotification) => {
    const notification = assignDocEntryIfMissing(rawNotification);

    // Only add to notifications if on the Unread tab (tab === 0)
    if (tab === 0) {
      setNotifications((prev) => {
        // Check for duplicates based on DocEntry
        const exists = prev.some((n) => n.DocEntry === notification.DocEntry);
        if (exists) return prev;
        // Prepend new notification (newest first)
        return [notification, ...prev];
      });
      // Increment unread count when a new unread notification is added
      setUnreadCount((prev) => prev + 1);
    }
    // For other tabs, do nothing (rely on fetchNotifications for data)
  };

    const unregister = registerNotificationListener(handleNewNotification);
    return () => {
      if (typeof unregister === "function") unregister();
    };
  }, [tab]);
  const handleCreateNotification = async () => {
    try {
      setIsLoading(true);
      const subject = getValues("Subject");
      const message = getValues("UserText");
      const replyText = getValues("ReplyText") || "";
      const Priority = getValues("Priority") || "";

      const priorityCode = priorityMap[Priority] || "";
 if (!subject || subject.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Subject Required",
        text: "Please enter a subject before sending.",
        timer: 1500,
        showConfirmButton: true,
      });
      return; // <-- Stop function here
    }
      // =====================================================
      // 1️⃣ IF EXISTING NOTIFICATION (REPLY OR FORWARD)
      // =====================================================
      if (!isCreatingNew && selectedNotification) {
        // -----------------------------------------------
        // CASE 1: REPLY MODE → reply only to original sender
        // -----------------------------------------------
        if (replyMode === true) {
          const finalText = `${message}\n\nReplied: ${replyText}`;

          const payload = {
            DocEntry: 0,
            UserId: user.UserId,
            CreatedBy: user.UserName,
            CreatedDate: new Date().toISOString(),
            ModifiedBy: user.UserName,
            ModifiedDate: new Date().toISOString(),
            Status: 1,

            // 👇 reply goes to original sender ONLY
            FromUserSign: user.UserId,
            UserSign: selectedNotification.FromUserSign,

            Subject: subject,
            UserText: finalText,
            RecDate: new Date().toISOString(),
            WasRead: "N",
            Type: "M",
            Priority: priorityCode,
            AtcEntry: selectedNotification.AtcEntry || 0,
            ObjType: "0",
            ObjId: "0",
          };

          const res = await apiClient.post("/Notification", payload);

          if (res.data.success) {
            Swal.fire({
              title: "Success",
              text: "Reply sent!",
              icon: "success",
              timer: 1000, // auto close after 1.5 sec
              showConfirmButton: false,
            });
            setOpenDialog(false);
            reset();
            setSelectedRecipients([]);
            fetchNotifications(0, tab);
          } else {
            Swal.fire("Error", res.data.message, "error");
          }

          return; // STOP — reply mode finished
        }

        // -----------------------------------------------
        // CASE 2: FORWARD MODE → use Bulk API
        // forward message to selectedRecipients[]
        // -----------------------------------------------
        if (!replyMode) {
          if (selectedRecipients.length === 0) {
            Swal.fire(
              "Warning",
              "Please select at least one recipient to forward",
              "warning"
            );
            return;
          }

          const forwardPayload = selectedRecipients.map((rec) => ({
            DocEntry: 0,
            UserId: user.UserId,
            CreatedBy: user.UserName,
            CreatedDate: new Date().toISOString(),
            ModifiedBy: user.UserName,
            ModifiedDate: new Date().toISOString(),
            Status: 1,

            FromUserSign: user.UserId, // you are the forwarder
            UserSign: rec.DocEntry, // send to selected recipients

            Subject: subject,
            UserText: message, // forwarded text
            RecDate: new Date().toISOString(),
            WasRead: "N",
            Type: "M",
            Priority: priorityCode,
            AtcEntry: selectedNotification.AtcEntry || 0, // include original attachments
            ObjType: "0",
            ObjId: "0",
          }));

          const res = await apiClient.post(
            "/Notification/Bulk",
            forwardPayload
          );

          if (res.data.success) {
            Swal.fire("Success", "Message forwarded!", "success");
            Swal.fire({
              title: "Success",
              text: "Message forwarded!",
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
            });

            setOpenDialog(false);
            reset();
            setSelectedRecipients([]);
            fetchNotifications(0, tab);
          } else {
            Swal.fire("Error", res.data.message, "error");
          }

          return; // STOP — forward mode finished
        }
      }

      const selectedUser = selectedRecipients[0];
      if (!selectedUser) {
        Swal.fire("Warning", "Please select at least one recipient", "warning");
        return;
      }

      // ========================================
      // 1️⃣ IF ATTACHMENTS SELECTED → PREPARE FormData
      // ========================================
      let attachmentDocEntry = 0;

      if (fileData.length > 0) {
        const formData = new FormData();

        formData.append("DocEntry", "");
        formData.append("UserId", user.UserId);
        formData.append("CreatedBy", user.UserName);
        formData.append("ModifiedBy", user.UserName);
        formData.append("CreatedDate", dayjs().format("YYYY-MM-DD"));
        formData.append("ModifiedDate", dayjs().format("YYYY-MM-DD"));
        formData.append("Status", "1");

        fileData.forEach((file, index) => {
          formData.append(`AttachmentLines[${index}].LineNum`, "");
          formData.append(`AttachmentLines[${index}].DocEntry`, "");
          formData.append(`AttachmentLines[${index}].UserId`, user.UserId);
          formData.append(`AttachmentLines[${index}].CreatedBy`, user.UserName);
          formData.append(
            `AttachmentLines[${index}].ModifiedBy`,
            user.UserName
          );
          formData.append(
            `AttachmentLines[${index}].CreatedDate`,
            dayjs().format("YYYY-MM-DD")
          );
          formData.append(
            `AttachmentLines[${index}].ModifiedDate`,
            dayjs().format("YYYY-MM-DD")
          );
          formData.append(`AttachmentLines[${index}].Status`, "1");

          const fileName = file.FileName.replace(/\.[^/.]+$/, "");
          const ext = file.FileExt;

          formData.append(`AttachmentLines[${index}].FileName`, fileName);
          formData.append(`AttachmentLines[${index}].FileExt`, ext);
          formData.append(
            `AttachmentLines[${index}].Description`,
            file.FileName
          );
          formData.append(`AttachmentLines[${index}].SrcPath`, "");

          // ⬅️ THE MOST IMPORTANT FIX
          formData.append(`AttachmentLines[${index}].File`, file.File);
        });

        // ===== POST ATTACHMENT API HERE =====
        const attRes = await apiClient.post("/Attachment", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!attRes.data.success) {
          Swal.fire("Error", attRes.data.message, "error");
          return;
        }

        attachmentDocEntry = attRes.data.ID; // <-- important
      }

      // ========================================
      // 2️⃣ Now Call Notification API with AtcEntry
      // ========================================
      const bulkPayload = selectedRecipients.map((rec) => ({
        DocEntry: 0,
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: new Date().toISOString(),
        ModifiedBy: user.UserName || "",
        ModifiedDate: new Date().toISOString(),
        Status: 1,

        // MULTIPLE USERS HERE
        UserSign: rec.DocEntry,

        RecDate: new Date().toISOString(),
        WasRead: "N",
        Type: "M",
        Priority: priorityCode,

        Subject: subject,
        UserText: message,
        FromUserSign: user.UserId,

        // Attachment DocEntry applied to all users
        AtcEntry: attachmentDocEntry || 0,

        ObjType: "0",
        ObjId: "0",
      }));

      const res = await apiClient.post("/Notification/Bulk", bulkPayload);

      if (res.data.success) {
        Swal.fire({
          title: "Success",
          text: "Notification sent!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });

        setOpenDialog(false);
        reset();
        setSelectedRecipients([]);
        fetchNotifications(0, tab);
      } else {
        Swal.fire({
          title: "Error",
          text: res.data.message,
          icon: "error",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to send notification", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCopyFromData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true);
      const url = searchTerm
        ? `/Users/Search/${searchTerm}/1/${pageNum}/20`
        : `/Users/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);

      if (response.data.success === true) {
        const newData = response.data.values;
        setHasMoreUserList(newData.length === 20);
        setGetListUserData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      } else if (response.data.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        text: error,
        icon: "question",
        confirmButtonText: "YES",
        showConfirmButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetListSearchCopyFrom = (resp) => {
    setGetLIstQueryCopyFrom(resp);
    setGetListSearchingCopyFrom(true);
    setGetListPageCopyFrom(0);
    setGetListUserData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCopyFromData(0, resp, "I");
    }, 600);
  };

  const handleGetListClearCopyFrom = () => {
    setGetLIstQueryCopyFrom("");
    setGetListSearchingCopyFrom(true);
    setGetListPageCopyFrom(0);
    setGetListUserData([]);
    fetchCopyFromData(0, "", "I");
  };

  const fetchMoreGetListCopyFrom = () => {
    fetchCopyFromData(
      getListPageCopyFrom + 1,
      getListSearchingCopyFrom ? getListqueryCopyFrom : ""
    );
    setGetListPageCopyFrom((prev) => prev + 1);
  };

  useEffect(() => {
    fetchCopyFromData(0, "");
  }, []);

  useEffect(() => {
    const updatedChecked = {};

    // Mark selected recipients as checked
    selectedRecipients.forEach((u) => {
      updatedChecked[u.DocEntry] = true;
    });

    setCheckedItems(updatedChecked);
  }, [selectedRecipients]);

  const onClickCopyFrom = (e, user, id) => {
    setSelectedRecipients((prev) => {
      const exists = prev.some((u) => u.DocEntry === id);

      if (exists) {
        // Remove
        return prev.filter((u) => u.DocEntry !== id);
      } else {
        // Add
        return [...prev, user];
      }
    });
  };

  /* ---------------------------------------------------------
     FETCH API — notifications
  --------------------------------------------------------- */
  const fetchNotificationDetails = async (docEntry) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/Notification?DocEntry=${docEntry}`);

      if (!res.data || !res.data.success) return;

      const data = res.data.values; // backend usually returns array
      const apiPriority = data.Priority;
      // SET FORM FIELDS
      reset({
        Subject: data.Subject || "",
        UserText: data.UserText || "",
        Priority: priorityReverseMap[apiPriority],
        ReplyText: "",
      });

      // Save selected full object
      setSelectedNotification(data);

      setFilesFromApi(data.AtcEntry);

      setOpenDialog(true);
      setIsCreatingNew(false);
      setReplyMode(false);
    } catch (err) {
      console.error("Notification details error", err);
    } finally {
      setIsLoading(false);
    }
  };
useEffect(() => {
  // Load Unread tab (tab index = 0) on first render
  fetchNotifications(0, 0);
}, []);

  const fetchNotifications = async (pageNo, currentTab) => {
    try {
      setIsLoading(true);
      let params = `Page=${pageNo}&Limit=20`;

      // Unread Tab
      if (currentTab === 0) {
        params += `&Status=1&WasRead=N&UserSign=${user.UserId}`;
      }

      // All Tab
      else if (currentTab === 1) {
        params += `&UserSign=${user.UserId}`;
      }

      // Sent Tab
      else if (currentTab === 2) {
        params += `&UserSign=${user.UserId}&ArtType=OUT`;
      }

      const res = await apiClient.get(`/Notification?${params}`);

      const newData = (res.data && res.data.values) || [];
    if (currentTab === 0) {
      setUnreadCount(res.data?.count || 0);
    }
      setHasMore(newData.length === 20);

      setNotifications((prev) =>
        pageNo === 0 ? newData : [...prev, ...newData]
      );
    } catch (err) {
      console.error("Notification API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchNotifications(0, tab);
  }, [tab]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, tab);
  };

  if (!open) return null;

  /* ---------------------------------------------------------
     On clicking notification card → OPEN MODAL ABOVE DRAWER
  --------------------------------------------------------- */
  const handleCardClick = async (item) => {
    // if (tab === 2) return;
    if (tab === 0) {
      await apiClient.put(`/Notification/Read/${item.DocEntry}`);
       setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setSelectedNotification(item);
    setIsCreatingNew(false);
    // Populate form values (subject/message/priority)
    reset({
      Subject: item.Subject || "",
      UserText: item.UserText || "",
      Priority: item.Priority || "Medium",
      ReplyText: "",
    });
    fetchNotificationDetails(item.DocEntry);
    fetchNotifications(0, tab);

    setReplyMode(false);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setIsCreatingNew(true);
    // setAttachments([]);
    setSelectedRecipients([]);
    // Reset form for a new notification
    reset({
      Subject: "",
      UserText: "",
      Priority: "Medium",
      ReplyText: "",
    });
    clearFiles();
    setSelectedNotification(null); // no old notification
    setReplyMode(false);
    setOpenDialog(true);
  };

  /* ----------------- Render ----------------- */
  return (
    <>
      {isLoading && <Loader open={isLoading} />}

      {/* BACKDROP */}
      <Box
        onClick={!openDialog ? onClose : undefined}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1998,
          pointerEvents: openDialog ? "none" : "auto",
        }}
      />

      {/* DRAWER */}

      <Fade in={open}>
        <Box
          sx={{
            position: "fixed",
            top: 70,
            right: 25,
            width: 420,
            height: 560,
            borderRadius: "22px",
            background: theme.palette.background.paper,
            boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
            zIndex: 1999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e9e9e9",
          }}
        >
          {/* -------------------------------------------------------
       HEADER — Premium Dribbble Style + MUI Icon
    ------------------------------------------------------- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: theme.palette.background.paper,
            }}
          >
            {/* Left Side Icon + Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  background: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NotificationsNoneIcon
                  sx={{ fontSize: 20, color: "#1976d2" }}
                />
              </Box>

              <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                Notifications
              </Typography>
            </Box>

            {/* RIGHT SIDE — ADD NEW NOTIFICATION */}
            <IconButton
              onClick={() => handleAddNew()}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                background: "#1976d215",
                transition: "0.25s",
                "&:hover": {
                  background: "#1976d230",
                  transform: "scale(1.07)",
                },
              }}
            >
              <AddIcon sx={{ fontSize: 22, color: "#1976d2" }} />
            </IconButton>
          </Box>

          {/* Divider */}
          <Box sx={{ height: "1px", background: "#e9e9e9" }} />

          {/* -------------------------------------------------------
       TABS — Full Row, Equal Width, Filled on Selected
    ------------------------------------------------------- */}
          <Box
            sx={(theme) => ({
              background:
                theme.palette.mode === "dark"
                  ? "#1a1f2b" // DARK secondary background
                  : "#f7f7f7", // LIGHT background

              borderBottom:
                theme.palette.mode === "dark"
                  ? "1px solid #2c3344"
                  : "1px solid #dcdcdc",

              boxShadow:
                theme.palette.mode === "dark"
                  ? "inset 0 -1px 0 #232a39"
                  : "inset 0 -1px 0 #e4e4e4",
            })}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              sx={(theme) => ({
                minHeight: 55,

                ".MuiTabs-flexContainer": {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                },

                /* INDICATOR */
                ".MuiTabs-indicator": {
                  height: "4px",
                  borderRadius: "2px",
                  background:
                    theme.palette.mode === "dark"
                      ? "#64b5f6" // lighter blue for dark mode
                      : "#1565c0", // original light mode blue
                },

                /* TAB TEXT */
                ".MuiTab-root": {
                  fontSize: "17px",
                  fontWeight: 600,
                  color:
                    theme.palette.mode === "dark"
                      ? "#bdbdbd" // soft light gray
                      : "#444", // original light mode color
                  textTransform: "none",
                  minHeight: 55,
                },

                /* SELECTED TAB */
                ".Mui-selected": {
                  color:
                    theme.palette.mode === "dark"
                      ? "#90caf9 !important" // glowing blue for dark
                      : "#1565c0 !important", // original light mode blue
                },
              })}
            >
              <Tab label="Unread" />
              <Tab label="All" />
              <Tab label="Sent" />
            </Tabs>
          </Box>

          {/* Divider below tabs */}
          <Box sx={{ height: "1px", background: "#e0e0e0" }} />

          {/* ------------------ Scroll Area ------------------ */}
          <Box id="notifScrollArea" sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <InfiniteScroll
              dataLength={notifications.length}
              next={loadMore}
              hasMore={hasMore}
              scrollableTarget="notifScrollArea"
              loader={
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <CircularProgress size={26} />
                </Box>
              }
            >
              {notifications.map((n, index) => (
                <NotificationCardPremium
                  key={index}
                  title={n.Subject}
                  FromUserName={n.FromUserName}
                  UserName={n.UserName}
                  date={formatDate(n.CreatedDate)}
                  onClick={() => handleCardClick(n)}
                  isSentTab={tab === 2}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Box>
      </Fade>

      {/* DETAILS DIALOG */}
      <Dialog
  open={openDialog}
  maxWidth="md"
  fullWidth
  sx={(theme) => ({
    zIndex: 2500,
    "& .MuiDialog-paper": {
      borderRadius: "2px",
      p: 0,
      background:
        theme.palette.mode === "dark"
          ? "rgba(30,30,30,0.9)"
          : "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0px 25px 70px rgba(0,0,0,0.75)"
          : "0px 25px 70px rgba(0,0,0,0.35)",
      overflow: "visible",
    },
  })}
>
  {/* HEADER */}
  <Box
    sx={(theme) => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 1.5,
      px: 3,
      background:
        theme.palette.mode === "dark"
          ? "linear-gradient(to bottom, #2c2c2c, #1e1e1e)"
          : "linear-gradient(to bottom, #ffffff, #f7f7f7)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0px 3px 10px rgba(0,0,0,0.5)"
          : "0px 3px 10px rgba(0,0,0,0.08)",
      borderBottom:
        theme.palette.mode === "dark"
          ? "1px solid rgba(80,80,80,0.4)"
          : "1px solid rgba(230,230,230,0.3)",
      position: "relative",
      zIndex: 2,
    })}
  >
    <Typography
      sx={(theme) => ({
        fontSize: "21px",
        fontWeight: 500,
        letterSpacing: "0.4px",
        color: theme.palette.mode === "dark" ? "#f2f2f2" : "#1f1f1f",
      })}
    >
      Notification Details
    </Typography>

    {/* CLOSE BUTTON */}
    <IconButton
      onClick={() => {
        setOpenDialog(false);
        setIsCreatingNew(false);
        setSelectedRecipients([]);
      }}
      sx={(theme) => ({
        width: 40,
        height: 40,
        borderRadius: "14px",
        background:
          theme.palette.mode === "dark" ? "#3a3a3a" : "#f1f1f1",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0px 2px 6px rgba(0,0,0,0.5)"
            : "0px 2px 6px rgba(0,0,0,0.15)",
        transition: "0.25s",
        "&:hover": {
          background:
            theme.palette.mode === "dark" ? "#4a4a4a" : "#e6e6e6",
          transform: "scale(1.05)",
        },
      })}
    >
      <CloseIcon
        sx={(theme) => ({
          color: theme.palette.mode === "dark" ? "#ddd" : "#333",
          fontSize: 22,
        })}
      />
    </IconButton>
  </Box>

  {/* BODY */}
  <DialogContent sx={{ p: 3 }}>
    <form>
      <Grid container spacing={2}>
        {/* RECIPIENTS SECTION */}
        {isCreatingNew && (
          <Grid item xs={12}>
            <Typography sx={(theme) => ({
              fontWeight: 600,
              mb: 1,
              color: theme.palette.mode === "dark" ? "#e0e0e0" : "#000",
            })}>
              {isCreatingNew ? "Recipients" : "Forward To"}
            </Typography>

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
                background:
                  theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa",
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
                    theme.palette.mode === "dark" ? "#90caf9" : "#1976D2",
                  color:
                    theme.palette.mode === "dark" ? "#90caf9" : "#1976D2",
                  "&:hover": {
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(144,202,249,0.1)"
                        : "rgba(25,118,210,0.08)",
                  },
                })}
                onClick={() => setOpenCopyForm(true)}
              >
                + Add Recipient
              </Button>

              {selectedRecipients.map((user) => (
                <Chip
                  key={user.DocEntry}
                  label={`${user.FirstName} ${user.LastName}`}
                  onDelete={() =>
                    setSelectedRecipients((prev) =>
                      prev.filter((u) => u.DocEntry !== user.DocEntry)
                    )
                  }
                  sx={(theme) => ({
                    borderRadius: "20px",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(144,202,249,0.2)"
                        : "#e6f2ff",
                    color:
                      theme.palette.mode === "dark"
                        ? "#90caf9"
                        : "#004c99",
                    fontWeight: 500,
                  })}
                />
              ))}
            </Box>
          </Grid>
        )}
 <Grid item xs={12} md={12}>
    {!isCreatingNew && selectedNotification && tab !== 2 && (
      <Typography
        sx={(theme) => ({
          fontWeight: 600,
          mb: 0.5,
          color: theme.palette.mode === "dark" ? "#e0e0e0" : "#000",
        })}
      >
        From:{" "}
        <Box
          component="span"
          sx={{
            fontWeight: 500,
            color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
          }}
        >
          {selectedNotification?.CreatedByName ||
            selectedNotification?.CreatedBy ||
            `${selectedNotification?.FirstName} ${selectedNotification?.LastName}`}
        </Box>
      </Typography>
    )}
  </Grid>

        {/* SUBJECT FIELD */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Subject"
            fullWidth
            {...register("Subject", { required: true })}
            disabled={!isCreatingNew && selectedNotification}
            sx={(theme) => ({
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(50,50,50,0.7)"
                    : "rgba(255,255,255,0.7)",
              },
              "& .MuiInputLabel-root": {
                fontWeight: 500,
                color: theme.palette.mode === "dark" ? "#ccc" : undefined,
              },
            })}
          />
        </Grid>

        {/* PRIORITY DROPDOWN */}
       <Grid item xs={12} md={4}>
  <Controller
    name="Priority"
    control={control}
    rules={{ required: "Priority is required" }}
    render={({ field, fieldState: { error } }) => (
      <FormControl
        fullWidth
        error={!!error}
        sx={{
          overflow: "visible",
          position: "relative",
        }}
      >
        <InputLabel id="priority-label" shrink>
          Priority
        </InputLabel>

        <Select
          {...field}
          labelId="priority-label"
          label="Priority"
          sx={{
            // ✅ ONLY BACKGROUND + COLOR UPDATED
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "#2B2B2C"
                : "rgba(255,255,255,0.7)",
            color: (theme) =>
              theme.palette.mode === "dark" ? "#fff" : "inherit",
          }}
          MenuProps={{
            disablePortal: false,
            slotProps: {
              paper: {
                sx: {
                  // ⛔ do not change layout — only color
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#2B2B2C" : "#fff",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "inherit",

                  zIndex: "999999 !important",
                  position: "relative !important",
                  maxHeight: "150px !important",
                  overflowY: "auto",
                  paddingTop: "4px !important",
                  paddingBottom: "4px !important",
                  width: "150px !important",
                },
              },
              root: {
                sx: {
                  zIndex: "999999 !important",
                },
              },
            },
          }}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>

        {error && (
          <Typography variant="caption" sx={{ color: "error.main", ml: 1 }}>
            {error.message}
          </Typography>
        )}
      </FormControl>
    )}
  />
</Grid>


        {/* FILE ATTACH */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<AttachFileIcon />}
              sx={(theme) => ({
                borderRadius: "6px",
                textTransform: "none",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#555" : "#e0e0e0",
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#666" : "#d5d5d5",
                },
              })}
            >
              Attach Files
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>

            {fileData.length > 0 && (
              <Button
                variant="text"
                sx={(theme) => ({
                  textTransform: "none",
                  fontSize: "14px",
                  color:
                    theme.palette.mode === "dark" ? "#90caf9" : "inherit",
                })}
                onClick={() => setOpenAttachmentList(!openAttachmentList)}
              >
                View Files ({fileData.length})
              </Button>
            )}
          </Box>

          {openAttachmentList && fileData.length > 0 && (
            <Box
              sx={(theme) => ({
                mt: 1,
                p: 1.5,
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid #555"
                    : "1px solid #ddd",
                borderRadius: "6px",
                background:
                  theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa",
                maxHeight: 200,
                overflowY: "auto",
              })}
            >
              {fileData.map((file, index) => (
                <Box
                  key={index}
                  sx={(theme) => ({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: "6px 10px",
                    borderBottom:
                      theme.palette.mode === "dark"
                        ? "1px solid #444"
                        : "1px solid #eee",
                  })}
                >
                  <Typography
                    sx={(theme) => ({
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      color:
                        theme.palette.mode === "dark" ? "#90caf9" : "blue",
                    })}
                    onClick={() => openAttachment(file)}
                  >
                    {file.FileName}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <CloseIcon
                      fontSize="small"
                      sx={(theme) => ({
                        color: theme.palette.mode === "dark" ? "#ccc" : undefined,
                      })}
                    />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* MESSAGE TEXTAREA */}
        <Grid item xs={12}>
          <TextField
            label="Text"
            fullWidth
            multiline
            rows={4}
            {...register("UserText", { required: true })}
            disabled={!isCreatingNew && selectedNotification}
            sx={(theme) => ({
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(50,50,50,0.7)"
                    : "rgba(255,255,255,0.7)",
              },
              "& label": {
                color: theme.palette.mode === "dark" ? "#ccc" : undefined,
              },
            })}
          />
        </Grid>

              <Grid item xs={12}>
                {!isCreatingNew && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: { xs: "wrap", md: "nowrap" }, // stack on mobile, inline on desktop
                    }}
                  >
                    {/* REPLY BUTTON */}
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        borderRadius: "6px",
                        textTransform: "none",
                        backgroundColor: "#e0e0e0",
                        color: "#000",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          backgroundColor: "#d5d5d5",
                        },
                      }}
                      disabled={selectedRecipients.length > 0}
                    >
                      Reply
                      <input
                        type="button"
                        hidden
                        onClick={() => setReplyMode((p) => !p)}
                      />
                    </Button>

                    {/* RECIPIENT FIELD */}
                  <Box
  sx={(theme) => ({
    flex: 1,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    p: 1,
    border: theme.palette.mode === "dark"
      ? "1px solid #3a3a3b" // subtle border for dark
      : "1px solid #ddd",   // original light mode

    borderRadius: "6px",

    background:
      theme.palette.mode === "dark"
        ? "#2B2B2C"           // your required dark mode color
        : "#fafafa",          // original light mode background

    minHeight: "48px",
  })}
>

                      {/* Add Button */}
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: "6px",
                          textTransform: "none",
                          backgroundColor: "#e0e0e0",
                          color: "#000",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            backgroundColor: "#d5d5d5",
                          },
                        }}
                        disabled={replyMode === true}
                      >
                        Forward To
                        <input
                          type="button"
                          hidden
                          onClick={() => setOpenCopyForm(true)}
                        />
                      </Button>

                      {/* Chips */}
                      {selectedRecipients.map((user) => (
                        <Chip
                          key={user.DocEntry}
                          label={`${user.FirstName} ${user.LastName}`}
                          onDelete={() =>
                            setSelectedRecipients((prev) =>
                              prev.filter((u) => u.DocEntry !== user.DocEntry)
                            )
                          }
                         sx={(theme) => ({
                    borderRadius: "20px",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(144,202,249,0.2)"
                        : "#e6f2ff",
                    color:
                      theme.palette.mode === "dark"
                        ? "#90caf9"
                        : "#004c99",
                    fontWeight: 500,
                  })}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Inline Reply (only when replyMode is true) */}
              {replyMode && (
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    Reply (will be sent to the original sender)
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Type your reply here..."
                    {...register("ReplyText", { required: true })}
                    sx={{
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "6px",
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      mt: 2,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<CloseIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: "6px",
                        px: 1.2,
                        py: 0.3,
                        fontSize: "13px",
                        color: "#444",
                        "&:hover": {
                          background: "#f2f2f2",
                        },
                      }}
                      onClick={() => {
                        setReplyMode(false);
                        setValue("ReplyText", "");
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </DialogContent>
        {/* FOOTER */}
        <DialogActions
    sx={(theme) => ({
      px: 3,
      py: 2.5,
      borderTop:
        theme.palette.mode === "dark"
          ? "1px solid #444"
          : "1px solid #eee",
      background:
        theme.palette.mode === "dark"
          ? "rgba(40,40,40,0.9)"
          : "rgba(250,250,250,0.85)",
      backdropFilter: "blur(6px)",
    })}
  >
    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        endIcon={<SendIcon />}
        sx={(theme) => ({
          borderRadius: "12px",
          textTransform: "none",
          px: 4,
          py: 1.2,
          fontWeight: 600,
          letterSpacing: "0.3px",
          background:
            theme.palette.mode === "dark" ? "#1565c0" : "#1976D2",
          "&:hover": {
            background:
              theme.palette.mode === "dark" ? "#0d47a1" : "#145BA1",
          },
          boxShadow:
            theme.palette.mode === "dark"
              ? "0px 4px 12px rgba(0,0,0,0.6)"
              : "0px 4px 12px rgba(25,118,210,0.35)",
        })}
        onClick={handleCreateNotification}
      >
        Send
      </Button>
    </Box>
  </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyForm}
        // onClose={() => setOpenCopyForm(false)}
        scroll="paper"
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          width: "100%",
          minWidth: 400,
          maxWidth: 500,
          zIndex: 3000,
        }}
      >
        <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Select Recipient
          </Typography>

          <IconButton
            onClick={() => setOpenCopyForm(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider color="gray" />

        <DialogContent className="bg-light">
          {/* 🔎 Search Field */}
          <Grid item>
            <SearchInputField
              value={getListqueryCopyFrom}
              onChange={(e) => handleGetListSearchCopyFrom(e.target.value)}
              onClickClear={handleGetListClearCopyFrom}
            />
          </Grid>

          {/* 📜 Scrollable List */}
          <Grid
            container
            mt={0.5}
            width="100%"
            style={{
              height: "50vh",
              overflow: "auto",
              padding: 1,
              justifyContent: "center",
            }}
            id="getListForCreateScroll"
          >
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListUserData.length}
              next={fetchMoreGetListCopyFrom}
              hasMore={hasMoreUserList}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="getListForCreateScroll"
              endMessage={
                <Typography textAlign="center">No More Records</Typography>
              }
            >
              {getListUserData.map((item) => (
                <CardCopyFrom
                  key={item.DocEntry}
                  id={item.DocEntry}
                  title={`${item.FirstName} ${item.LastName}`}
                  searchResult={getListqueryCopyFrom}
                  checked={checkedItems[item.DocEntry] || false}
                  onClick={(e) => {
                    onClickCopyFrom(e, item, item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* FORWARD MODAL */}
    </>
  );
}
