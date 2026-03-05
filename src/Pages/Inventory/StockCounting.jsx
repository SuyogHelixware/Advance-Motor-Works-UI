import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DoNotDisturbAltSharpIcon from "@mui/icons-material/DoNotDisturbAltSharp";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select from "react-select";
import CardComponent from "../Components/CardComponent";

import SearchInputField from "../Components/SearchInputField";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { TabContext, TabPanel } from "@mui/lab";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import DataGridModal from "../Components/DataGridModal";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTextField,
  InputTimePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchModel from "../Components/SearchModel";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
export default function StockCounting() {
  const perms = usePermissions(90);
  const [tabvalue, settabvalue] = useState(0);
  const { user, warehouseData } = useAuth();
  const [clearCache, setClearCache] = useState(false);

  const theme = useTheme();
  const timeoutRef = useRef(null);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [formKey, setFormKey] = useState(0);
  const [selectedData, setSelectedData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);

  const PAGE_LIMIT = 100;
  let [ok, setok] = useState("OK");
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const [open, setOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  //===================================Row level bin location Acct STate======================================
  const [getListqueryAccount, setgetListqueryAccount] = useState("");
  const [getListSearchingAccount, setgetListSearchingAccount] = useState(false);
  const [getListDataAccount, setgetListDataAccount] = useState([]);
  const [getListPageAccount, setgetListPageAccount] = useState(0);
  const [hasMoreGetListAccount, sethasMoreGetListAccount] = useState(true);
  const [searchmodelOpenAccount, setsearchmodelOpenAccount] = useState(false);
  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);

  const [InvCRows, setInvCRows] = React.useState([]);

  const [openTeamCountQtyModal, setOpenTeamCountQtyModal] = useState(false);
  const [teamCountUomRows, setTeamCountUomRows] = useState([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(null);

  const [openIndividualCountQtyModal, setOpenIndividualCountQtyModal] =
    useState(false);
  const [individualCountUomRows, setIndividualCountUomRows] = useState([]);
  const [selectedIndividualIndex, setSelectedIndividualIndex] = useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const Openmenu = Boolean(anchorEl);
  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };

  const handleOnCloseDocument = async () => {
    try {
      const result = await Swal.fire({
        text: `Do You Want to Close "${currentData.DocNum}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Inventory Counting Not Closed",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      // API call
      const resp = await apiClient.put(
        `/InventoryCounting/Close/${currentData.DocEntry}`,
      );

      if (resp?.data?.success) {
        setOpenListData([]);
        fetchOpenListData(0);
        fetchClosedListData(0);
        ClearForm();

        Swal.fire({
          text: "Inventory Counting Closed",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Info",
          text: resp?.data?.message || "Unable to close Inventory Counting",
          icon: "info",
          toast: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Close Inventory Error:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true);
      const params = {
        Status: 1, // 1 = Open records
        Page: pageNum,
        Limit: 20,
      };

      if (searchTerm?.trim()) {
        params.SearchText = searchTerm.trim();
      }

      const response = await apiClient.get("/InventoryCounting", { params });

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        // API responded but success = false
        Swal.fire({
          title: "Info",
          text: response?.data?.message || "Failed to load open inventory list",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching open inventory list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch open inventory data. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
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

  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  //#endregion End Open  Tab

  const fetchClosedListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true);
      const params = {
        Status: 0, // 0 = Closed records
        Page: pageNum,
        Limit: 20,
      };

      if (searchTerm?.trim()) {
        params.SearchText = searchTerm.trim();
      }

      const response = await apiClient.get("/InventoryCounting", { params });

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        // API responded but success = false
        Swal.fire({
          title: "Info",
          text:
            response?.data?.message || "Failed to load closed inventory list",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching closed inventory list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch closed inventory data. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
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

  // Infinite scroll fetch more data
  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
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
  const FetchInvCList = async () => {
    try {
      setIsLoading(true); // 🔄 start loader

      const res = await apiClient.get("/Users/All");

      if (res?.data?.success) {
        const values = res.data.values ?? [];

        // Filter only active users
        const filteredResponse = values.filter(
          (item) => String(item.Status) === "1",
        );

        setInvCRows(filteredResponse);

        // Match logged-in user
        const matchedUser = filteredResponse.find(
          (item) => Number(item.DocEntry) === Number(user?.UserId),
        );

        if (matchedUser) {
          setValue("Taker1Id", [
            {
              value: Number(matchedUser.DocEntry),
              label: matchedUser.UserName,
              LineNum: 0,
            },
          ]);
        }
      } else {
        // API returned success = false
        Swal.fire({
          icon: "info",
          text: res?.data?.message || "Unable to load users data.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch users data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader (always runs)
    }
  };

  const initial = {
    DocNum: "",
    ObjType: "1470000065",
    Series: "",
    Status: "1",
    Time: dayjs(),
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    CountDate: dayjs(undefined).format("YYYY-MM-DD "),
    CountType: "1",
    TeamCount: "",
    IndvCount: [],
    Remarks: "",
    Taker1Id: (() => {
      const match = InvCRows.find(
        (row) => Number(row.DocEntry) === Number(user.UserId),
      );
      return match
        ? [
            {
              value: Number(match.DocEntry),
              label: match.UserName,
              LineNum: 0,
            },
          ]
        : [];
    })(),

    oLines: [],
    TeamCountingoLines: [],
    IndividualCountingoLines: [],
  };
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    clearErrors,
    unregister,
  } = useForm({
    defaultValues: initial,
  });
  const oLines = watch("oLines") || [];
  const currentData = getValues();

  const TeamCountingoLines = watch("TeamCountingoLines") || [];
  const IndividualCountingoLines = watch("IndividualCountingoLines") || [];
  const allFormData = getValues();
  const { isDirty } = useFormState({ control });

  const watchCountType = watch("CountType");
  const teamCountValue = watch("TeamCount");
  const IndCountValue = watch("IndvCount");
  const InvCountValue = watch("Taker1Id");

  const [visibilityModel, setVisibilityModel] = useState({
    CountDiff: watchCountType !== "1",
    CountDiffP: watchCountType !== "1",
    UomQty: watchCountType !== "2",
    CountQty: watchCountType !== "2",
  });
  const apiRef = useGridApiRef();
  const TeamApiRef = useGridApiRef();
  const IndividualApiRef = useGridApiRef();

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);

    //   const rowIndex = getValues("oLines").findIndex(
    //   (r) => r.id === params.id
    // )
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  // useEffect(() => {
  //   if (!oLines) return;

  //   // 🟢 When CountType = "1" (Individual only)
  //   if (watchCountType === "1") {
  //     oLines.forEach((line, index) => {
  //       const counted = line?.Counted;
  //       const countQty = line?.CountQty;

  //       // Auto-check if CountQty exists but not checked
  //       if (countQty && !counted) {
  //         setValue(`oLines.${index}.Counted`, true, { shouldDirty: true });
  //       }

  //       // Auto-uncheck if CountQty empty but checked
  //       if (!countQty && counted) {
  //         setValue(`oLines.${index}.Counted`, false, { shouldDirty: true });
  //       }
  //     });
  //   }

  //   // 🧹 When CountType = "2" (Team mode)
  //   if (watchCountType === "2") {
  //     const cleanedLines = oLines.map((line) => ({
  //       ...line,
  //       CountQty: 0,
  //       UomQty: 0,
  //       IndCountedQty: 0,
  //       IndUomCountedQty: 0,

  //     }));

  //     setValue("oLines", cleanedLines, { shouldDirty: true });
  //   }
  // }, [oLines, watchCountType]);
  useEffect(() => {
    if (watchCountType !== "1") return;
    const oLines = getValues("oLines") || [];
    oLines.forEach((row, index) => {
      const qty = row?.CountQty;

      // If empty → Counted must be false
      if (qty === "" || qty === null || qty === undefined || qty === "0") {
        setValue(`oLines.${index}.Counted`, false, { shouldDirty: true });
      } else {
        // If has value → Counted true
        setValue(`oLines.${index}.Counted`, true, { shouldDirty: true });
      }
    });
  }, [oLines, watchCountType]);

  useEffect(() => {
    if (watchCountType === "1") {
      const InvCountValue = watch("Taker1Id");
      const IndividualLines = getValues("IndividualCountingoLines") || [];

      // If CountType = 1 and user (Taker1Id) is empty, clear all user UOM values
      if (!InvCountValue || InvCountValue.length === 0) {
        const updatedLines = IndividualLines.map((line) => {
          // Remove all user-related fields at the line level
          const cleanedLine = { ...line };
          Object.keys(cleanedLine).forEach((key) => {
            if (key.endsWith("_CountedQty") || key.endsWith("_UomCountedQty")) {
              cleanedLine[key] = 0;
            }
          });

          // Clean nested UOM lines (IndividualCountUomLines)
          if (Array.isArray(cleanedLine.IndividualCountUomLines)) {
            cleanedLine.IndividualCountUomLines =
              cleanedLine.IndividualCountUomLines.map((uomLine) => {
                const cleanedUomLine = { ...uomLine };
                Object.keys(cleanedUomLine).forEach((key) => {
                  if (
                    key.endsWith("_CountedQty") ||
                    key.endsWith("_UomCountedQty")
                  ) {
                    cleanedUomLine[key] = "";
                  }
                });

                // Clear counter-specific user object
                if (cleanedUomLine.counters) {
                  cleanedUomLine.counters = {};
                }

                return cleanedUomLine;
              });
          }

          return cleanedLine;
        });
        const updatedOLines = oLines.map((line) => ({
          ...line,
          CountQty: line.InWhsQty || 0,
          Difference: 0,
          DiffPercen: 0,
          UomCode: "",
        }));
        setValue("oLines", updatedOLines);

        setValue("IndividualCountingoLines", updatedLines);
      }
    }
  }, [watchCountType, watch("Taker1Id")]);

  useEffect(() => {
    if (watchCountType === "1") return;
    const cleanupRemovedUsers = (lines, activeUsers, nestedKey) => {
      const activeNames = activeUsers.map((u) =>
        (u.label || "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase(),
      );

      console.log("🧹 CLEANUP START ---");
      console.log("➡ Active users:", activeUsers);
      console.log("➡ activeNames:", activeNames);
      console.log("➡ nestedKey:", nestedKey);

      const result = lines.map((line, lineIndex) => {
        const newLine = { ...line };
        // --- main line level keys ---
        Object.keys(newLine).forEach((k) => {
          if (
            k.endsWith("_CountedQty") ||
            k.endsWith("_UomCountedQty") ||
            k.endsWith("CountedQty")
          ) {
            let username;
            if (k.includes("_")) {
              username = k.split("_").slice(0, -1).join("_");
            } else {
              username = k
                .replace(/CountedQty$/, "")
                .replace(/UomCountedQty$/, "");
            }

            const cleanedUser = username
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9_]/g, "")
              .toLowerCase();

            if (!activeNames.includes(cleanedUser)) {
              delete newLine[k];
            }
          }

          if (
            nestedKey === "TeamCountUomLines" &&
            k === "TotalCountQty" &&
            activeNames.length === 0
          ) {
            newLine[k] = 0;
          }
        });

        // --- nested UOM level keys ---
        if (Array.isArray(newLine[nestedKey])) {
          newLine[nestedKey] = newLine[nestedKey].map((uom, uomIndex) => {
            const newUom = { ...uom };
            Object.keys(newUom).forEach((k) => {
              if (
                k.endsWith("_CountedQty") ||
                k.endsWith("_UomCountedQty") ||
                k.endsWith("CountedQty")
              ) {
                let username;
                if (k.includes("_")) {
                  username = k.split("_").slice(0, -1).join("_");
                } else {
                  username = k
                    .replace(/CountedQty$/, "")
                    .replace(/UomCountedQty$/, "");
                }

                const cleanedUser = username
                  .replace(/\s+/g, "_")
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase();

                if (!activeNames.includes(cleanedUser)) {
                  delete newUom[k];
                }
              }

              if (
                nestedKey === "TeamCountUomLines" &&
                k === "TeamCountedQty" &&
                activeNames.length === 0
              ) {
                newUom[k] = 0;
              }
            });
            return newUom;
          });
        }

        return newLine;
      });

      return result;
    };

    // ------------------------------
    const individualLines = getValues("IndividualCountingoLines") || [];
    const teamLines = getValues("TeamCountingoLines") || [];

    const cleanedInd = cleanupRemovedUsers(
      individualLines,
      IndCountValue || [],
      "IndividualCountUomLines",
    );
    const cleanedTeam = cleanupRemovedUsers(
      teamLines,
      teamCountValue || [],
      "TeamCountUomLines",
    );

    // ✅ Just update form data — don’t call handleSave here
    setValue("IndividualCountingoLines", cleanedInd, { shouldDirty: true });
    setValue("TeamCountingoLines", cleanedTeam, { shouldDirty: true });
  }, [IndCountValue, teamCountValue, InvCountValue, watchCountType]);

  useEffect(() => {
    if (watchCountType === "1") return; // skip for individual-only mode

    const oLines = getValues("oLines") || [];
    const teamLines = getValues("TeamCountingoLines") || [];
    const indLines = getValues("IndividualCountingoLines") || [];

    const teamUsers = Array.isArray(teamCountValue)
      ? teamCountValue.map((u) => u.label?.trim()).filter(Boolean)
      : [];

    const indUsers = Array.isArray(IndCountValue)
      ? IndCountValue.map((u) => u.label?.trim()).filter(Boolean)
      : [];

    // 🟢 Step 1: Recalculate Team Totals
    const updatedTeamLines = teamLines.map((line) => {
      if (!Array.isArray(line.TeamCountUomLines)) return line;

      const updatedUomLines = line.TeamCountUomLines.map((uom) => {
        let totalUom = 0;
        let totalQty = 0;

        teamUsers.forEach((member) => {
          const uomVal = parseFloat(uom[`${member}_UomCountedQty`] || 0);
          const qtyVal = parseFloat(uom[`${member}_CountedQty`] || 0);
          if (!isNaN(uomVal)) totalUom += uomVal;
          if (!isNaN(qtyVal)) totalQty += qtyVal;
        });

        return {
          ...uom,
          TeamUomCountedQty: parseFloat(totalUom.toFixed(4)),
          TeamCountedQty: parseFloat(totalQty.toFixed(4)),
        };
      });

      const totalCountQty = updatedUomLines.reduce(
        (sum, u) => sum + (parseFloat(u.TeamCountedQty) || 0),
        0,
      );

      return {
        ...line,
        TeamCountUomLines: updatedUomLines,
        TotalCountQty: parseFloat(totalCountQty.toFixed(4)),
      };
    });

    // 🟢 Step 2: Recalculate Individual Totals
    const updatedIndLines = indLines.map((line) => {
      if (!Array.isArray(line.IndividualCountUomLines)) return line;

      const updatedUomLines = line.IndividualCountUomLines.map((uom) => {
        let totalUom = 0;
        let totalQty = 0;

        indUsers.forEach((member) => {
          const uomVal = parseFloat(uom[`${member}_UomCountedQty`] || 0);
          const qtyVal = parseFloat(uom[`${member}_CountedQty`] || 0);
          if (!isNaN(uomVal)) totalUom += uomVal;
          if (!isNaN(qtyVal)) totalQty += qtyVal;
        });

        return {
          ...uom,
          IndUomCountedQty: parseFloat(totalUom.toFixed(4)),
          IndCountedQty: parseFloat(totalQty.toFixed(4)),
        };
      });

      const totalCountQty = updatedUomLines.reduce(
        (sum, u) => sum + (parseFloat(u.IndCountedQty) || 0),
        0,
      );

      return {
        ...line,
        IndividualCountUomLines: updatedUomLines,
        CountQty: parseFloat(totalCountQty.toFixed(4)),
      };
    });

    // 🟢 Step 3: Save updated team & individual lines
    setValue("TeamCountingoLines", updatedTeamLines, {
      shouldDirty: true,
      shouldValidate: false,
    });

    setValue("IndividualCountingoLines", updatedIndLines, {
      shouldDirty: true,
      shouldValidate: false,
    });

    // 🟢 Step 4: Unified Difference & Variance Calculation
    const updatedOLines = calculateCounterDiffs(
      oLines,
      updatedTeamLines,
      updatedIndLines,
    );

    setValue("oLines", updatedOLines, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [teamCountValue, IndCountValue, watchCountType, individualCountUomRows]);

  useEffect(() => {
    console.log(" ind users changed", IndCountValue);
    console.log(" team users changed", teamCountValue);
    console.log(" single users changed", InvCountValue);

    console.log(" oLines changed", oLines);
    console.log("⚡ teamcounting olines changed", TeamCountingoLines);
    console.log("⚡ Individual olines changed", IndividualCountingoLines);
  }, [oLines, TeamCountingoLines, IndividualCountingoLines]);

  useEffect(() => {
    setVisibilityModel((prev) => ({
      ...prev,
      CountDiff: watchCountType !== "1", // show if not type 1
      CountDiffP: watchCountType !== "1",
      UomQty: watchCountType !== "2",
      CountQty: watchCountType !== "2",
    }));
  }, [watchCountType]);

  //==============================================Individual Counting==================================
  const openIndividualCountQtyModalHandler = async (rowIndex, ugpEntry) => {
    try {
      setSelectedIndividualIndex(rowIndex);

      // Fetch UOMs specifically for this row
      await fetchIndividualCountUomByGroup(ugpEntry, rowIndex);

      setOpenIndividualCountQtyModal(true);
    } catch (error) {
      console.error("Error opening Individual Count modal:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to open Individual Count Qty modal.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const processIndividualCountingRowUpdate = (newRow, oldRow) => {
    const index = oldRow.id;
    const updatedLines = [...IndividualCountingoLines];
    updatedLines[index] = {
      ...updatedLines[index],
      ...newRow,
    };
    setValue("IndividualCountingoLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: true,
    });
    return newRow;
  };
  const handleIndividualCellKeyDown = (params, event) => {
    const api = IndividualApiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // Start edit mode if editable
    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    }
  };
  // const IndividualCountingColumns = useMemo(() => {
  //   const baseColumns = [
  //     {
  //       field: "srNo",
  //       headerName: "SR NO",
  //       width: 100,
  //       align: "center",
  //       headerAlign: "center",
  //       sortable: false,
  //       renderCell: (params) => <span>{params.id + 1}</span>,
  //     },
  //     { field: "ItemCode", headerName: "ITEM NO", width: 150 },
  //     {
  //       field: "ItemDesc",
  //       headerName: "ITEM DESC",
  //       width: 200,
  //       editable: true,
  //     },
  //     {
  //       field: "WHSCode",
  //       headerName: "WhsCode",
  //       width: 200,
  //       renderCell: (params) => {
  //         const index = params.row.id;
  //         return (
  //           <Controller
  //             name={`IndividualCountingoLines.${index}.WHSCode`}
  //             control={control}
  //             render={({ field }) => (
  //               <InputTextField
  //                 {...field}
  //                 value={field.value || ""}
  //                 InputProps={{
  //                   endAdornment: (
  //                     <InputAdornment position="end">
  //                       <IconButton
  //                         onClick={() => {
  //                           setValue("selectedRowIndex", index);
  //                           setWhscOpen(true);
  //                         }}
  //                         size="small"
  //                         color="primary"
  //                         style={{
  //                           backgroundColor: "green",
  //                           borderRadius: "10%",
  //                           color: "white",
  //                           padding: 2,
  //                         }}
  //                       >
  //                         <ViewListIcon />
  //                       </IconButton>
  //                     </InputAdornment>
  //                   ),
  //                 }}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: "BinEntry",
  //       headerName: "Bin Location",
  //       width: 250,
  //       renderCell: (params) => {
  //         const row = params.row;
  //         const isBinActive = row.BinActivat === "Y";
  //         return (
  //           <Controller
  //             name={`IndividualCountingoLines.${params.row.id}.BinEntry`}
  //             control={control}
  //             render={({ field }) => (
  //               <InputTextSearchButtonTable
  //                 readOnly
  //                 disabled={!isBinActive}
  //                 onClick={() => {
  //                   setValue("selectedRowIndex", params.row.id);
  //                   fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
  //                   setsearchmodelOpenAccount(true);
  //                 }}
  //                 {...field}
  //                 value={row.BinEntry || ""}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },
  //   ];

  //   // 🟩 Dynamically Add Member Columns
  //   const members = Array.isArray(IndCountValue)
  //     ? IndCountValue.map((user) => ({
  //         DocEntry: user.value,
  //         Name: user.label,
  //         LineNum: user.LineNum || 0,
  //       }))
  //     : [];

  //   const dynamicColumns = [];

  //   members.forEach((member) => {
  //     const memberName = member?.Name || "";

  //     const addDynamicCol = (type) => ({
  //       field: `${memberName}_${type}`,
  //       headerName: `${memberName.toUpperCase()} ${
  //         type === "UomCountedQty" ? "UOM COUNTED QTY" : "COUNTED QTY"
  //       }`,
  //       width: 180,
  //       renderCell: (params) => {
  //         const index = params.row.id;
  //         const row = params.row;
  //         const Disabled = row.UgpEntry === "-1" || row.UgpEntry === -1;
  //         return (
  //           <div className="keep-enabled">
  //             <Controller
  //               name={`IndividualCountingoLines.${index}.${memberName}_${type}`}
  //               control={control}
  //               render={({ field }) => (
  //                 <InputTextField
  //                   type="number"
  //                   {...field}
  //                   value={field.value || ""}
  //                   disabled
  //                   InputProps={{
  //                     endAdornment: (
  //                       <InputAdornment position="end">
  //                         <IconButton
  //                           onClick={() =>
  //                             openIndividualCountQtyModalHandler(
  //                               index,
  //                               row.UgpEntry,
  //                             )
  //                           }
  //                           size="small"
  //                           color="primary"
  //                           disabled={Disabled}
  //                           style={{
  //                             backgroundColor: Disabled ? "gray" : "green",
  //                             borderRadius: "10%",
  //                             color: "white",
  //                             padding: 2,
  //                           }}
  //                         >
  //                           <ViewListIcon />
  //                         </IconButton>
  //                       </InputAdornment>
  //                     ),
  //                   }}
  //                 />
  //               )}
  //             />
  //           </div>
  //         );
  //       },
  //     });

  //     dynamicColumns.push(addDynamicCol("UomCountedQty"));
  //     dynamicColumns.push(addDynamicCol("CountedQty"));
  //   });

  //   return [...baseColumns, ...dynamicColumns];
  // }, [IndCountValue, control]);
  const IndividualCountingColumns = useMemo(() => {
    const baseColumns = [
      {
        field: "srNo",
        headerName: "SR NO",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => <span>{params.id + 1}</span>,
      },
      { field: "ItemCode", headerName: "ITEM NO", width: 150 },
      {
        field: "ItemDesc",
        headerName: "ITEM DESC",
        width: 200,
      },
      {
        field: "WHSCode",
        headerName: "WhsCode",
        width: 200,
        renderCell: (params) => {
          const rowIndex = params.row.id;
          const hasValue = !!params.value;

          return (
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              tabIndex={0} // 🔥 important
              onKeyDown={(e) => {
                if (
                  !hasValue &&
                  (e.key === "Enter" ||
                    e.key === "F2" ||
                    e.key === " " ||
                    (e.key === "Tab" && !e.shiftKey))
                ) {
                  e.preventDefault();

                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
                }
              }}
              sx={{ outline: "none" }}
            >
              {/* value */}
              <Typography sx={{ flexGrow: 1 }} noWrap>
                {params.value || ""}
              </Typography>

              {/* icon at end */}
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
                }}
                sx={{
                  ml: "auto",
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  p: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "BinEntry",
        headerName: "Bin Location",
        width: 250,
        renderCell: (params) => {
          const row = params.row;
          const rowIndex = row.id;
          const isBinActive = row.BinActivat === "Y";
          const hasValue = !!params.value;

          return (
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              tabIndex={0} // 🔥 focusable
              onKeyDown={(e) => {
                if (
                  isBinActive &&
                  !hasValue &&
                  (e.key === "Enter" ||
                    e.key === "F2" ||
                    e.key === " " ||
                    (e.key === "Tab" && !e.shiftKey))
                ) {
                  e.preventDefault();

                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }
              }}
              sx={{ outline: "none" }}
            >
              {/* value */}
              <Typography sx={{ flexGrow: 1 }} noWrap>
                {params.value || ""}
              </Typography>

              {/* icon at end */}
              <IconButton
                size="small"
                disabled={!isBinActive}
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }}
                sx={{
                  ml: "auto",
                  backgroundColor: !isBinActive ? "gray" : "green",
                  color: "white",
                  borderRadius: "6px",
                  p: "4px",
                  "&:hover": {
                    backgroundColor: !isBinActive ? "gray" : "darkgreen",
                  },
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          );
        },
      },
    ];

    // Dynamically Add Member Columns without Controllers
    const members = Array.isArray(IndCountValue)
      ? IndCountValue.map((user) => ({
          DocEntry: user.value,
          Name: user.label,
          LineNum: user.LineNum || 0,
        }))
      : [];

    const dynamicColumns = [];

    members.forEach((member) => {
      const memberName = member?.Name || "";

      const addDynamicCol = (type) => ({
        field: `${memberName}_${type}`,
        headerName: `${memberName.toUpperCase()} ${
          type === "UomCountedQty" ? "UOM COUNTED QTY" : "COUNTED QTY"
        }`,
        width: 180,
        renderCell: (params) => {
          const index = params.row.id;
          const row = params.row;
          const Disabled = row.UgpEntry === "-1" || row.UgpEntry === -1;

          return (
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              gap={1}
              className="keep-enabled"
            >
              {/* value */}
              <Typography
                variant="body2"
                noWrap
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                {params.value || ""}
              </Typography>

              {/* icon ALWAYS at end */}
              <IconButton
                onClick={() =>
                  openIndividualCountQtyModalHandler(index, row.UgpEntry)
                }
                size="small"
                disabled={Disabled}
                sx={{
                  ml: "auto", // ⭐ key
                  backgroundColor: Disabled ? "gray" : "green",
                  color: "white",
                  borderRadius: "6px",
                  p: "4px",
                  "&:hover": {
                    backgroundColor: Disabled ? "gray" : "darkgreen",
                  },
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          );
        },
      });

      dynamicColumns.push(addDynamicCol("UomCountedQty"));
      dynamicColumns.push(addDynamicCol("CountedQty"));
    });

    return [...baseColumns, ...dynamicColumns];
  }, [IndCountValue]);

  const fetchIndividualCountUomByGroup = async (ugpEntry, rowIndex) => {
    try {
      const res = await apiClient.get(`/UGP/${ugpEntry}`);
      const response = res.data;

      if (response.success && response.values?.oLines) {
        const apiUoms = response.values.oLines.map((item, idx) => ({
          id: idx + 1,
          srNo: idx + 1,
          LineNum: item.LineNum,
          UomCode: item.UomCode,
          ItmsPerUnt: parseFloat(item.BaseQty) / parseFloat(item.AltQty),
          UomQty: 0,
          CountQty: 0,
          checked: false,
        }));

        // Get previous saved UOMs for this specific row/item
        const IndividualCountingoLines =
          getValues("IndividualCountingoLines") || [];
        const prevRows =
          IndividualCountingoLines[rowIndex]?.IndividualCountUomLines || [];

        // Map previous rows by UomCode for quick merge
        const prevMap = {};

        prevRows.forEach((row) => {
          if (row?.UomCode) prevMap[row.UomCode.trim().toUpperCase()] = row;
        });

        const merged = apiUoms.map((apiRow, idx) => {
          const key = apiRow.UomCode.trim().toUpperCase();
          const prev = prevMap[key];
          return {
            ...apiRow,
            ...(prev ? prev : {}),
            id: idx + 1,
            LineNum: apiRow.LineNum || prev?.LineNum || idx + 1,
          };
        });
        console.log("merged rows", merged);
        setIndividualCountUomRows(merged);
      } else {
        setIndividualCountUomRows([]);
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to fetch Individual Count UOMs.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      setIndividualCountUomRows([]);
    }
  };

  const IndvCountbaseColumns = [
    {
      field: "srNo",
      headerName: "SR NO",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
    },
    { field: "UomCode", headerName: "UOM CODE", width: 150 },
    { field: "ItmsPerUnt", headerName: "ITEMS PER UNIT", width: 150 },
  ];
  const IndividualCountQtyModalColumns = useMemo(() => {
    const columns = [...IndvCountbaseColumns];

    // 🧩 Determine which member list to use safely
    let members = [];
    if (watchCountType === "2") {
      members = Array.isArray(IndCountValue)
        ? IndCountValue.map((user) => ({
            DocEntry: user?.value ?? "",
            Name: user?.label?.trim() ?? "",
            LineNum: user?.LineNum ?? 0,
          }))
        : [];
    } else {
      members = Array.isArray(InvCountValue)
        ? InvCountValue.map((user) => ({
            DocEntry: user?.value ?? "",
            Name: user?.label?.trim() ?? "",
            LineNum: user?.LineNum ?? 0,
          }))
        : [];
    }

    // 🧹 Filter only valid names to avoid undefined
    members = members.filter(
      (m) => typeof m.Name === "string" && m.Name.length > 0,
    );
    console.log("🧩 Members Used for Dynamic Columns:", members);
    console.log(
      "🧾 Generated Dynamic Column Fields:",
      columns.map((c) => c.field),
    );

    // ✅ Helper to update totals per row
    const updateRowValues = (row, membersList, itemsPerUnit) => {
      let totalUom = 0;
      let totalQty = 0;

      membersList.forEach((m) => {
        const uomVal = parseFloat(row[`${m.Name}_UomCountedQty`] || 0);
        const qtyVal = parseFloat(row[`${m.Name}_CountedQty`] || 0);
        totalUom += !isNaN(uomVal) ? uomVal : 0;
        totalQty += !isNaN(qtyVal) ? qtyVal : 0;
      });

      row.TeamUomCountedQty = totalUom;
      row.TeamCountedQty = totalQty;
    };

    // ✅ Update individual field sync
    const syncFields = (member, index, type, value) => {
      setIndividualCountUomRows((prev) => {
        const updated = [...prev];
        const row = { ...updated[index] };
        const itemsPerUnit = parseFloat(row.ItmsPerUnt || 0);
        const val = value === "" ? null : parseFloat(value);

        if (type === "UOM") {
          row[`${member.Name}_UomCountedQty`] = val;
          row[`${member.Name}_CountedQty`] = val ? val * itemsPerUnit : "";
        } else {
          row[`${member.Name}_CountedQty`] = val;
          row[`${member.Name}_UomCountedQty`] = val ? val / itemsPerUnit : "";
        }

        updateRowValues(row, members, itemsPerUnit);
        updated[index] = row;
        return updated;
      });
    };

    // ✅ Create dynamic columns for each valid member
    members.forEach((member) => {
      const safeHeader =
        typeof member.Name === "string" && member.Name.trim().length > 0
          ? member.Name.toUpperCase()
          : "MEMBER";

      columns.push({
        field: `${member.Name}_UomCountedQty`,
        headerName: `${safeHeader} UOM COUNTED QTY`,
        width: 160,
        renderCell: (params) => {
          const index = params.row.id - 1;
          const value =
            individualCountUomRows[index]?.[`${member.Name}_UomCountedQty`] ??
            "";
          return (
            <InputTextField
              type="number"
              value={value}
              disabled={allFormData.Status === "0"}
              onChange={(e) => syncFields(member, index, "UOM", e.target.value)}
            />
          );
        },
      });

      columns.push({
        field: `${member.Name}_CountedQty`,
        headerName: `${safeHeader} COUNTED QTY`,
        width: 160,
        renderCell: (params) => {
          const index = params.row.id - 1;
          const value =
            individualCountUomRows[index]?.[`${member.Name}_CountedQty`] ?? "";
          return (
            <InputTextField
              type="number"
              value={value}
              onChange={(e) =>
                syncFields(member, index, "COUNTED", e.target.value)
              }
            />
          );
        },
      });
    });

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IndCountValue, InvCountValue, individualCountUomRows, watchCountType]);

  const handleSaveIndividualCountQtyModal = () => {
    try {
      const updatedUomLines = [...individualCountUomRows];
      const members = Array.isArray(IndCountValue)
        ? IndCountValue.map((user) => ({
            DocEntry: user.value,
            Name: user.label,
            LineNum: user.LineNum || 0,
          }))
        : [];

      const memberTotals = {};

      // âœ… Loop through all rows & members to sum up values
      for (const row of updatedUomLines) {
        for (const member of members) {
          const memberName = member?.Name || "";

          const uomKey = `${memberName}_UomCountedQty`;
          const qtyKey = `${memberName}_CountedQty`;
          const rawUomKey = `${memberName}_UomCountedQty`;
          const rawQtyKey = `${memberName}_CountedQty`;

          if (memberTotals[uomKey] === undefined) memberTotals[uomKey] = 0;
          if (memberTotals[qtyKey] === undefined) memberTotals[qtyKey] = 0;

          memberTotals[uomKey] +=
            parseFloat(row[uomKey] ?? row[rawUomKey]) || 0;
          memberTotals[qtyKey] +=
            parseFloat(row[qtyKey] ?? row[rawQtyKey]) || 0;
        }
      }

      // âœ… Get existing oLines
      const currentLines = getValues("IndividualCountingoLines");
      if (!Array.isArray(currentLines)) return;

      const index = selectedIndividualIndex;
      if (index >= 0 && index < currentLines.length) {
        const newLines = [...currentLines];
        const selectedLine = newLines[index];

        // Save updated UOM data
        newLines[index] = {
          ...selectedLine,
          IndividualCountUomLines: updatedUomLines,
          ...memberTotals,
        };

        // âœ… Handle count type = 1 (Individual)
        if (watchCountType === "1") {
          const updatedAllLines = newLines.map((line, i) => {
            let totalForUser = 0;
            if (Array.isArray(line.IndividualCountUomLines)) {
              for (const uom of line.IndividualCountUomLines) {
                for (const key of Object.keys(uom)) {
                  if (/_CountedQty$/i.test(key)) {
                    const val = parseFloat(uom[key]) || 0;
                    totalForUser += val;
                  }
                }
              }
            }
            return {
              ...line,
              CountQty: totalForUser.toString(),
            };
          });

          // update Individual lines
          setValue("IndividualCountingoLines", updatedAllLines, {
            shouldDirty: true,
          });

          // âœ… update oLines also
          const oLines = getValues("oLines") || [];
          const updatedOLines = oLines.map((line) => {
            const matchingIndLine = updatedAllLines.find(
              (ind) => ind.id === line.id,
            );

            if (matchingIndLine) {
              const countQty = parseFloat(matchingIndLine.CountQty || 0);
              const inWhsQty = parseFloat(line.InWhsQty || 0);
              const difference = countQty - inWhsQty;

              let variancePercent = 0;
              if (inWhsQty !== 0) {
                variancePercent = (difference / inWhsQty) * 100;
              }

              // ✅ Determine UomCode based on additional users' values
              let uomCode = "";
              let ItmsPerUnt = "";
              if (Array.isArray(matchingIndLine.IndividualCountUomLines)) {
                const uomLinesWithValues =
                  matchingIndLine.IndividualCountUomLines.filter((uom) =>
                    Object.keys(uom).some(
                      (key) =>
                        /_CountedQty$/i.test(key) &&
                        uom[key] !== "" &&
                        uom[key] != null &&
                        uom[key] !== 0,
                    ),
                  );

                if (uomLinesWithValues.length > 1) {
                  uomCode = "Multiple UoMs";
                  ItmsPerUnt = "";
                } else if (uomLinesWithValues.length === 1) {
                  uomCode = uomLinesWithValues[0].UomCode || "";
                  ItmsPerUnt = uomLinesWithValues[0].ItmsPerUnt || "";
                }
              }

              return {
                ...line,
                CountQty: countQty.toString(),
                Difference: difference,
                DiffPercen: variancePercent.toFixed(2),
                UomCode: uomCode,
                ItmsPerUnt: ItmsPerUnt,
              };
            }

            return line;
          });

          setValue("oLines", updatedOLines, { shouldDirty: true });
          console.log(
            "✅ oLines updated with CountQty & UomCode:",
            updatedOLines,
          );
        } else {
          // For type 2
          setValue("IndividualCountingoLines", newLines, { shouldDirty: true });
        }
      }

      setOpenIndividualCountQtyModal(false);
      handleTeamOrIndividualUpdate();
    } catch (err) {
      console.error("Error saving individual count:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to save Individual Count Qty data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleQtyChange = async (index, value) => {
    const CountQtyRaw = value;
    const InWhsQtyRaw = getValues(`oLines.${index}.InWhsQty`);

    // Helper to safely parse numeric values (removes INR, commas, etc.)
    const parseNumber = (raw) => {
      if (raw === "" || raw === null || raw === undefined) return null;
      const cleaned = raw.toString().replace(/[^\d.-]/g, "");
      return cleaned === "" ? null : parseFloat(cleaned);
    };

    const CountQty = parseNumber(CountQtyRaw);
    const InWhsQty = parseNumber(InWhsQtyRaw);

    // 🧩 Handle variance & percentage only if InWhsQty is valid
    if (InWhsQty !== null && !isNaN(InWhsQty)) {
      const Difference = CountQty - InWhsQty;
      const variancePer =
        InWhsQty !== 0 ? ((Difference / InWhsQty) * 100).toFixed(6) : "";

      setValue(`oLines.${index}.Difference`, Difference.toFixed(6));
      setValue(`oLines.${index}.DiffPercen`, variancePer);
    } else {
      // If no InWhsQty → clear only variance fields
      setValue(`oLines.${index}.Difference`, "");
      setValue(`oLines.${index}.DiffPercen`, "");
    }

    // 🔁 Recalculate price after quantity change
    // try {
    //   await updatePrices({ mode: "row", targetRowIndex: index });
    // } catch (error) {
    //   console.error("❌ Error running updatePrices:", error);
    // }
  };
  const processRowUpdate = async (newRow, oldRow) => {
    const index = newRow.id;

    // Sync edited row back to RHF
    setValue(`oLines.${index}`, newRow, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // ✅ Counted auto toggle
    if (watchCountType === "1" && newRow.CountQty !== oldRow.CountQty) {
      setValue(`oLines.${index}.Counted`, !!newRow.CountQty);
    }

    // ✅ Quantity math
    if (newRow.CountQty !== oldRow.CountQty) {
      await handleQtyChange(index, newRow.CountQty);
    }

    return newRow;
  };
  const handleTeamCellKeyDown = (params, event) => {
    const api = TeamApiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // Start edit mode if editable
    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    }
  };
  //============================================Team Counting=============================================
  // ✅ Optimized SAVE handler
  const handleSaveTeamCountQtyModal = () => {
    try {
      let totalCountedQty = 0;
      const updatedUomLines = [];

      // 1️⃣ Calculate total counted quantity
      for (let i = 0; i < teamCountUomRows.length; i++) {
        const row = teamCountUomRows[i];
        const qty = parseFloat(row.TeamCountedQty) || 0;
        totalCountedQty += qty;
        updatedUomLines.push({ ...row });
      }

      const currentTeamLines = getValues("TeamCountingoLines");
      const currentOLines = getValues("oLines");

      if (!Array.isArray(currentTeamLines) || !Array.isArray(currentOLines))
        return;

      const index = selectedTeamIndex; // ✅ correct item index
      if (index >= 0 && index < currentTeamLines.length) {
        const updatedTeamLine = {
          ...currentTeamLines[index],
          TotalCountQty: parseFloat(totalCountedQty.toFixed(4)),
          TeamCountUomLines: updatedUomLines,
        };

        const newTeamLines = [...currentTeamLines];
        newTeamLines[index] = updatedTeamLine;

        // ✅ Update Team Counting Lines
        setValue("TeamCountingoLines", newTeamLines, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // 2️⃣ Update matching oLines CountQty field based on ItemCode
        if (watchCountType === "2") {
          const updatedOLines = currentOLines.map((line) =>
            line.ItemCode === updatedTeamLine.ItemCode
              ? { ...line, CountQty: updatedTeamLine.TotalCountQty }
              : line,
          );

          // ✅ Update oLines in form
          setValue("oLines", updatedOLines, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }

      // 3️⃣ Close modal and refresh view
      setOpenTeamCountQtyModal(false);
      handleTeamOrIndividualUpdate();
    } catch (err) {
      console.error("Error saving team count:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to save Team Count Qty data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const fetchTeamCountUomByGroup = async (ugpEntry, rowIndex) => {
    try {
      setIsLoading(true); // 🔄 start loader (if you have one)

      if (!ugpEntry && ugpEntry !== 0) {
        setTeamCountUomRows([]);
        return;
      }

      const res = await apiClient.get(`/UGP/${ugpEntry}`);
      const response = res?.data;

      if (response?.success && Array.isArray(response?.values?.oLines)) {
        const apiUoms = response.values.oLines.map((item, idx) => {
          const baseQty = Number(item?.BaseQty) || 0;
          const altQty = Number(item?.AltQty) || 1; // prevent divide-by-zero

          return {
            id: idx + 1,
            srNo: idx + 1,
            LineNum: item?.LineNum ?? idx + 1,
            UomCode: item?.UomCode ?? "",
            ItmsPerUnt: altQty ? baseQty / altQty : 0,
            UomQty: 0,
            CountQty: 0,
            checked: false,
          };
        });

        // Get previously saved values
        const teamCountingLines = getValues("TeamCountingoLines") ?? [];
        const prevRows = teamCountingLines[rowIndex]?.TeamCountUomLines ?? [];

        // Map previous rows by UomCode
        const prevMap = {};
        prevRows.forEach((row) => {
          if (row?.UomCode) {
            prevMap[row.UomCode.trim().toUpperCase()] = row;
          }
        });

        // Merge API rows with previous rows
        const merged = apiUoms.map((apiRow, idx) => {
          const key = apiRow.UomCode.trim().toUpperCase();
          const prev = prevMap[key];

          return {
            ...apiRow,
            ...(prev ?? {}),
            id: idx + 1,
            LineNum: apiRow.LineNum ?? prev?.LineNum ?? idx + 1,
          };
        });

        setTeamCountUomRows(merged);
      } else {
        setTeamCountUomRows([]);

        Swal.fire({
          icon: "info",
          text: response?.message || "No UOM data found for selected group.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Fetch Team Count UOM Error:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Team Count UOMs.",
        icon: "error",
        confirmButtonText: "Ok",
      });

      setTeamCountUomRows([]);
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const openTeamCountQtyModalHandler = async (rowIndex, ugpEntry) => {
    try {
      setSelectedTeamIndex(rowIndex);

      // Pass rowIndex to fetch function for merging previous values
      await fetchTeamCountUomByGroup(ugpEntry, rowIndex);

      setOpenTeamCountQtyModal(true);
    } catch (error) {
      console.error("Error opening Team Count modal:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to open Team Count Qty modal.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const baseColumns = [
    {
      field: "srNo",
      headerName: "SR NO",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
    },
    { field: "UomCode", headerName: "UOM CODE", width: 150 },
    { field: "ItmsPerUnt", headerName: "ITEMS PER UNIT", width: 150 },
    {
      field: "TeamUomCountedQty",
      headerName: "TEAM UOM COUNTED QTY",
      width: 160,
      renderCell: (params) => {
        const index = params.row.id - 1;
        return teamCountUomRows[index]?.TeamUomCountedQty ?? "";
      },
    },
    {
      field: "TeamCountedQty",
      headerName: "TEAM COUNTED QTY",
      width: 160,
      renderCell: (params) => {
        const index = params.row.id - 1;
        return teamCountUomRows[index]?.TeamCountedQty ?? "";
      },
    },
  ];
  const TeamCountQtyModalColumns = useMemo(() => {
    const columns = [...baseColumns];

    // ✅ Extract team member names safely
    const teamMembers = Array.isArray(teamCountValue)
      ? teamCountValue
          .map((user) => user?.label?.trim())
          .filter((label) => typeof label === "string" && label.length > 0)
      : [];

    // ✅ Helper to recalc total team quantities
    const updateTeamRowValues = (updatedRow, teamMembersList, itemsPerUnit) => {
      let totalUom = 0;
      let totalQty = 0;

      teamMembersList.forEach((member) => {
        const uomVal = parseFloat(updatedRow[`${member}_UomCountedQty`] || 0);
        const qtyVal = parseFloat(updatedRow[`${member}_CountedQty`] || 0);

        if (!isNaN(uomVal)) totalUom += uomVal;
        if (!isNaN(qtyVal)) totalQty += qtyVal;
      });

      updatedRow.TeamUomCountedQty = totalUom;
      updatedRow.TeamCountedQty = totalQty;
    };

    // ✅ Update one member’s value and recalc totals
    const syncTeamQtyFields = (member, index, fieldType, value) => {
      setTeamCountUomRows((prevRows) => {
        const updated = [...prevRows];
        const row = { ...updated[index] };
        const itemsPerUnit = parseFloat(row.ItmsPerUnt || 0);
        const val = value === "" ? null : parseFloat(value);

        if (fieldType === "UOM") {
          row[`${member}_UomCountedQty`] = val;
          row[`${member}_CountedQty`] =
            val != null && !isNaN(val) && itemsPerUnit
              ? val * itemsPerUnit
              : "";
        } else if (fieldType === "COUNTED") {
          row[`${member}_CountedQty`] = val;
          row[`${member}_UomCountedQty`] =
            val != null && !isNaN(val) && itemsPerUnit
              ? val / itemsPerUnit
              : "";
        }

        updateTeamRowValues(row, teamMembers, itemsPerUnit);
        updated[index] = row;
        return updated;
      });
    };

    // ✅ Dynamically create columns for each member
    teamMembers.forEach((member) => {
      const safeHeader =
        typeof member === "string" ? member.toUpperCase() : "MEMBER";

      // --- UOM COUNTED QTY ---
      columns.push({
        field: `${member}_UomCountedQty`,
        headerName: `${safeHeader} UOM COUNTED QTY`,
        width: 160,
        renderCell: (params) => {
          const index = params.row.id - 1;
          const value =
            teamCountUomRows[index]?.[`${member}_UomCountedQty`] ?? "";
          return (
            <InputTextField
              type="number"
              inputProps={{ maxLength: 19 }}
              value={value}
              onChange={(e) =>
                syncTeamQtyFields(member, index, "UOM", e.target.value)
              }
            />
          );
        },
      });

      // --- COUNTED QTY ---
      columns.push({
        field: `${member}_CountedQty`,
        headerName: `${safeHeader} COUNTED QTY`,
        width: 160,
        renderCell: (params) => {
          const index = params.row.id - 1;
          const value = teamCountUomRows[index]?.[`${member}_CountedQty`] ?? "";
          return (
            <InputTextField
              type="number"
              inputProps={{ maxLength: 19 }}
              value={value}
              onChange={(e) =>
                syncTeamQtyFields(member, index, "COUNTED", e.target.value)
              }
            />
          );
        },
      });
    });

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamCountValue, teamCountUomRows]);
  const processTeamCountingRowUpdate = (newRow, oldRow) => {
    const index = oldRow.id;

    const updatedLines = [...TeamCountingoLines];
    updatedLines[index] = {
      ...updatedLines[index],
      ...newRow,
    };

    setValue("TeamCountingoLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: true,
    });

    return newRow;
  };
  const isOpenKey = (e) =>
    e.key === "Enter" ||
    e.key === "F2" ||
    e.key === " " ||
    (e.key === "Tab" && !e.shiftKey);

  const TeamCountingColumns = useMemo(
    () => [
      {
        field: "srNo",
        headerName: "SR NO",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => params.id + 1,
      },
      { field: "ItemCode", headerName: "ITEM NO", width: 150 },
      {
        field: "ItemDesc",
        headerName: "ITEM DESC",
        width: 200,
      },
      {
        field: "WHSCode",
        headerName: "WhsCode",
        width: 200,
        renderCell: (params) => {
          const rowIndex = params.id;
          const hasValue = !!params.value;

          return (
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              tabIndex={0} // 🔥 focusable
              onKeyDown={(e) => {
                if (!hasValue && isOpenKey(e)) {
                  e.preventDefault();
                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
                }
              }}
              sx={{ outline: "none" }}
            >
              <Typography sx={{ flexGrow: 1 }} noWrap>
                {params.value || ""}
              </Typography>

              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
                }}
                sx={{
                  ml: "auto",
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  p: "4px",
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "BinEntry",
        headerName: "Bin Location",
        width: 250,
        editable: false,
        renderCell: (params) => {
          const row = params.row;
          const rowIndex = params.id;
          const disabled = row.BinActivat !== "Y";
          const hasValue = !!params.value;

          return (
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!disabled && !hasValue && isOpenKey(e)) {
                  e.preventDefault();
                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }
              }}
              sx={{ outline: "none" }}
            >
              <Typography sx={{ flexGrow: 1 }} noWrap>
                {params.value || ""}
              </Typography>

              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }}
                sx={{
                  ml: "auto",
                  backgroundColor: disabled ? "gray" : "green",
                  color: "white",
                  borderRadius: "6px",
                  p: "4px",
                  "&:hover": {
                    backgroundColor: disabled ? "gray" : "darkgreen",
                  },
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "TotalCountQty",
        headerName: "TOTAL COUNTED QTY",
        width: 180,
        // editable: true,

        renderCell: (params) => {
          const rowIndex = params.row.id;
          const disabled =
            params.row.UgpEntry === "-1" || params.row.UgpEntry === -1;

          const hasValue =
            params.row.TotalCountQty !== null &&
            params.row.TotalCountQty !== undefined &&
            params.row.TotalCountQty !== "";

          return (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === " " ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();

                  // ⌨️ keyboard opens ONLY when empty
                  if (disabled || hasValue) return;

                  openTeamCountQtyModalHandler(rowIndex, params.row.UgpEntry);
                }
              }}
              sx={{
                width: "100%",
                height: "100%",
                outline: "none",
              }}
            >
              {/* VALUE */}
              <Grid item sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13 }}
                  title={params.value || ""}
                >
                  {params.value || ""}
                </Typography>
              </Grid>

              {/* ICON */}
              <Grid item sx={{ width: 28, textAlign: "center" }}>
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={() =>
                    openTeamCountQtyModalHandler(rowIndex, params.row.UgpEntry)
                  }
                  sx={{
                    backgroundColor: disabled ? "gray" : "green",
                    color: "white",
                    borderRadius: "6px",
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: disabled ? "gray" : "darkgreen",
                    },
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        },
      },
    ],
    [],
  );

  // const TeamCountingColumns = useMemo(
  //   () => [
  //     {
  //       field: "srNo",
  //       headerName: "SR NO",
  //       width: 100,
  //       align: "center",
  //       headerAlign: "center",
  //       sortable: false,
  //       // renderCell: (params) =>
  //       renderCell: (params) => <span>{params.id + 1}</span>,
  //     },
  //     { field: "ItemCode", headerName: "ITEM NO", width: 150 },
  //     {
  //       field: "ItemDesc",
  //       headerName: "ITEM DESC",
  //       width: 200,
  //       editable: true,
  //     },

  //     {
  //       field: "WHSCode",
  //       headerName: "WhsCode",
  //       width: 200,
  //       sortable: false,
  //       editable: false,
  //       renderCell: (params) => {
  //         const index = params.row.id; // important: matches oLines[index]
  //         return (
  //           <Controller
  //             name={`TeamCountingoLines.${index}.WHSCode`} // ✅ correct path
  //             control={control}
  //             render={({ field, fieldState: { error } }) => (
  //               <InputTextField
  //                 {...field}
  //                 value={field.value || ""}
  //                 error={!!error}
  //                 helperText={error?.message}
  //                 InputProps={{
  //                   endAdornment: (
  //                     <InputAdornment position="end">
  //                       <IconButton
  //                         onClick={() => {
  //                           setValue("selectedRowIndex", index);
  //                           setWhscOpen(true);
  //                         }}
  //                         size="small"
  //                         color="primary"
  //                         style={{
  //                           backgroundColor: "green",
  //                           borderRadius: "10%",
  //                           color: "white",
  //                           padding: 2,
  //                         }}
  //                       >
  //                         <ViewListIcon />
  //                       </IconButton>
  //                     </InputAdornment>
  //                   ),
  //                 }}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: "BinEntry",
  //       headerName: "Bin Location",
  //       width: 250,
  //       editable: false,
  //       renderCell: (params) => {
  //         const row = params.row;
  //         const isBinActive = row.BinActivat === "Y";
  //         return (
  //           <Controller
  //             name={`TeamCountingoLines.${params.row.id}.BinEntry`}
  //             control={control}
  //             render={({ field }) => (
  //               <InputTextSearchButtonTable
  //                 readOnly
  //                 disabled={!isBinActive}
  //                 onClick={() => {
  //                   setValue("selectedRowIndex", params.row.id);
  //                   fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
  //                   setsearchmodelOpenAccount(true);
  //                 }}
  //                 {...field}
  //                 value={row.BinEntry || ""}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: "TotalCountQty",
  //       headerName: "TOTAL COUNTED QTY",
  //       width: 180,
  //       renderCell: (params) => {
  //         const index = params.row.id;
  //         const row = params.row;
  //         const Disabled = row.UgpEntry === "-1" || row.UgpEntry === -1;

  //         return (
  //           <div className="keep-enabled">
  //             <Controller
  //               name={`TeamCountingoLines.${index}.TotalCountQty`}
  //               control={control}
  //               render={({ field }) => (
  //                 <InputTextField
  //                   {...field}
  //                   value={field.value || ""}
  //                   disabled
  //                   InputProps={{
  //                     endAdornment: (
  //                       <InputAdornment position="end">
  //                         <IconButton
  //                           onClick={() =>
  //                             openTeamCountQtyModalHandler(index, row.UgpEntry)
  //                           }
  //                           size="small"
  //                           color="primary"
  //                           disabled={Disabled}
  //                           style={{
  //                             backgroundColor: Disabled ? "gray" : "green",
  //                             borderRadius: "10%",
  //                             color: "white",
  //                             padding: 2,
  //                           }}
  //                         >
  //                           <ViewListIcon />
  //                         </IconButton>
  //                       </InputAdornment>
  //                     ),
  //                   }}
  //                 />
  //               )}
  //             />
  //           </div>
  //         );
  //       },
  //     },
  //   ],
  //   [],
  // );

  //=====================================common for Individual and Team=============================
  // ---------- helper ----------
  const isPositiveNumber = (v) =>
    v !== "" &&
    v !== null &&
    v !== undefined &&
    !isNaN(Number(v)) &&
    Number(v) !== 0;

  // ---------- main updater ----------
  const handleTeamOrIndividualUpdate = () => {
    if (watchCountType !== "2") return;

    // ✅ Always ensure arrays
    const oLines = Array.isArray(getValues("oLines"))
      ? getValues("oLines")
      : [];
    const teamLines = Array.isArray(getValues("TeamCountingoLines"))
      ? getValues("TeamCountingoLines")
      : [];
    const individualLines = Array.isArray(getValues("IndividualCountingoLines"))
      ? getValues("IndividualCountingoLines")
      : [];

    // 🧮 Calculate main diffs for oLines
    const updatedOLines = calculateCounterDiffs(
      oLines,
      teamLines,
      individualLines,
    );

    // 🧮 Also update team & individual lines with those 4 values
    const updatedTeamLines = teamLines.map((team) => {
      const match = updatedOLines.find((line) => line.id === team.id);
      if (!match) return team;
      return {
        ...team,
        CountDiff: match.CountDiff,
        CountDiffP: match.CountDiffP,
        Difference: match.Difference,
        DiffPercen: match.DiffPercen,
      };
    });

    const updatedIndividualLines = individualLines.map((ind) => {
      const match = updatedOLines.find((line) => line.id === ind.id);
      if (!match) return ind;
      return {
        ...ind,
        CountDiff: match.CountDiff,
        CountDiffP: match.CountDiffP,
        Difference: match.Difference,
        DiffPercen: match.DiffPercen,
      };
    });

    // ✅ Now auto-check logic
    const autoCheckedOLines = updatedOLines.map((line, index) => {
      const teamLine =
        updatedTeamLines.find((t) => String(t.id) === String(line.id)) ||
        updatedTeamLines[index];
      const indLine =
        updatedIndividualLines.find((i) => String(i.id) === String(line.id)) ||
        updatedIndividualLines[index];

      // --- INDIVIDUAL ---
      const indKeys = indLine
        ? Object.keys(indLine).filter((k) => k.endsWith("_CountedQty"))
        : [];
      const individualCounts = indKeys.map((key) => Number(indLine[key]) || 0);
      const hasIndividualUsers = indKeys.length > 0;
      const allIndividualCounted =
        hasIndividualUsers &&
        individualCounts.every((v) => isPositiveNumber(v));

      // --- TEAM ---
      const teamHasUsers =
        Array.isArray(teamLine?.TeamCountUomLines) &&
        teamLine.TeamCountUomLines.length > 0;
      const anyTeamCounted = teamHasUsers
        ? teamLine.TeamCountUomLines.some((u) =>
            isPositiveNumber(u.TeamCountedQty),
          )
        : isPositiveNumber(teamLine?.TotalCountQty);

      // ✅ AUTO CHECK RULE
      const shouldBeChecked =
        (hasIndividualUsers && allIndividualCounted) ||
        (teamHasUsers && anyTeamCounted);

      return {
        ...line,
        Counted: shouldBeChecked,
      };
    });

    // ✅ Update all in form
    setValue("oLines", autoCheckedOLines, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("TeamCountingoLines", updatedTeamLines, { shouldDirty: true });
    setValue("IndividualCountingoLines", updatedIndividualLines, {
      shouldDirty: true,
    });
  };
  // -----------------------------------------------------------------
  // ... existing code ...

  const calculateCounterDiffs = (oLines, teamLines, individualLines) => {
    const isNumeric = (val) => typeof val === "number" && !isNaN(val);
    const isNonZeroNumber = (v) => {
      const n = Number(v);
      return isNumeric(n) && n !== 0;
    };

    // Get expected individual users
    const indUsers = Array.isArray(IndCountValue)
      ? IndCountValue.map((u) => u.label?.trim()).filter(Boolean)
      : [];

    return (Array.isArray(oLines) ? oLines : []).map((line) => {
      const teamItem = (Array.isArray(teamLines) ? teamLines : []).find(
        (t) => String(t.id) === String(line.id),
      );
      const indItem = (
        Array.isArray(individualLines) ? individualLines : []
      ).find((i) => String(i.id) === String(line.id));

      const inWhsQty = Number(line.InWhsQty) || 0;

      // --- TEAM: include only if there is at least one NON-ZERO (positive or negative) TeamCountedQty ---
      const teamHasValidUomLines =
        Array.isArray(teamItem?.TeamCountUomLines) &&
        teamItem.TeamCountUomLines.some((u) =>
          isNonZeroNumber(u?.TeamCountedQty),
        );

      const teamTotal = teamHasValidUomLines
        ? Number(teamItem?.TotalCountQty) || 0
        : undefined; // ignore team if no non-zero counts

      // --- INDIVIDUAL: collect all available counts ---
      const indKeys = indItem
        ? Object.keys(indItem).filter((k) => k.endsWith("_CountedQty"))
        : [];
      const individualCountsRaw = indKeys.map((key) => {
        const val = Number(indItem[key]);
        return isNumeric(val) ? val : NaN;
      });
      const individualCounts = individualCountsRaw.filter(isNumeric); // only include valid numeric ones

      // Check if ALL expected users have their values present
      const allIndividualValuesPresent =
        indUsers.length > 0 &&
        indUsers.every((user) => {
          const key = `${user}_CountedQty`;
          return indItem && isNumeric(indItem[key]);
        });

      // --- Combine valid sources ---
      const allCounts = [
        ...individualCounts,
        ...(typeof teamTotal === "number" ? [teamTotal] : []),
      ].filter(isNumeric);

      // --- If nothing valid, fallback ---
      if (allCounts.length === 0) {
        const Difference = "0";
        const DiffPercen = "0.00";

        return {
          ...line,
          CountDiff: 0,
          CountDiffP: "0.00",
          Difference,
          DiffPercen,
          CountQty: 0,
          UomCode: "",
          Counted: false,
        };
      }

      const maxQty = Math.max(...allCounts);
      const minQty = Math.min(...allCounts);
      const CountDiff = maxQty - minQty;
      const CountDiffP =
        minQty !== 0
          ? ((CountDiff / Math.abs(minQty)) * 100).toFixed(6)
          : "0.00";

      // Only calculate Difference and DiffPercen if all individual users have values
      let Difference, DiffPercen;
      if (allIndividualValuesPresent) {
        const farthestVal = allCounts.reduce((prev, curr) =>
          Math.abs(curr - inWhsQty) > Math.abs(prev - inWhsQty) ? curr : prev,
        );
        Difference = farthestVal - inWhsQty;
        DiffPercen = inWhsQty
          ? ((Difference / inWhsQty) * 100).toFixed(6)
          : "0.00";
      } else {
        Difference = "0";
        DiffPercen = "0.00";
      }

      return {
        ...line,
        CountDiff,
        CountDiffP,
        Difference,
        DiffPercen,
        CountQty: allIndividualValuesPresent
          ? allCounts.reduce((prev, curr) =>
              Math.abs(curr - inWhsQty) > Math.abs(prev - inWhsQty)
                ? curr
                : prev,
            )
          : 0, // or some default, but since Difference is 0, maybe set to inWhsQty or 0
      };
    });
  };

  //==========================================================================================
  const clearCountingData = (index) => {
    try {
      const mainLines = getValues("oLines") || [];

      // ✅ For CountType 1
      if (watchCountType === "1") {
        const targetRow = mainLines[index];
        if (!targetRow) return;

        const updatedRow = {
          ...targetRow,
          CountQty: "",
          UomQty: "",
          Difference: "",
          DiffPercen: "",
          ItmsPerUnt: "",
          UomCode: "",
          DocTotal: "0.00",
          Counted: false,
          oInvPostUomsLines: (targetRow.oInvPostUomsLines || []).map((uom) => ({
            ...uom,
            UomQty: "",
            CountQty: "",
            checked: false,
          })),
          oInvPostUomsLinesChecked: [],
        };

        // ✅ Update only this row
        setValue(`oLines.${index}`, updatedRow, {
          shouldValidate: true,
          shouldDirty: true,
        });

        console.log(`Cleared CountQty & related fields for row ${index}`);
        return;
      }

      // ✅ For CountType 2
      if (watchCountType === "2") {
        const teamLines = getValues("TeamCountingoLines") || [];
        const indLines = getValues("IndividualCountingoLines") || [];

        // 1️⃣ Team lines
        if (teamLines[index]) {
          teamLines[index] = {
            ...teamLines[index],
            TotalCountQty: "",
            TeamCountUomLines: [],
          };
          setValue(`TeamCountingoLines.${index}`, teamLines[index]);
        }

        // 2️⃣ Individual lines
        if (indLines[index]) {
          const clearedIndRow = { ...indLines[index] };
          Object.keys(clearedIndRow).forEach((key) => {
            if (/_UomCountedQty$/.test(key) || /_CountedQty$/.test(key)) {
              clearedIndRow[key] = "";
            }
          });
          clearedIndRow.IndividualCountUomLines = [];
          setValue(`IndividualCountingoLines.${index}`, clearedIndRow);
        }

        // 3️⃣ Main oLines clear
        if (mainLines[index]) {
          const clearedMain = {
            ...mainLines[index],
            CountQty: "",
            UomQty: "",
            Difference: "",
            DiffPercen: "",
          };
          setValue(`oLines.${index}`, clearedMain);
        }

        handleTeamOrIndividualUpdate?.();

        console.log(`Cleared Team & Individual Count data for row ${index}`);
      }
    } catch (err) {
      console.error("Error clearing counting data:", err);
    }
  };
  const handleDeleteRow = (rowIndex) => {
    const oLines = getValues("oLines") || [];
    const teamLines = getValues("TeamCountingoLines") || [];
    const indvLines = getValues("IndividualCountingoLines") || [];

    const updatedOLines = oLines.filter((_, i) => i !== rowIndex);
    const updatedTeamLines = teamLines.filter((_, i) => i !== rowIndex);
    const updatedIndvLines = indvLines.filter((_, i) => i !== rowIndex);

    setValue("oLines", updatedOLines);
    setValue("TeamCountingoLines", updatedTeamLines);
    setValue("IndividualCountingoLines", updatedIndvLines);
  };

  const columns = useMemo(() => {
    const isType2 = watchCountType === "2";

    return [
      /* ================= SR NO ================= */
      {
        field: "srNo",
        headerName: "SR NO",
        width: 80,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => params.id + 1,
      },

      /* ================= ITEM ================= */
      { field: "ItemCode", headerName: "ITEM NO", width: 150 },
      {
        field: "ItemDesc",
        headerName: "ITEM DESC",
        width: 200,
        editable: true,
      },

      /* ================= FREEZE ================= */
      {
        field: "Freeze",
        headerName: "FREEZE",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Checkbox
            checked={!!params.value}
            onChange={(e) => {
              apiRef.current.updateRows([
                {
                  id: params.id,
                  Freeze: e.target.checked,
                },
              ]);
            }}
          />
        ),
      },

      /* ================= WHS CODE ================= */
      {
        field: "WHSCode",
        headerName: "WhsCode",
        width: 180,
        sortable: false,
        editable: false,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => {
          const rowIndex = params.row.id;
          const hasValue = !!params.row.WHSCode;

          return (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === " " ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();

                  // ⌨️ open ONLY if empty
                  if (hasValue) return;

                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
                }
              }}
              sx={{ width: "100%", height: "100%", outline: "none" }}
            >
              {/* VALUE */}
              <Grid item sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                  {params.row.WHSCode || ""}
                </Typography>
              </Grid>

              {/* ICON */}
              <Grid item sx={{ width: 28, textAlign: "center" }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setValue("selectedRowIndex", rowIndex);
                    setWhscOpen(true);
                  }}
                  sx={{
                    backgroundColor: "green",
                    color: "white",
                    borderRadius: "6px",
                    padding: "4px",
                    "&:hover": { backgroundColor: "darkgreen" },
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        },
      },

      /* ================= BIN LOCATION ================= */
      {
        field: "BinEntry",
        headerName: "Bin Location",
        width: 200,
        sortable: false,
        editable: false,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => {
          const rowIndex = params.row.id;
          const row = params.row;

          const disabled = row.BinActivat !== "Y";
          const hasValue = !!row.BinEntry;

          return (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === " " ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();

                  // ⌨️ open ONLY if empty & enabled
                  if (disabled || hasValue) return;

                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }
              }}
              sx={{ width: "100%", height: "100%", outline: "none" }}
            >
              {/* VALUE */}
              <Grid item sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                  {row.BinEntry || ""}
                </Typography>
              </Grid>

              {/* ICON */}
              <Grid item sx={{ width: 28, textAlign: "center" }}>
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={() => {
                    setValue("selectedRowIndex", rowIndex);
                    fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                    setsearchmodelOpenAccount(true);
                  }}
                  sx={{
                    backgroundColor: disabled ? "gray" : "green",
                    color: "white",
                    borderRadius: "6px",
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: disabled ? "gray" : "darkgreen",
                    },
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        },
      },

      /* ================= IN WHSE QTY ================= */
      {
        field: "InWhsQty",
        headerName: "IN WHSE QTY on COUNT DATE",
        width: 230,
        editable: false,
      },

      /* ================= COUNTED ================= */
      {
        field: "Counted",
        headerName: "COUNTED",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Checkbox
            checked={!!params.value}
            onChange={(e) => {
              const checked = e.target.checked;

              apiRef.current.updateRows([{ id: params.id, Counted: checked }]);

              if (!checked) {
                clearCountingData(params.id);
              }
            }}
          />
        ),
      },

      /* ================= UOM QTY ================= */
      {
        field: "UomQty",
        headerName: "UOM COUNTED QTY",
        width: 200,
        hide: watchCountType === "2",
        sortable: false,
        editable: false,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => {
          const rowIndex = params.row.id;

          const disabled =
            params.row.UgpEntry === "-1" || params.row.UgpEntry === -1;

          const hasValue =
            params.row.UomQty !== null &&
            params.row.UomQty !== undefined &&
            params.row.UomQty !== "";

          return (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === " " ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();

                  // ⌨️ keyboard ONLY when empty
                  if (disabled || hasValue) return;

                  openIndividualCountQtyModalHandler(
                    rowIndex,
                    params.row.UgpEntry,
                  );
                }
              }}
              sx={{ width: "100%", height: "100%", outline: "none" }}
            >
              {/* VALUE */}
              <Grid item sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13 }}
                  title={params.row.UomQty || ""}
                >
                  {params.row.UomQty || ""}
                </Typography>
              </Grid>

              {/* ICON */}
              <Grid item sx={{ width: 28, textAlign: "center" }}>
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={() =>
                    openIndividualCountQtyModalHandler(
                      rowIndex,
                      params.row.UgpEntry,
                    )
                  }
                  sx={{
                    backgroundColor: disabled ? "gray" : "green",
                    color: "white",
                    borderRadius: "6px",
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: disabled ? "gray" : "darkgreen",
                    },
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        },
      },

      /* ================= COUNT QTY ================= */
      {
        field: "CountQty",
        headerName: isType2 ? "TOTAL COUNTED QTY" : "COUNTED QTY",
        width: 160,
        editable: true,
        hide: watchCountType === "2",
      },

      /* ================= VARIANCE ================= */
      {
        field: "Difference",
        headerName: isType2 ? "MAX VARIANCE" : "VARIANCE",
        width: 150,
      },
      {
        field: "DiffPercen",
        headerName: isType2 ? "MAX VARIANCE (%)" : "VARIANCE (%)",
        width: 160,
      },

      /* ================= UOM ================= */
      {
        field: "UomCode",
        headerName: "UoM CODE",
        width: 120,
        editable: true,
      },
      {
        field: "ItmsPerUnt",
        headerName: "Items Per Unit",
        width: 150,
      },

      /* ================= COUNTERS DIFF ================= */
      {
        field: "CountDiff",
        headerName: "COUNTERS DIFF",
        width: 150,
        hide: watchCountType === "1",
      },
      {
        field: "CountDiffP",
        headerName: "COUNTERS DIFF %",
        width: 150,
        hide: watchCountType === "1",
      },

      /* ================= ACTION ================= */
      {
        field: "actions",
        headerName: "ACTION",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteRow(params.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ];
  }, [watchCountType]);

  //=============================================================================================
  const ClearForm = () => {
    reset({
      ...initial,
      oLines: [], // this already clears the lines
    });
    setFormKey((prev) => prev + 1);
    setSelectedRows([]);
    setSelectedData([]);
    // setOlineRows([]);
    setSaveUpdateName("SAVE");
    setItemCache({});
    settabvalue(0);
    clearFiles();

    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };
  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const { DocSeries } = useDocumentSeries(
    "1470000065",
    getValues("CountDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  useEffect(() => {
    fetchWhscGetListData(0);
    FetchInvCList();
    fetchOpenListData(0);
    fetchClosedListData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SearchModelCloseAccount = () => setsearchmodelOpenAccount(false);

  const handleGetListClearAccount = () => {
    setgetListqueryAccount("");
    setgetListSearchingAccount(false);
    setgetListPageAccount(0);
    setgetListDataAccount([]);
    fetchgetListDataAccount(0);
  };
  const handleGetListSearch2 = (res) => {
    setgetListqueryAccount(res);
    setgetListSearchingAccount(true);
    setgetListPageAccount(0);
    setgetListDataAccount([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataAccount(0, res);
    }, TimeDelay);
  };
  const fetchMoregetListDataAccount = () => {
    fetchgetListDataAccount(
      getListPageAccount + 1,
      getListSearchingAccount ? getListqueryAccount : "",
    );
  };
  const fetchgetListDataAccount = async (
    ItemCode,
    WHSCode,
    pageNum = 0,
    searchTerm = "",
  ) => {
    try {
      setIsLoading(true); // 🔄 start loader (if available)

      if (!ItemCode || !WHSCode) {
        setgetListDataAccount([]);
        sethasMoreGetListAccount(false);
        return;
      }

      const query = new URLSearchParams({
        Status: 1,
        Page: pageNum,
        Limit: 20,
        ItemCode,
        WHSCode,
      });

      if (searchTerm?.trim()) {
        query.append("SearchText", searchTerm.trim());
      }

      const url = `/BinLocationV2/GetByWHSCode?${query.toString()}`;
      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        sethasMoreGetListAccount(newData.length === 20);

        setgetListDataAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        setgetListPageAccount(pageNum);
      } else {
        Swal.fire({
          icon: "info",
          text:
            response?.data?.message ||
            "No bin locations found for the selected item and warehouse.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Bin Location:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch bin location data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectBinLocation = (item) => {
    const index = getValues("selectedRowIndex");

    // Pre-calculate values
    const InWhsQty = parseFloat(item.OnHand);
    const CountQty = InWhsQty; // since you assign both the same
    const isValid = !isNaN(CountQty) && !isNaN(InWhsQty) && InWhsQty !== 0;

    const Difference = isValid ? CountQty - InWhsQty : "";
    const variancePer = isValid
      ? ((Difference / InWhsQty) * 100).toFixed(6)
      : "";

    // ✅ Update only changed fields (minimal re-render)
    setValue(`oLines.${index}.BinDocEntry`, item.DocEntry); // for API payload
    setValue(`oLines.${index}.BinEntry`, item.BinCode);
    setValue(`oLines.${index}.InWhsQty`, item.OnHand);
    // setValue(`oLines.${index}.CountQty`, item.OnHand);
    setValue(`oLines.${index}.Difference`, Difference);
    setValue(`oLines.${index}.DiffPercen`, variancePer);

    setValue(`TeamCountingoLines.${index}.BinDocEntry`, item.DocEntry); // for API payload
    setValue(`TeamCountingoLines.${index}.BinEntry`, item.BinCode);
    setValue(`TeamCountingoLines.${index}.InWhsQty`, item.OnHand);
    // setValue(`TeamCountingoLines.${index}.CountQty`, item.OnHand);
    setValue(`TeamCountingoLines.${index}.Difference`, Difference);
    setValue(`TeamCountingoLines.${index}.DiffPercen`, variancePer);

    setValue(`IndividualCountingoLines.${index}.BinDocEntry`, item.DocEntry); // for API payload
    setValue(`IndividualCountingoLines.${index}.BinEntry`, item.BinCode);
    setValue(`IndividualCountingoLines.${index}.InWhsQty`, item.OnHand);
    // setValue(`IndividualCountingoLines.${index}.CountQty`, item.OnHand);
    setValue(`IndividualCountingoLines.${index}.Difference`, Difference);
    setValue(`IndividualCountingoLines.${index}.DiffPercen`, variancePer);
    setsearchmodelOpenAccount(false);
  };
  // ======================WHSCode Logic=============================
  const fetchWhscGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader (if you have one)

      let response;

      if (searchTerm?.trim()) {
        response = await apiClient.get(
          `/WarehouseV2/search/${searchTerm.trim()}/1/${pageNum}`,
        );
      } else {
        response = await apiClient.get(`/WarehouseV2/pages/1/${pageNum}`);
      }

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setWhsHasMoreGetList(newData.length === 20);

        setWhscGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text: response?.data?.message || "Failed to load warehouse list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch warehouse data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleWhscGetListSearch = (res) => {
    setWhsGetListQuery(res);
    setWhsGetListSearching(true);
    setWhsGetListPage(0);
    setWhscGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchWhscGetListData(0, res);
    }, 600);
  };
  const handleWhscGetListClear = () => {
    setWhsGetListQuery("");
    setWhsGetListSearching(true);
    setWhsGetListPage(0); // Reset page to 0
    setWhscGetListData([]); // Clear current data
    fetchWhscGetListData(0); // Fetch first page without search
  };
  const fetchWhscMoreGetListData = () => {
    fetchWhscGetListData(
      WhsgetListPage + 1,
      WhsgetListSearching ? WhsrgetListquery : "",
    );
    setWhsGetListPage((prev) => prev + 1);
  };
  const handleWhsSelect = async (selectedWhs) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = getValues("oLines") || [];
    const selectedRow = oLines[rowIndex];
    if (!selectedRow) return;

    const itemCode = selectedRow.ItemCode;
    if (!itemCode) {
      console.warn("❌ No ItemCode found for selected row");
      return;
    }

    try {
      // 🟡 Start loader
      setIsLoading(true);

      // 🧹 Step 1: Reset fields first
      setValue(`oLines.${rowIndex}.WHSCode`, selectedWhs.WHSCode);
      setValue(`oLines.${rowIndex}.BinEntry`, "");
      setValue(`oLines.${rowIndex}.InWhsQty`, "");
      setValue(`oLines.${rowIndex}.BinActivat`, selectedWhs.BinActivat ?? "");

      setValue(`TeamCountingoLines.${rowIndex}.WHSCode`, selectedWhs.WHSCode);
      setValue(`TeamCountingoLines.${rowIndex}.BinEntry`, "");
      setValue(`TeamCountingoLines.${rowIndex}.InWhsQty`, "");
      setValue(
        `TeamCountingoLines.${rowIndex}.BinActivat`,
        selectedWhs.BinActivat ?? "",
      );

      setValue(
        `IndividualCountingoLines.${rowIndex}.WHSCode`,
        selectedWhs.WHSCode,
      );
      setValue(`IndividualCountingoLines.${rowIndex}.BinEntry`, "");
      setValue(`IndividualCountingoLines.${rowIndex}.InWhsQty`, "");
      setValue(
        `IndividualCountingoLines.${rowIndex}.BinActivat`,
        selectedWhs.BinActivat ?? "",
      );

      // 🟢 Step 2: Fetch item details from API
      const response = await apiClient.get(
        `/ItemsV2?SearchText=${encodeURIComponent(itemCode)}`,
      );

      if (response?.data?.success && Array.isArray(response.data.values)) {
        const itemData = response.data.values[0]; // usually one item returned

        if (itemData?.oInvntLines && Array.isArray(itemData.oInvntLines)) {
          // 🟣 Step 3: Find the warehouse record
          const matchedWhs = itemData.oInvntLines.find(
            (wh) => wh.WHSCode === selectedWhs.WHSCode,
          );

          // 🟢 Step 4: Update InWhsQty
          const inWhsQty = matchedWhs?.OnHand ?? "";
          setValue(`oLines.${rowIndex}.InWhsQty`, inWhsQty);
          setValue(`TeamCountingoLines.${rowIndex}.InWhsQty`, inWhsQty);
          setValue(`IndividualCountingoLines.${rowIndex}.InWhsQty`, inWhsQty);

          console.log(
            `✅ Warehouse ${selectedWhs.WHSCode} found, OnHand: ${inWhsQty}`,
          );
        } else {
          console.warn("⚠️ No oInvntLines found in response");
        }
      } else {
        console.warn("⚠️ Invalid response or item not found");
      }
      if (watchCountType === "1") {
        handleQtyChange(rowIndex, selectedRow.CountQty);
      } else if (watchCountType === "2") {
        const oLines = Array.isArray(getValues("oLines"))
          ? getValues("oLines")
          : [];
        const teamLines = Array.isArray(getValues("TeamCountingoLines"))
          ? getValues("TeamCountingoLines")
          : [];
        const individualLines = Array.isArray(
          getValues("IndividualCountingoLines"),
        )
          ? getValues("IndividualCountingoLines")
          : [];

        // 🧮 Calculate main diffs for oLines
        const updatedOLines = calculateCounterDiffs(
          oLines,
          teamLines,
          individualLines,
        );
        setValue("oLines", updatedOLines, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch warehouse data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      // 🟢 Stop loader
      setIsLoading(false);
      setWhscOpen(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    fetchItems(0, "");
  };
  const closeModel = () => {
    setOpen(false);
  };
  const modelColumns = [
    // {
    //   id: 1,
    //   field: "id",
    //   headerName: "Sr/No",
    //   width: 60,
    //   editable: true,
    // },
    {
      id: 1,
      field: "ItemCode",
      headerName: "Item Code",
      width: 150,
      editable: true,
    },
    {
      id: 2,
      field: "ItemName",
      headerName: "Item Description",
      width: 150,
      editable: true,
    },
    // {
    //   field: "QTY",
    //   headerName: "QUANTITY",
    //   width: 120,
    //   editable: true,
    // },
    // {
    //   field: "Price",
    //   headerName: "Price",
    //   width: 120,
    //   editable: true,
    // },
    {
      field: "DefaultWhs",
      headerName: "WHSCODE",
      width: 120,
      editable: true,
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 100,
      sortable: false,
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 100,
      sortable: false,
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 100,
      sortable: false,
    },
  ];
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/ItemsV2`, {
          params: {
            InventoryItem: "Y",
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: LIMIT,
          },
        });

        if (data.success) {
          const items = data.values || [];
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setItemList(items);
          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (error) {
        console.error("Error fetching Items list:", error);

        Swal.fire({
          title: "Error",
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to fetch Items data.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [itemCache],
  );
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText]);
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage],
  );

  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to page 0 on search
    setItemCache({}); // Clear cache on new search
  }, []);
  const handleCellClick = (newSelection) => {
    setSelectedRows((prevSelected) => {
      const map = new Map(prevSelected.map((item) => [item.DocEntry, item]));

      itemList.forEach((item) => {
        if (newSelection.includes(item.DocEntry)) {
          // ⭐ MATCHING LOCATION (same as first code)
          const matchingLoc = warehouseData.find(
            (row) => row.WHSCode === item.DefaultWhs,
          );

          const enrichedItem = {
            ...item,
            BinCode: matchingLoc?.BinCode ?? "",
            DftBinAbs: matchingLoc?.DftBinAbs ?? "",
            BinActivat: matchingLoc?.BinActivat ?? "",
          };

          map.set(item.DocEntry, enrichedItem); // Add or replace
        } else {
          map.delete(item.DocEntry); // Unselected → remove
        }
      });

      return Array.from(map.values());
    });
  };

  const onSubmit = () => {
    try {
      const existingOLines = getValues("oLines") || [];
      const existingIndividualLines =
        getValues("IndividualCountingoLines") || [];
      const existingTeamLines = getValues("TeamCountingoLines") || [];

      if (!selectedRows || selectedRows.length === 0) {
        closeModel();
        return;
      }
      console.log("selectedrows", selectedRows);
      // 🟩 1️⃣ Prepare new oLines from selected rows
      const newFormatted = selectedRows.map((item, index) => {
        const matchedInvLine = item.oInvntLines?.find(
          (inv) => inv.WHSCode === item.DefaultWhs,
        );
        const onHandFromInvnt = matchedInvLine?.OnHand ?? 0;

        // Avoid Infinity and invalid values
        const safeValue = (v) =>
          !v || v === Infinity || v === -Infinity || isNaN(v) ? 0 : v;

        return {
          id: `${item.ItemCode}_${Date.now()}_${index}`, // unique id even for duplicates
          ItemCode: item.ItemCode,
          ItemDesc: item.ItemName,

          WHSCode: item.DefaultWhs || "",
          Price: "",
          RawPrice: "",
          Currency: "",
          BinEntry: "",
          InWhsQty: safeValue(onHandFromInvnt),
          UgpEntry: item.UgpEntry,
          DocTotal: "",
          BinDocEntry: "",
          UomCode: item.UOMCode || "",
          CountQty: "",
          Difference: "0",
          DiffPercen: "0",
          CountDiff: "",
          CountDiffP: "",
          BinActivat: item.BinActivat,
          IUomEntry: item.IUoMEntry,
          Counted: false,
        };
      });

      // 🟩 2️⃣ Merge by simply appending (allow duplicates)
      const mergedOLines = [...existingOLines, ...newFormatted];

      // 🟩 3️⃣ Merge IndividualCountingoLines (allow duplicates too)
      const mergedIndividualLines = [
        ...existingIndividualLines,
        ...newFormatted.map((item) => ({
          ...item,
          MultipleCounterRole: "mcrIndividualCounter",
          IndividualCountUomLines: [],
        })),
      ];

      // 🟩 4️⃣ Merge TeamCountingoLines (allow duplicates too)
      const mergedTeamLines = [
        ...existingTeamLines,
        ...newFormatted.map((item) => ({
          ...item,
          MultipleCounterRole: "mcrTeamCounter",
          TeamCountUomLines: [],
        })),
      ];

      // 🟩 5️⃣ Update all form states safely
      setValue("oLines", mergedOLines, {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue("IndividualCountingoLines", mergedIndividualLines, {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue("TeamCountingoLines", mergedTeamLines, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // 🟩 6️⃣ Reset selection & close modal
      setSelectedRows([]);
      closeModel();

      console.log("✅ Final oLines:", mergedOLines);
      console.log("✅ Final IndividualCountingoLines:", mergedIndividualLines);
      console.log("✅ Final TeamCountingoLines:", mergedTeamLines);
    } catch (err) {
      console.error("❌ Error in onSubmit:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to add new items.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const setOldOpenData = async (DocEntry) => {
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
          setStockCountingData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setStockCountingData(DocEntry);
        setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const getBinActivat = (whsCode) => {
    const match = warehouseData?.find((w) => w.WHSCode === whsCode);
    return match?.BinActivat ?? "";
  };

  const setStockCountingData = async (DocEntry) => {
    if (!DocEntry) return;

    setIsLoading(true);
    setSelectedRows([]);
    setSelectedData([]);
    setItemCache({});
    setValue("oLines", []);
    setValue("TeamCountingoLines", []);
    setValue("IndividualCountingoLines", []);

    try {
      const response = await apiClient.get(
        `/InventoryCounting?DocEntry=${DocEntry}`,
      );
      const data = response.data?.values;
      if (!data) return;

      // ============================================================
      // ✅ 1. SORT RAW oLines BY VisOrder, MultipleCounterRole, CounterNum, ItmNum
      // ============================================================
      const sortedOLines = (data.oLines || []).sort((a, b) => {
        // Primary: VisOrder
        const visOrderA = Number(a.VisOrder || 0);
        const visOrderB = Number(b.VisOrder || 0);
        if (visOrderA !== visOrderB) return visOrderA - visOrderB;

        // Secondary: MultipleCounterRole (e.g., "mcrTeamCounter" before "mcrIndividualCounter")
        const roleA = a.MultipleCounterRole || "";
        const roleB = b.MultipleCounterRole || "";
        if (roleA !== roleB) return roleA.localeCompare(roleB);

        // Tertiary: CounterNum (from first oInvCounting2Lines)
        const counterNumA = Number(
          (a.oInvCounting2Lines || [])[0]?.CounterNum || 0,
        );
        const counterNumB = Number(
          (b.oInvCounting2Lines || [])[0]?.CounterNum || 0,
        );
        if (counterNumA !== counterNumB) return counterNumA - counterNumB;

        // Quaternary: ItmNum (from first oInvCounting2Lines)
        const itmNumA = Number((a.oInvCounting2Lines || [])[0]?.ItmNum || 0);
        const itmNumB = Number((b.oInvCounting2Lines || [])[0]?.ItmNum || 0);
        return itmNumA - itmNumB;
      });
      // ============================================================
      // ✅ 2. FORMAT MAIN oLines (unique by VisOrder)
      // ============================================================
      const seenVisOrders = new Set();
      const formattedOLines = sortedOLines
        .filter((line) => {
          const visOrder = line.VisOrder || line.ItemCode;
          if (seenVisOrders.has(visOrder)) return false;
          seenVisOrders.add(visOrder);
          return true;
        })
        .map((line, index) => ({
          ...line,
          id: index + 1,
          Counted: line.Counted === "Y",
          BinEntry: line.BinCode,
          BinActivat: getBinActivat(line.WHSCode),

          CountQty: Number(line.CountQty || 0),
          Difference: Number(line.Difference || 0),
          oInvCounting2Lines: (line.oInvCounting2Lines || []).map(
            (u, uIndex) => ({
              ...u,
              id: uIndex + 1,
              UomQty: Number(u.UomQty || 0),
              TeamUomQty: Number(u.TeamUomQty || 0),
              TeamCntQty: Number(u.TeamCntQty || 0),
              IndividualUomCountedQty: Number(u.IndividualUomQty || 0),
              IndividualCountedQty: Number(u.InvtQty || 0),
            }),
          ),
        }));

      // ============================================================
      // ✅ 3. GROUP SORTED LINES BY VisOrder AND MultipleCounterRole
      // ============================================================
      const groupedByVisOrder = {};
      sortedOLines.forEach((line) => {
        const visOrder = line.VisOrder || line.ItemCode;
        if (!groupedByVisOrder[visOrder]) {
          groupedByVisOrder[visOrder] = { team: [], individual: [] };
        }
        if (line.MultipleCounterRole === "mcrTeamCounter") {
          groupedByVisOrder[visOrder].team.push(line);
        } else if (line.MultipleCounterRole === "mcrIndividualCounter") {
          groupedByVisOrder[visOrder].individual.push(line);
        }
      });

      // ============================================================
      // ✅ 4. BUILD ITEM CACHE
      // ============================================================
      const itemCache = {};
      formattedOLines.forEach((line) => {
        itemCache[line.ItemCode] = line.oInvCounting2Lines || [];
      });

      // ============================================================
      // ✅ 5. RESTORE COUNTERS
      // ============================================================
      let IndvCount = [];
      let TeamCount = [];
      const rawIndvCount = data.oIndCountersLines || [];
      const rawTeamCount = data.oTeamCounterLines || [];

      if (data.CountType === "2" || data.CountType === 2) {
        IndvCount = rawIndvCount.map((c) => ({
          value: Number(c.CounterId),
          label: c.CounteName || "",
          LineNum: c.LineNum || 0,
          CounterNum: Number(c.CounterNum) || 0,
        }));
        TeamCount = rawTeamCount.map((c) => ({
          value: Number(c.CounterId),
          label: c.CounteName || "",
          LineNum: c.LineNum || 0,
          CounterNum: Number(c.CounterNum) || 0,
        }));
      }

      // ============================================================
      // ✅ 6. DETERMINE COUNT TYPE
      // ============================================================
      let CountType = data.CountType === "1" ? "1" : "2";
      let Taker1Id = [];

      if (CountType === "1" && data.Taker1Id) {
        const selectedUser = InvCRows.find(
          (user) => Number(user.DocEntry) === Number(data.Taker1Id),
        );
        if (selectedUser) {
          Taker1Id = [
            {
              value: Number(selectedUser.DocEntry),
              label: selectedUser.UserName,
            },
          ];
        } else {
          Taker1Id = [{ value: Number(data.Taker1Id), label: "" }];
        }
      }

      // ============================================================
      // ✅ 7. BUILD TEAM COUNTINGO LINES
      // ============================================================
      let TeamCountingoLines = [];
      Object.keys(groupedByVisOrder).forEach((visOrder, index) => {
        const teamLines = groupedByVisOrder[visOrder].team;
        if (teamLines.length === 0) return;

        const uomGrouped = {};
        teamLines.forEach((line) => {
          (line.oInvCounting2Lines || []).forEach((u) => {
            const key = `${u.ItmNum}_${u.ChildNum}`;
            if (!uomGrouped[key]) {
              uomGrouped[key] = { ...u, counters: {} };
            }
            const counterId = u.CounterID;
            const counter = TeamCount.find(
              (c) => Number(c.value) === Number(counterId),
            );
            if (counter) {
              const label = counter.label;
              uomGrouped[key].counters[label] = {
                UomCountedQty: Number(u.UomQty || 0),
                CountedQty: Number(
                  u.InvtQty || u.UomQty * Number(u.ItmsPerUnt || 1),
                ),
              };
            }
          });
        });

        const sortedUomLines = Object.values(uomGrouped).sort((a, b) => {
          if (a.ItmNum !== b.ItmNum) return a.ItmNum - b.ItmNum;
          return a.ChildNum - b.ChildNum;
        });

        const teamCountUomLines = sortedUomLines.map((u, idx) => {
          const dynamicFields = {};
          Object.keys(u.counters).forEach((label) => {
            dynamicFields[`${label}_UomCountedQty`] =
              u.counters[label].UomCountedQty;
            dynamicFields[`${label}_CountedQty`] = u.counters[label].CountedQty;
          });
          return {
            ...u,
            ...dynamicFields,
            id: idx + 1,
            ItmsPerUnt: Number(u.ItmsPerUnt || 1),
            checked: false,
          };
        });

        // ✅ Calculate totals
        let totalTeamUomQty = 0;
        let totalTeamCountQty = 0;

        teamCountUomLines.forEach((line) => {
          let rowUomTotal = 0;
          let rowCountTotal = 0;

          Object.keys(line).forEach((key) => {
            if (key.endsWith("_UomCountedQty")) {
              rowUomTotal += Number(line[key]) || 0;
            } else if (key.endsWith("_CountedQty")) {
              rowCountTotal += Number(line[key]) || 0;
            }
          });

          line.TeamUomCountedQty = Number(rowUomTotal.toFixed(4));
          line.TeamCountedQty = Number(rowCountTotal.toFixed(4));

          totalTeamUomQty += rowUomTotal;
          totalTeamCountQty += rowCountTotal;
        });

        const mainLine = teamLines[0];
        TeamCountingoLines.push({
          ...mainLine,
          id: index + 1,
          BinEntry: mainLine.BinCode,
          TeamCountUomLines: teamCountUomLines,
          TeamUomCountedQty: Number(totalTeamUomQty.toFixed(4)),
          TotalCountQty: Number(totalTeamCountQty.toFixed(4)),
        });
      });

      // 8️⃣ BUILD INDIVIDUAL COUNTINGO LINES
      let IndividualCountingoLines = [];
      Object.keys(groupedByVisOrder).forEach((visOrder, index) => {
        console.log(`Processing visOrder: ${visOrder}, index: ${index}`); // Print current visOrder
        const individualLines = groupedByVisOrder[visOrder].individual;
        console.log("individualLines:", individualLines); // Print individual lines for this visOrder
        if (!individualLines.length) return;

        const uomGrouped = {};
        individualLines.forEach((line) => {
          console.log("Processing line:", line); // Print each line
          (line.oInvCounting2Lines || []).forEach((u) => {
            console.log("Processing u:", u); // Print each u
            const key = `${u.ItmNum}_${u.ChildNum}`;
            if (!uomGrouped[key]) uomGrouped[key] = { ...u, counters: {} };
            console.log(
              "uomGrouped before counter assignment:",
              uomGrouped[key],
            ); // Print uomGrouped before
            const counterId = u.CounterID;
            console.log("counterId:", counterId); // Print counterId
            const counters = IndvCount.length > 0 ? IndvCount : Taker1Id;
            console.log("counters:", counters); // Print available counters

            let counter = null;
            if (CountType === "1" && counterId == null) {
              // For CountType "1", CounterID is null, so use the single Taker1Id as the counter
              counter = Taker1Id[0];
              console.log("Using Taker1Id counter for CountType 1:", counter); // Print assigned counter
            } else {
              counter = counters.find(
                (c) => Number(c.value) === Number(counterId),
              );
              console.log(
                "Found counter for CountType 2 or non-null CounterID:",
                counter,
              ); // Print found counter
            }

            if (counter) {
              console.log("Assigning to uomGrouped counters:", counter.label); // Print label
              uomGrouped[key].counters[counter.label] = {
                UomCountedQty: Number(u.UomQty || 0),
                CountedQty: Number(
                  u.InvtQty || u.UomQty * Number(u.ItmsPerUnt || 1),
                ),
              };
            }
            console.log(
              "uomGrouped after counter assignment:",
              uomGrouped[key],
            ); // Print uomGrouped after
          });
        });

        const sortedUomLines = Object.values(uomGrouped).sort(
          (a, b) => a.ItmNum - b.ItmNum || a.ChildNum - b.ChildNum,
        );

        const individualCountUomLines = sortedUomLines.map((u, idx) => {
          const dynamicFields = {};
          Object.keys(u.counters).forEach((label) => {
            console.log("Processing label:", label); // Print label
            // Use label as-is (do not sanitize)
            dynamicFields[`${label}_UomCountedQty`] = Number(
              u.counters[label].UomCountedQty || 0,
            );
            dynamicFields[`${label}_CountedQty`] = Number(
              u.counters[label].CountedQty || 0,
            );
            console.log(
              "Dynamic field added:",
              `${label}_UomCountedQty`,
              dynamicFields[`${label}_UomCountedQty`],
            ); // Print dynamic field
            console.log(
              "Dynamic field added:",
              `${label}_CountedQty`,
              dynamicFields[`${label}_CountedQty`],
            ); // Print dynamic field
          });

          return {
            ...u,
            ...dynamicFields,
            id: idx + 1,
            ItmsPerUnt: Number(u.ItmsPerUnt || 1),
            checked: false,
          };
        });

        // ⚡ CALCULATE TOTALS PER USER FOR MAIN LINE
        const userTotals = {};
        individualCountUomLines.forEach((u) => {
          Object.keys(u.counters || {}).forEach((label) => {
            if (!userTotals[label])
              userTotals[label] = { CountedQty: 0, UomCountedQty: 0 };
            userTotals[label].CountedQty += Number(
              u.counters[label].CountedQty || 0,
            );
            userTotals[label].UomCountedQty += Number(
              u.counters[label].UomCountedQty || 0,
            );
          });
        });

        const totalDynamicFields = {};
        Object.keys(userTotals).forEach((label) => {
          // Keep the original label
          totalDynamicFields[`${label}_CountedQty`] =
            userTotals[label].CountedQty;
          totalDynamicFields[`${label}_UomCountedQty`] =
            userTotals[label].UomCountedQty;
          console.log(
            "Total dynamic field:",
            `${label}_CountedQty`,
            totalDynamicFields[`${label}_CountedQty`],
          ); // Print total field
          console.log(
            "Total dynamic field:",
            `${label}_UomCountedQty`,
            totalDynamicFields[`${label}_UomCountedQty`],
          ); // Print total field
        });

        const mainLine = individualLines[0];
        IndividualCountingoLines.push({
          ...mainLine,
          id: index + 1,
          BinEntry: mainLine.BinCode,
          IndividualCountUomLines: individualCountUomLines,
          ...totalDynamicFields,
        });
      });

      // ============================================================
      // ✅ 9. RESTORE ATTACHMENTS IF ANY
      // ============================================================
      setFilesFromApi(data.AtcEntry);

      // ============================================================
      // ✅ 10. BUILD UPDATED FORM DATA
      // ============================================================
      const updatedData = {
        ...data,
        oLines: formattedOLines,
        IndividualCountingoLines,
        TeamCountingoLines,
        CountType,
        Taker1Id,
        IndvCount,
        TeamCount,
      };

      // ============================================================
      // ✅ 11. UPDATE FORM + UI
      // ============================================================
      toggleDrawer();
      reset(updatedData);
      setItemCache(itemCache);
      setValue("oLines", formattedOLines);
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
      const timeStr = data.Time; // "1111"

      if (timeStr && timeStr.length === 4) {
        const hours = parseInt(timeStr.slice(0, 2));
        const minutes = parseInt(timeStr.slice(2, 4));

        // ❗ Keep the date local and don't shift timezone
        const localTime = dayjs()
          .hour(hours)
          .minute(minutes)
          .second(0)
          .millisecond(0);

        setValue("Time", localTime.format()); // returns local ISO-like string
      }
      settabvalue(0);
    } catch (error) {
      console.error("Error fetching warehouse list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load Inventory Counting data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (data) => {
    try {
      //======================== Validate oLines ========================
      const teamArray = data.TeamCount || [];
      const IndvArray = data.IndvCount || [];
      const InvArray = data.Taker1Id || [];
      console.log("inv array", InvArray);
      if (data.CountType === "1") {
        // 🧩 Individual Counting must have one Inventory Counter
        if (!InvArray || InvArray.length === 0) {
          Swal.fire({
            title: "Validation!",
            text: "Please select at least one Inventory Counter.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // Stop further execution
        }
      } else if (data.CountType === "2") {
        // 🧩 Team Counting must have at least one team or individual counter
        if (teamArray?.length === 0 || IndvArray?.length === 0) {
          Swal.fire({
            title: "Validation!",
            text: "Please select at least one Team Counter and Individual Counter.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // Stop further execution
        }
      }

      //======================== Prepare Attachment FormData ========================
      const formData = new FormData();
      formData.append("DocEntry", allFormData.AtcEntry || "");
      formData.append("UserId", user.UserId);
      formData.append("CreatedBy", user.UserName);
      formData.append("ModifiedBy", user.UserName);
      formData.append("CreatedDate", dayjs().format("YYYY-MM-DD"));
      formData.append("ModifiedDate", dayjs().format("YYYY-MM-DD"));
      formData.append("Status", "1");

      fileData.forEach((fileRow, index) => {
        formData.append(
          `AttachmentLines[${index}].LineNum`,
          fileRow.LineNum === "0" ? "" : fileRow.LineNum,
        );
        formData.append(
          `AttachmentLines[${index}].DocEntry`,
          fileRow.DocEntry || "",
        );
        formData.append(`AttachmentLines[${index}].UserId`, user.UserId);
        formData.append(`AttachmentLines[${index}].CreatedBy`, user.UserName);
        formData.append(`AttachmentLines[${index}].ModifiedBy`, user.UserName);
        formData.append(
          `AttachmentLines[${index}].CreatedDate`,
          dayjs().format("YYYY-MM-DD"),
        );
        formData.append(
          `AttachmentLines[${index}].ModifiedDate`,
          dayjs().format("YYYY-MM-DD"),
        );
        formData.append(`AttachmentLines[${index}].Status`, "1");
        formData.append(
          `AttachmentLines[${index}].FileName`,
          fileRow.FileName.substring(0, fileRow.FileName.lastIndexOf(".")) ||
            fileRow.FileName,
        );
        formData.append(`AttachmentLines[${index}].FileExt`, fileRow.FileExt);
        formData.append(
          `AttachmentLines[${index}].Description`,
          fileRow.FileName,
        );
        formData.append(`AttachmentLines[${index}].SrcPath`, "");
        if (fileRow.File) {
          formData.append(`AttachmentLines[${index}].File`, fileRow.File);
        } else {
          console.warn(`No file found for row ${index}`);
        }
      });

      //======================== Upload Attachment if Exists ========================
      let attachmentDocEntry = null;
      if (fileData?.length > 0 && SaveUpdateName === "SAVE") {
        try {
          setIsLoading(true);
          const attachmentRes = await apiClient.post("/Attachment", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!attachmentRes.data.success) {
            Swal.fire({
              title: "Error!",
              text: attachmentRes.data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
            return;
          }

          attachmentDocEntry = attachmentRes.data.ID;
        } catch (err) {
          console.error("Attachment upload failed:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to upload attachments.",
            icon: "error",
            confirmButtonText: "Ok",
          });
          return;
        } finally {
          setIsLoading(false);
        }
      }

      //======================== Build Main Payload ========================
      const obj = {
        DocEntry: data.DocEntry || "",
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: "1",
        Series: String(data.Series) || "",
        CountDate: dayjs(data.CountDate || new Date()).format(
          "MM/DD/YYYY HH:mm:ss",
        ),
        Time: dayjs(data.Time).format("HHmm"),
        // Time:"0",
        CountType: data.CountType,
        Taker1Type: "12",
        Taker1Id:
          watchCountType === "1"
            ? InvArray.map((t) => t.value).join(",") || "0"
            : "",
        Taker2Type: data.Taker2Type || "0",
        Taker2Id: data.Taker2Id || "0",
        ObjType: "1470000065",
        TeamCount: String(teamArray?.length || 0),
        IndvCount: String(IndvArray?.length || 0),
        DiffQty: data.DiffQty || "0",
        DiffPercen: data.DiffPercen || "0",
        FinncPriod: String(data.FinncPriod || "0"),
        PIndicator: data.PIndicator || "0",
        DocNum: data.DocNum || "0",
        DocDate: dayjs(data.DocDate || new Date()).format("YYYY-MM-DD"),
        Remarks: data.Remarks || "",
        YearEndDt: dayjs().format("YYYY-MM-DD"),
        AtcEntry: data.AtcEntry || "0",

        // --- TEAM COUNTER SECTION ---
        oTeamCounterLines: (teamArray || []).map((team, i) => ({
          LineNum: team.LineNum || "",
          DocEntry: data.DocEntry || "",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: "1",
          CounterNum: String(i + 1),
          CounteType: "12",
          CounterId: String(team.value) || "", // ✅ user DocEntry
          CounteName: team.label || "", // ✅ user name
          VisOrder: String(i + 1),
          TeamCounterRole: "TMC", // optional
        })),

        // --- INDIVIDUAL COUNTER SECTION ---
        oIndCountersLines: (IndvArray || []).map((ind, i) => ({
          LineNum: ind.LineNum || "",
          DocEntry: data.DocEntry || "",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: "1",
          CounterNum: String(ind.CounterNum || i + 1),
          CounteType: "12",
          CounterId: String(ind.value) || "", // ✅ user DocEntry
          CounteName: ind.label || "",
          VisOrder: String(i + 1),
          IndCounterRole: "INC",
        })),
        oLines:
          data.CountType === "1"
            ? // Only individual counters
              (InvArray || []).flatMap((ind, indIndex) =>
                (data.oLines || []).map((line, i) => {
                  const itemIndData = (IndividualCountingoLines || []).find(
                    (itm) =>
                      itm.ItemCode === line.ItemCode &&
                      itm.WHSCode === line.WHSCode,
                  );

                  const uomLines = itemIndData?.IndividualCountUomLines || [];
                  const indKeyUom = `${ind.label}_UomCountedQty`;
                  const indKeyCount = `${ind.label}_CountedQty`;

                  const validUomLines = uomLines.filter((u) => {
                    const invtQty = u[indKeyCount] ?? 0;
                    const uomQty = u[indKeyUom] ?? 0;
                    return !(invtQty == 0 && uomQty == 0);
                  });
                  const sumInvtQty = validUomLines.reduce(
                    (sum, u) => sum + parseFloat(u[indKeyCount] || 0),
                    0,
                  );
                  return {
                    LineNum: line.LineNum || "",
                    DocEntry: data.DocEntry || "",
                    UserId: user.UserId || "",
                    CreatedBy: user.UserName || "",
                    CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                    ModifiedBy: user.UserName || "",
                    ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                    Status: "1",
                    ItemCode: line.ItemCode || "0",
                    ItemDesc: line.ItemDesc || "0",
                    Freeze: line.Freeze || "0",
                    WHSCode: line.WHSCode || "0",
                    InWhsQty: line.InWhsQty || "0",
                    Counted: line.Counted === true ? "Y" : "N",
                    CountQty: String(sumInvtQty || line.CountQty),
                    CountQtyT1: String(line.CountQtyT1 ?? 0),
                    CountQtyT2: String(line.CountQtyT2 ?? 0),
                    Remark: line.Remark || "0",
                    BarCode: line.BarCode || "0",
                    InvUoM: line.InvUoM || "0",
                    Difference: String(line.Difference || 0),
                    DiffPercen: String(line.DiffPercen || 0),
                    CountDate: dayjs(new Date()).format("MM/DD/YYYY HH:mm:ss"),
                    CountTime: dayjs(data.Time).format("HHmm"),
                    TargetRef: line.TargetRef || "0",
                    TargetType: line.TargetType || "0",
                    TargetEntr: line.TargetEntr || "0",
                    TargetLine: line.TargetLine || "0",
                    LineStatus: line.LineStatus || "0",
                    BinEntry: line.BinDocEntry || "0",
                    VisOrder: String(i + 1),
                    SuppCatNum: line.SuppCatNum || "0",
                    UgpEntry: line.UgpEntry || "0",
                    IUomEntry: line.IUomEntry || "0",
                    CountDiff: String(line.CountDiff ?? 0) || "0",
                    CountDiffP: String(line.CountDiffP ?? 0) || "0",
                    UomCode:
                      validUomLines.length > 1
                        ? "Multiple UoMs"
                        : line.UomCode || "",
                    UomQty: String(line.UomQty ?? 0) || "0",
                    MultipleCounterRole: "mcrIndividualCounter",
                    CounterID: String(ind.value) || "",
                    CounterNum: String(indIndex + 1),
                    CounterName: ind.label || "",

                    oInvCounting2Lines: validUomLines.map((u, idx) => ({
                      LineNum: u.LineNum || "",
                      DocEntry: data.DocEntry || "",
                      UserId: user.UserId || "",
                      CreatedBy: user.UserName || "",
                      CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      ModifiedBy: user.UserName || "",
                      ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      Status: "1",
                      ChildNum: String(idx + 1),
                      BarCode: u.BarCode || "0",
                      UomCode: u.UomCode || "0",
                      // TeamUomQty: String(u.TeamUomCountedQty ?? 0),
                      // TeamCntQty: String(u.TeamCountedQty ?? 0),
                      TeamUomQty: String(0),
                      TeamCntQty: String(0),
                      UomQty: String(u[indKeyUom] ?? 0),
                      InvtQty: String(u[indKeyCount] ?? 0),
                      CountQty: String(u[indKeyCount] ?? 0),
                      Tk1UomQty: String(u.Tk1UomQty ?? 0),
                      Tk2UomQty: String(u.Tk2UomQty ?? 0),
                      Tk1CntQty: String(u.Tk1CntQty ?? 0),
                      Tk2CntQty: String(u.Tk2CntQty ?? 0),
                      ItmsPerUnt: String(u.ItmsPerUnt ?? 0),
                      UgpEntry: line.UgpEntry || "0",
                      IndividualUomQty: String(u.IndividualUomCountedQty ?? 0),
                      IUomEntry: line.IUomEntry || "0",
                      ItmNum: String(i + 1),
                      CounterID: String(ind.value) || "",
                      CounterNum: String(indIndex + 1),
                      MultipleCounterRole: "mcrIndividualCounter",
                    })),
                  };
                }),
              )
            : // Keep full oLines (team + individual)
              [
                // 🔹 TEAM COUNTERS
                ...(teamArray || []).flatMap((team, tIndex) =>
                  (data.oLines || []).map((line, i) => {
                    const itemTeamData = (TeamCountingoLines || []).find(
                      (itm) =>
                        itm.ItemCode === line.ItemCode &&
                        itm.WHSCode === line.WHSCode,
                    );

                    const uomLines = itemTeamData?.TeamCountUomLines || [];
                    const teamKeyUom = `${team.label}_UomCountedQty`;
                    const teamKeyCount = `${team.label}_CountedQty`;
                    const validUomLines = uomLines.filter((u) => {
                      const invtQty = u[teamKeyCount] ?? 0;
                      const uomQty = u[teamKeyUom] ?? 0;
                      return !(invtQty == 0 && uomQty == 0);
                    });
                    const sumInvtQty = validUomLines.reduce(
                      (sum, u) => sum + parseFloat(u[teamKeyCount] || 0),
                      0,
                    );

                    return {
                      LineNum:
                        SaveUpdateName === "SAVE" ? "" : line.LineNum || "",
                      DocEntry: data.DocEntry || "",
                      UserId: user.UserId || "",
                      CreatedBy: user.UserName || "",
                      CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      ModifiedBy: user.UserName || "",
                      ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      Status: "1",
                      ItemCode: line.ItemCode || "0",
                      ItemDesc: line.ItemDesc || "0",
                      Freeze: line.Freeze || "0",
                      WHSCode: line.WHSCode || "0",
                      InWhsQty: line.InWhsQty || "0",
                      Counted: line.Counted === true ? "Y" : "N",
                      CountQty: String(sumInvtQty),
                      CountQtyT1: String(line.CountQtyT1 ?? 0),
                      CountQtyT2: String(line.CountQtyT2 ?? 0),
                      Remark: line.Remark || "0",
                      BarCode: line.BarCode || "0",
                      InvUoM: line.InvUoM || "0",
                      Difference: String(line.Difference ?? 0),
                      DiffPercen: String(line.DiffPercen ?? 0),
                      CountDate: dayjs(new Date()).format(
                        "MM/DD/YYYY HH:mm:ss",
                      ),
                      CountTime: dayjs(data.Time).format("HHmm"),
                      TargetRef: line.TargetRef || "0",
                      TargetType: line.TargetType || "0",
                      TargetEntr: line.TargetEntr || "0",
                      TargetLine: line.TargetLine || "0",
                      LineStatus: line.LineStatus || "0",
                      BinEntry: line.BinDocEntry || "0",
                      VisOrder: String(i + 1),
                      SuppCatNum: line.SuppCatNum || "0",
                      UgpEntry: line.UgpEntry || "0",
                      IUomEntry: line.IUomEntry || "0",
                      CountDiff: String(line.CountDiff ?? 0),
                      CountDiffP: String(line.CountDiffP ?? 0),
                      UomCode:
                        validUomLines.length > 1
                          ? "Multiple UoMs"
                          : line.UomCode || "0",
                      UomQty: String(line.UomQty ?? 0),
                      MultipleCounterRole: "mcrTeamCounter",
                      CounterID: String(team.value) || "",
                      CounterNum: String(tIndex + 1),
                      CounterName: team.label || "",

                      oInvCounting2Lines: validUomLines.map((u, idx) => ({
                        LineNum:
                          SaveUpdateName === "SAVE" ? "" : u.LineNum || "",
                        DocEntry: data.DocEntry || "",
                        UserId: user.UserId || "",
                        CreatedBy: user.UserName || "",
                        CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                        ModifiedBy: user.UserName || "",
                        ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                        Status: "1",
                        ChildNum: String(idx + 1),
                        BarCode: u.BarCode || "0",
                        UomCode: u.UomCode || "0",
                        UomQty: String(u[teamKeyUom] ?? 0),
                        InvtQty: String(u[teamKeyCount] ?? 0),
                        CountQty: String(u[teamKeyCount] ?? 0),
                        Tk1UomQty: String(u.Tk1UomQty ?? 0),
                        Tk2UomQty: String(u.Tk2UomQty ?? 0),
                        Tk1CntQty: String(u.Tk1CntQty ?? 0),
                        Tk2CntQty: String(u.Tk2CntQty ?? 0),
                        ItmsPerUnt: String(u.ItmsPerUnt ?? 0),
                        UgpEntry: line.UgpEntry || "0",
                        // TeamUomQty: String(u.TeamUomCountedQty ?? 0),
                        // TeamCntQty: String(u.TeamCountedQty ?? 0),
                        TeamUomQty: String(0),
                        TeamCntQty: String(0),
                        IUomEntry: line.IUomEntry || "0",
                        ItmNum: String(i + 1),
                        CounterID: String(team.value) || "",
                        CounterNum: String(tIndex + 1),
                        MultipleCounterRole: "mcrTeamCounter",
                      })),
                    };
                  }),
                ),

                // 🔹 INDIVIDUAL COUNTERS
                ...(IndvArray || []).flatMap((ind, indIndex) =>
                  (data.oLines || []).map((line, i) => {
                    const itemIndData = (IndividualCountingoLines || []).find(
                      (itm) =>
                        itm.ItemCode === line.ItemCode &&
                        itm.WHSCode === line.WHSCode,
                    );
                    const uomLines = itemIndData?.IndividualCountUomLines || [];
                    const indKeyUom = `${ind.label}_UomCountedQty`;
                    const indKeyCount = `${ind.label}_CountedQty`;
                    const validUomLines = uomLines.filter((u) => {
                      const invtQty = u[indKeyCount] ?? 0;
                      const uomQty = u[indKeyUom] ?? 0;
                      return !(invtQty == 0 && uomQty == 0);
                    });
                    const sumInvtQty = validUomLines.reduce(
                      (sum, u) => sum + parseFloat(u[indKeyCount] || 0),
                      0,
                    );

                    return {
                      LineNum:
                        SaveUpdateName === "SAVE" ? "" : line.LineNum || "",
                      DocEntry: data.DocEntry || "",
                      UserId: user.UserId || "",
                      CreatedBy: user.UserName || "",
                      CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      ModifiedBy: user.UserName || "",
                      ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                      Status: "1",
                      ItemCode: line.ItemCode || "0",
                      ItemDesc: line.ItemDesc || "0",
                      Freeze: line.Freeze || "0",
                      WHSCode: line.WHSCode || "0",
                      InWhsQty: line.InWhsQty || "0",
                      Counted: line.Counted === true ? "Y" : "N",
                      CountQty: String(sumInvtQty),
                      CountQtyT1: String(line.CountQtyT1 ?? 0),
                      CountQtyT2: String(line.CountQtyT2 ?? 0),
                      Remark: line.Remark || "0",
                      BarCode: line.BarCode || "0",
                      InvUoM: line.InvUoM || "0",
                      Difference: String(line.Difference ?? 0),
                      DiffPercen: String(line.DiffPercen ?? 0),
                      CountDate: dayjs(new Date()).format(
                        "MM/DD/YYYY HH:mm:ss",
                      ),
                      CountTime: dayjs(data.Time).format("HHmm"),
                      TargetRef: line.TargetRef || "0",
                      TargetType: line.TargetType || "0",
                      TargetEntr: line.TargetEntr || "0",
                      TargetLine: line.TargetLine || "0",
                      LineStatus: line.LineStatus || "0",
                      BinEntry: line.BinDocEntry || "0",
                      VisOrder: String(i + 1),
                      SuppCatNum: line.SuppCatNum || "0",
                      UgpEntry: line.UgpEntry || "0",
                      IUomEntry: line.IUomEntry || "0",
                      CountDiff: String(line.CountDiff ?? 0),
                      CountDiffP: String(line.CountDiffP ?? 0),
                      UomCode:
                        validUomLines.length > 1
                          ? "Multiple UoMs"
                          : line.UomCode || "0",
                      UomQty: String(line.UomQty ?? 0),
                      MultipleCounterRole: "mcrIndividualCounter",
                      CounterID: String(ind.value) || "",
                      CounterNum: String(indIndex + 1),
                      CounterName: ind.label || "",

                      oInvCounting2Lines: validUomLines.map((u, idx) => ({
                        LineNum:
                          SaveUpdateName === "SAVE" ? "" : u.LineNum || "",
                        DocEntry: data.DocEntry || "",
                        UserId: user.UserId || "",
                        CreatedBy: user.UserName || "",
                        CreatedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                        ModifiedBy: user.UserName || "",
                        ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                        Status: "1",
                        ChildNum: String(idx + 1),
                        BarCode: u.BarCode || "0",
                        UomCode: u.UomCode || "0",
                        UomQty: String(u[indKeyUom] ?? 0),
                        InvtQty: String(u[indKeyCount] ?? 0),
                        CountQty: String(u[indKeyCount] ?? 0),
                        Tk1UomQty: String(u.Tk1UomQty ?? 0),
                        Tk2UomQty: String(u.Tk2UomQty ?? 0),
                        Tk1CntQty: String(u.Tk1CntQty ?? 0),
                        Tk2CntQty: String(u.Tk2CntQty ?? 0),
                        ItmsPerUnt: String(u.ItmsPerUnt ?? 0),
                        UgpEntry: line.UgpEntry || "0",
                        // TeamUomQty: String(u.TeamUomCountedQty ?? 0),
                        // TeamCntQty: String(u.TeamCountedQty ?? 0),
                        TeamUomQty: String(0),
                        TeamCntQty: String(0),
                        IndividualUomQty: String(
                          u.IndividualUomCountedQty ?? 0,
                        ),
                        IUomEntry: line.IUomEntry || "0",
                        ItmNum: String(i + 1),
                        CounterID: String(ind.value) || "",
                        CounterNum: String(indIndex + 1),
                        MultipleCounterRole: "mcrIndividualCounter",
                      })),
                    };
                  }),
                ),
              ],
      };
      //======================== VALIDATE DUPLICATE oLines ========================
      if (obj.oLines && obj.oLines.length > 0) {
        const duplicateCheck = new Set();
        const duplicates = [];

        obj.oLines.forEach((line) => {
          const key = `${line.ItemCode}_${line.WHSCode}_${line.BinEntry}_${line.MultipleCounterRole}_${line.CounterID}`;
          if (duplicateCheck.has(key)) {
            duplicates.push(key);
          } else {
            duplicateCheck.add(key);
          }
        });

        if (duplicates.length > 0) {
          Swal.fire({
            title: "Warning !",
            text: "Duplicate line items found — same ItemCode, WHSCode, BinEntry, and MultipleCounterRole.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // ⛔ Stop further execution
        }
      }
      //======================== VALIDATE MISSING CountQty ========================
      if (obj.oLines && obj.oLines.length > 0) {
        const invalidIndex = obj.oLines.findIndex(
          (l) =>
            l.CountQty === "" ||
            l.CountQty === null ||
            l.CountQty === undefined ||
            isNaN(l.CountQty),
        );

        if (invalidIndex !== -1) {
          Swal.fire({
            title: "Warning !",
            text: `Row ${
              invalidIndex + 1
            } does not have CountQty. Please enter CountQty.`,
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // ⛔ Stop execution
        }
      }
      console.log("obj", obj);
      if (data.CountType === "2") {
        const oLinesRaw = obj.oLines || [];

        for (let i = 0; i < oLinesRaw.length; i++) {
          const line = oLinesRaw[i];

          // Check only Team Counter lines
          if (line.MultipleCounterRole === "mcrTeamCounter") {
            const qty = String(line.CountQty);

            if (qty === "0") {
              Swal.fire({
                title: "Warning !",
                text: `For Team Counter at row  ${
                  i + 1
                }, Total Counted Qty cannot be 0 or empty.`,
                icon: "warning",
                confirmButtonText: "Ok",
              });
              return; // ❌ Stop submission
            }
          }
        }
      }
      //======================== SAVE ========================
      if (SaveUpdateName === "SAVE") {
        try {
          setIsLoading(true);
          const res = await apiClient.post(`/InventoryCounting`, obj);
          if (res.data.success) {
            ClearForm();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setClearCache(true);

            Swal.fire({
              title: "Success!",
              text: "Inventory Posting saved Successfully",
              icon: "success",
              timer: 1000,
            });
          } else {
            if (attachmentDocEntry)
              await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
            });
          }
        } catch (err) {
          if (attachmentDocEntry)
            await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          console.error("InventoryPosting Save Error:", err);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong during save.",
            icon: "error",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        //======================== UPDATE ========================
        const confirm = await Swal.fire({
          text: `Do you want to update "${data.DocNum}"?`,
          icon: "question",
          showDenyButton: true,
          confirmButtonText: "YES",
          denyButtonText: "No",
        });

        if (confirm.isConfirmed) {
          try {
            setIsLoading(true);
            let attachmentDocEntry = data.AtcEntry || null;

            // If there are files and no existing attachment, POST first
            if (fileData?.length > 0 && data.AtcEntry === "0") {
              const attachmentRes = await apiClient.post(
                "/Attachment",
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                },
              );

              if (!attachmentRes.data.success) {
                setIsLoading(false);
                return Swal.fire({
                  title: "Error!",
                  text: attachmentRes.data.message,
                  icon: "error",
                  confirmButtonText: "Ok",
                });
              }

              attachmentDocEntry = attachmentRes.data.ID;
            }
            // If files exist and attachment already exists, PUT to update
            else if (fileData?.length > 0 && data.AtcEntry) {
              await apiClient.put(`/Attachment/${data.AtcEntry}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }

            obj.AtcEntry = attachmentDocEntry || "";

            const response = await apiClient.put(
              `/InventoryCounting/${data.DocEntry}`,
              obj,
            );

            if (response.data.success) {
              ClearForm();
              setOpenListPage(0);
              setOpenListData([]);
              fetchOpenListData(0);
              setClearCache(true);
              Swal.fire({
                title: "Success!",
                text: "Inventory Posting Updated",
                icon: "success",
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.message,
                icon: "error",
              });
            }
          } catch (err) {
            console.error("Update Error:", err);
            Swal.fire({
              title: "Error!",
              text: "Something went wrong during update.",
              icon: "error",
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          Swal.fire({
            text: "Inventory Posting Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Unexpected error occurred during form submission.",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } ,}}
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
          Inventory Counting List
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
            {/* <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="0" label="Open" />
                <Tab value="1" label="Closed" />
              </Tabs>

              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
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
                    backgroundColor: "#F5F6FA",
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
                      title={item.CardName}
                      subtitle={item.DocNum}
                      description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                      searchResult={openListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.CardCode,
                          item.CntctCode
                        )
                      }
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
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
                    onChange={(e) => handleClosedListSearch(e.target.value)}
                    value={closedListquery}
                    onClickClear={handleClosedListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={closedListData.length}
                  hasMore={hasMoreClosed}
                  next={fetchMoreClosedListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {closedListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.CardName}
                      subtitle={item.DocNum}
                      description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                      searchResult={closedListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.CardCode,
                          item.CntctCode
                        )
                      }
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext> */}
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
                          title={item.DocNum}
                          subtitle={
                            item.CountType === "1"
                              ? "Single Counter"
                              : "Multiple Counters"
                          }
                          description={dayjs(item.CountDate).format(
                            "DD/MM/YYYY",
                          )}
                          searchResult={query}
                          isSelected={selectedData === item.DocEntry}
                          onClick={() => setOldOpenData(item.DocEntry)}
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
      <Dialog open={openIndividualCountQtyModal} maxWidth="xl" fullWidth>
        <DialogTitle textAlign="center">
          Inventory Posting By UOM of Individual Counters
        </DialogTitle>
        <DialogContent>
          {selectedIndividualIndex !== null && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                mt: 2,
                fontSize: "14px",
              }}
            >
              <Grid container spacing={2}>
                {/* 🟩 Row 1 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Code: </strong>
                    {getValues(
                      `IndividualCountingoLines.${selectedIndividualIndex}.ItemCode`,
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Description: </strong>
                    {getValues(
                      `IndividualCountingoLines.${selectedIndividualIndex}.ItemDesc`,
                    )}
                  </Typography>
                </Grid>

                {/* 🟩 Row 2 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Warehouse Code: </strong>
                    {getValues(
                      `IndividualCountingoLines.${selectedIndividualIndex}.WHSCode`,
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>In WHSE Qty: </strong>
                    {getValues(
                      `IndividualCountingoLines.${selectedIndividualIndex}.InWhsQty`,
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <DataGrid
            className="datagrid-style"
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "red",
                fontWeight: "bold",
              },
              width: "100%",
              height: "60vh",
            }}
            // hideFooter
            getRowId={(row) => row.LineNum || row.id}
            columns={IndividualCountQtyModalColumns}
            rows={individualCountUomRows}
            getRowClassName={() =>
              allFormData.Status === "0" ? "disabled-row" : ""
            }
            pageSizeOptions={[PAGE_LIMIT]}
            loading={isLoading}
          />
          <Divider sx={{ mb: 2, borderColor: "#bbb" }} />
        </DialogContent>
        <DialogActions>
          <Grid container px={1} justifyContent="space-between">
            <Button
              variant="contained"
              color="success"
              sx={{ color: "white" }}
              onClick={handleSaveIndividualCountQtyModal}
              // disabled={SaveUpdateName === "UPDATE"}
            >
              SAVE
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setOpenIndividualCountQtyModal(false);
                setSelectedIndividualIndex(null);
              }}
            >
              CANCEL
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTeamCountQtyModal}
        // onClose={() => setUomModalOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle textAlign={"center"}>
          Inventory Posting By UOM of Team Counters
        </DialogTitle>
        <DialogContent>
          {selectedTeamIndex !== null && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                mt: 2,
                fontSize: "14px",
              }}
            >
              <Grid container spacing={2}>
                {/* 🟩 Row 1 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Code: </strong>
                    {getValues(
                      `TeamCountingoLines.${selectedTeamIndex}.ItemCode`,
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Description: </strong>
                    {getValues(
                      `TeamCountingoLines.${selectedTeamIndex}.ItemDesc`,
                    )}
                  </Typography>
                </Grid>

                {/* 🟩 Row 2 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Warehouse Code: </strong>
                    {getValues(
                      `TeamCountingoLines.${selectedTeamIndex}.WHSCode`,
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>In WHSE Qty: </strong>
                    {getValues(
                      `TeamCountingoLines.${selectedTeamIndex}.InWhsQty`,
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <DataGrid
            className="datagrid-style"
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "red",
                fontWeight: "bold",
              },
              width: "100%",
              height: "60vh",
            }}
            // hideFooter
            columns={TeamCountQtyModalColumns}
            rows={teamCountUomRows}
            getRowId={(row) => row.LineNum || row.id}
            getRowClassName={() =>
              allFormData.Status === "0" ? "disabled-row" : ""
            }
            // rowCount={olineRowCount}
            // paginationMode="server"
            // paginationModel={{
            //   pageSize: PAGE_LIMIT,
            //   page: olinePage,
            // }}
            // onPaginationModelChange={(model) =>
            //   setOlinePage(model.page)
            // }
            pageSizeOptions={[PAGE_LIMIT]}
            loading={isLoading}
          />
          <Divider sx={{ mb: 2, borderColor: "#bbb" }} />
        </DialogContent>
        <DialogActions>
          <Grid
            container
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
            <Grid item>
              <Button
                variant="contained"
                color="success"
                sx={{ color: "white" }}
                onClick={handleSaveTeamCountQtyModal}
                // disabled={SaveUpdateName === "UPDATE"}
              >
                SAVE
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setOpenTeamCountQtyModal(false);
                  setSelectedTeamIndex(null);
                }}
              >
                CANCEL
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>

      <SearchModel
        open={searchmodelOpenAccount}
        onClose={SearchModelCloseAccount}
        onCancel={SearchModelCloseAccount}
        title="BIN LOCATION"
        onChange={(e) => handleGetListSearch2(e.target.value)}
        value={getListqueryAccount}
        onClickClear={handleGetListClearAccount}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataAccount.length}
              next={fetchMoregetListDataAccount}
              hasMore={hasMoreGetListAccount}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="getListForCreateScroll"
              endMessage={
                <Typography textAlign={"center"}>No More Records</Typography>
              }
            >
              {getListDataAccount.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.BinCode}
                  // subtitle={item.AcctName}
                  // description={item.AcctName}
                  searchResult={getListqueryAccount}
                  onClick={() => handleSelectBinLocation(item)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="WAREHOUSE"
        onChange={(e) => handleWhscGetListSearch(e.target.value)}
        value={WhsrgetListquery}
        onClickClear={handleWhscGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={WhscgetListData.length}
            next={fetchWhscMoreGetListData}
            hasMore={WhshasMoreGetList}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {WhscgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={WhsrgetListquery}
                isSelected={
                  getValues(
                    `oLines.${getValues("selectedRowIndex")}.WHSCode`,
                  ) === item.WHSCode
                }
                onClick={() => handleWhsSelect(item)}
                // onClick={() => {
                //   selectWhSCode(
                //     item.WHSCode,
                //     // item.Location,
                //     // item.LocationName,
                //     // item.GSTRegnNo,
                //     // item.GSTType,
                //     // item.BalInvntAc
                //   );
                //   //  CloseVendorModel(); // Close after selection if needed
                // }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={onSubmit}
        // isLoading={itemList.length === 0 ? false : true}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        currentPage={currentPage}
        paginationMode="server"
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={getValues("oLines")}
      />
      {isLoading && <Loader open={isLoading} />}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
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
            aria-expanded={open ? "true" : undefined}
            onClick={handleClickCancelClosed}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              right: "50px",
              // color: "black",
              // mt: -1,
            }}
          >
            {/* <div> */}
            {/* <Button
              // aria-expanded={open ? "true" : undefined}
              //  disabled={SaveUpdateName ==== "SAVE"}

              color="inherit"
              sx={{
                display: {}, // Show only on smaller screens
                //  position: "absolute",
              }}
            > */}
            <MoreVertIcon />
            {/* </Button> */}
          </IconButton>

          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={Openmenu}
            onClose={handleCloseCancelClosed}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || tab === "2"}
              onClick={() => {
                handleCloseCancelClosed();
              }}
            >
              {/* <ListItemIcon>
                <HighlightOffIcon
                  fontSize="small"
                  color="inherit"
                  sx={{ fontWeight: "bold", strokeWidth: 2 }}
                />
              </ListItemIcon> */}
              {/* <Typography
                disabled={
                  SaveUpdateName === "SAVE"
                }
                fontWeight="bold"
              >
                CANCEL
              </Typography> */}
            </MenuItem>
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || tab === "1" || tab === "2"}
              onClick={() => {
                handleOnCloseDocument();
                handleCloseCancelClosed();
              }}
            >
              <ListItemIcon>
                <DoNotDisturbAltSharpIcon
                  fontSize="small"
                  color="inherit"
                  sx={{ fontWeight: "bold" }}
                />
              </ListItemIcon>
              <Typography
                disabled={SaveUpdateName === "SAVE"}
                fontWeight="bold"
              >
                CLOSE
              </Typography>
            </MenuItem>
          </Menu>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
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
              Inventory Counting
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
              width={"100%"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
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
                        name="Series"
                        rules={{ required: "please select Series" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="SERIES"
                            data={[
                              ...(DocSeries || []).map((item) => ({
                                key: item.SeriesId,
                                value: item.SeriesName,
                              })),
                              { key: "0", value: "MANUAL" },
                            ]}
                            disabled={!allFormData.DocEntry === false}
                            {...field}
                            onChange={(e) => {
                              const selectedSeries = e.target.value;
                              field.onChange(selectedSeries);
                              setValue("Series", selectedSeries);
                              if (selectedSeries !== "0") {
                                const seriesData = DocSeries.find(
                                  (item) => item.SeriesId === selectedSeries,
                                );
                                setValue("DocNum", seriesData?.DocNum || "");
                                setValue(
                                  "FinncPriod",
                                  seriesData?.FinncPriod ?? "",
                                );
                                setValue(
                                  "PIndicator",
                                  seriesData?.Indicator ?? "",
                                );
                                clearErrors("DocNum");
                              } else {
                                setValue("DocNum", "");
                                setValue("FinncPriod", "0");
                                setValue("PIndicator", "0");
                                clearErrors("DocNum");
                              }
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
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DocNum"
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (watch("Series") === "0" && !value) {
                              return " Please Enter DocNum";
                            }
                            return true;
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="DOC NO"
                            type="text"
                            {...field}
                            // disabled={allFormData.DocEntry!==allFormData.DocEntry}
                            readOnly={
                              !allFormData.DocEntry === false ||
                              watch("Series") !== "0"
                            }
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
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CountDate"
                        control={control}
                        rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputDatePickerField
                            label="COUNT DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={(newValue) => {
                              setValue("CountDate", newValue);
                            }}
                            disabled={allFormData.Status === "0"}
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
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Time"
                        control={control}
                        rules={{ required: "Time is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTimePickerField
                            label="COUNT TIME"
                            {...field}
                            disabled={allFormData.Status === "0"}
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
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CountType"
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="COUNTING TYPE"
                            disabled={allFormData.Status === "0"}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value); // ✅ update form value properly
                              settabvalue(0);
                              setValue("IndvCount", "");
                              setValue("TeamCount", "");

                              const match = InvCRows.find(
                                (row) =>
                                  Number(row.DocEntry) === Number(user.UserId),
                              );

                              if (value === "1") {
                                // 🟩 SINGLE COUNTER MODE
                                const oLines = getValues("oLines") || [];
                                const cleared = oLines.map((line) => ({
                                  ...line,
                                  CountQty: "",
                                  Difference: "",
                                  DiffPercen: "",
                                  UomCode: "",
                                  UomQty: "",
                                }));
                                setValue("oLines", cleared, {
                                  shouldDirty: true,
                                });

                                // 🧹 Clean dynamic fields from IndividualCountingoLines + nested IndividualCountUomLines
                                const allFormValues = getValues();
                                const individualLines =
                                  getValues("IndividualCountingoLines") || [];

                                // 🔄 Unregister dynamic user-specific RHF fields
                                Object.keys(allFormValues).forEach((key) => {
                                  if (key.includes("IndividualCountingoLines"))
                                    unregister(key);
                                });

                                // 🧽 Deep-clean the structure
                                const cleanedIndividual = individualLines.map(
                                  (line) => {
                                    const cleaned = { ...line };

                                    // Clear any top-level dynamic fields
                                    Object.keys(cleaned).forEach((key) => {
                                      if (
                                        key.match(
                                          /_UomCountedQty|_CountedQty|_UomQty|_CntQty/i,
                                        )
                                      ) {
                                        cleaned[key] = "";
                                      }
                                    });

                                    // 🔥 Clean nested IndividualCountUomLines array (instead of oInvCounting2Lines)
                                    if (
                                      Array.isArray(
                                        cleaned.IndividualCountUomLines,
                                      )
                                    ) {
                                      cleaned.IndividualCountUomLines =
                                        cleaned.IndividualCountUomLines.map(
                                          (u) => {
                                            const sub = { ...u };

                                            // Remove user-specific keys
                                            Object.keys(sub).forEach((k) => {
                                              if (
                                                k.match(
                                                  /_UomCountedQty|_CountedQty|_UomQty|_CntQty/i,
                                                )
                                              ) {
                                                sub[k] = "";
                                              }
                                            });

                                            // Reset all base qty fields
                                            sub.IndividualUomCountedQty = "";
                                            sub.IndividualCountedQty = "";
                                            sub.TeamUomQty = "";
                                            sub.TeamCntQty = "";

                                            return sub;
                                          },
                                        );
                                    }

                                    return cleaned;
                                  },
                                );

                                // ✅ Apply clean version
                                setValue(
                                  "IndividualCountingoLines",
                                  cleanedIndividual,
                                  { shouldDirty: true },
                                );

                                // Clear Team lines too
                                setValue("TeamCountingoLines", [], {
                                  shouldDirty: true,
                                });

                                // 🧩 Update Taker info
                                if (match) {
                                  setValue("Taker1Id", [
                                    {
                                      value: Number(match.DocEntry),
                                      label: match.UserName,
                                      LineNum: 0,
                                    },
                                  ]);
                                } else {
                                  setValue("Taker1Id", []);
                                }
                              } else if (value === "2") {
                                // 🟦 MULTIPLE COUNTERS MODE
                                if (match) {
                                  setValue("IndvCount", [
                                    {
                                      value: Number(match.DocEntry),
                                      label: match.UserName,
                                      LineNum: 0,
                                      CounterNum: match.CounterNum,
                                    },
                                  ]);
                                  setValue("TeamCount", [
                                    {
                                      value: Number(match.DocEntry),
                                      label: match.UserName,
                                      LineNum: 0,
                                      CounterNum: match.CounterNum,
                                    },
                                  ]);
                                } else {
                                  setValue("IndvCount", []);
                                  setValue("TeamCount", []);
                                }

                                const currentOLines = getValues("oLines") || [];
                                const allFormValues = getValues(); // Get everything in form
                                const memberKeys = Object.keys(
                                  allFormValues,
                                ).filter((k) =>
                                  k.includes("IndividualCountingoLines"),
                                );

                                // 🧹 Unregister all previous IndividualCountingoLines paths to clear dynamic user fields
                                memberKeys.forEach((key) => unregister(key));

                                // 🟨 1️⃣ Clone for Team lines (keep as-is)
                                const clonedTeamLines = currentOLines.map(
                                  (line, index) => ({
                                    ...line,
                                    LineNum: index,
                                  }),
                                );

                                // 🟩 2️⃣ Clone for Individual lines (clear ALL dynamic/user-counted values)
                                const clonedIndividualLines = currentOLines.map(
                                  (line, index) => {
                                    const cleaned = { ...line, LineNum: index };

                                    // Clear known counting fields
                                    cleaned.CountQty = "";
                                    cleaned.Difference = "";
                                    cleaned.DiffPercen = "";
                                    cleaned.UomCode = "";

                                    // Clear any key containing user-counting info dynamically
                                    Object.keys(cleaned).forEach((key) => {
                                      if (
                                        key.match(
                                          /_UomCountedQty|_CountedQty|_UomQty|_CntQty/i,
                                        )
                                      ) {
                                        cleaned[key] = "";
                                      }
                                    });

                                    // Clear nested counting arrays
                                    if (
                                      Array.isArray(line.oInvCounting2Lines)
                                    ) {
                                      cleaned.oInvCounting2Lines =
                                        line.oInvCounting2Lines.map((sub) => ({
                                          ...sub,
                                          IndividualUomCountedQty: "",
                                          IndividualCountedQty: "",
                                          TeamUomQty: "",
                                          TeamCntQty: "",
                                        }));
                                    }

                                    return cleaned;
                                  },
                                );

                                // 🧩 Set both lists
                                setValue(
                                  "TeamCountingoLines",
                                  clonedTeamLines,
                                  {
                                    shouldDirty: true,
                                  },
                                );
                                setValue(
                                  "IndividualCountingoLines",
                                  clonedIndividualLines,
                                  { shouldDirty: true },
                                );
                              }
                            }}
                            data={[
                              { key: "1", value: "Single Counter" },
                              { key: "2", value: "Multiple Counters" },
                            ]}
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
                      mt={1}
                    >
                      <Button
                        variant="contained"
                        color="info"
                        onClick={handleClickOpen}
                        disabled={allFormData.Status === "0"}
                      >
                        Search Item
                      </Button>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 2, borderColor: "#bbb" }} />

                  {(watchCountType === "1" || watchCountType === 1) && (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Controller
                        name="Taker1Id"
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const isLight = theme.palette.mode === "light";

                          const options = InvCRows.map((user) => ({
                            value: Number(user.DocEntry),
                            label: `${user.UserName}`,
                          }));

                          return (
                            <Box
                              sx={{
                                width: "100%",
                                maxWidth: 220,
                                textAlign: "left",
                              }}
                            >
                              {/* Label */}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                  color: isLight ? "#555" : "#ddd",
                                  mb: 0.5,
                                }}
                              >
                                INVENTORY COUNTERS
                              </Typography>

                              {/* Select */}
                              <Select
                                isMulti
                                options={options}
                                isDisabled={allFormData.Status === "0"}
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
                                  if (selected.length > 1) return;

                                  const newValue = selected.map((s) => {
                                    const existing = Array.isArray(field.value)
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
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                placeholder="Select user..."
                                components={{
                                  DropdownIndicator: () => null,
                                  IndicatorSeparator: () => null,
                                }}
                                styles={{
                                  container: (base) => ({
                                    ...base,
                                    width: "100%",
                                  }),

                                  control: (base, state) => ({
                                    ...base,
                                    backgroundColor: isLight
                                      ? "#F5F6FA"
                                      : "#060B27",
                                    borderColor: state.isFocused
                                      ? theme.palette.primary.main
                                      : isLight
                                        ? "#ccc"
                                        : "#ffffff",
                                    minHeight: "40px",
                                    boxShadow: state.isFocused
                                      ? `0 0 0 1px ${theme.palette.primary.main}`
                                      : "none",
                                    "&:hover": {
                                      borderColor: theme.palette.primary.main,
                                    },
                                  }),

                                  menu: (base) => ({
                                    ...base,
                                    backgroundColor: isLight
                                      ? "#fff"
                                      : "#1E1E1E",
                                    color: isLight ? "#000" : "#fff",
                                    zIndex: 9999,
                                  }),

                                  option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                      ? isLight
                                        ? "#e6f0ff"
                                        : "#333"
                                      : "transparent",
                                    color: isLight ? "#000" : "#fff",
                                  }),

                                  multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: isLight
                                      ? "#e0e0e0"
                                      : "#333",
                                  }),

                                  multiValueLabel: (base) => ({
                                    ...base,
                                    color: isLight ? "#000" : "#fff",
                                  }),

                                  input: (base) => ({
                                    ...base,
                                    color: isLight ? "#000" : "#fff",
                                  }),

                                  singleValue: (base) => ({
                                    ...base,
                                    color: isLight ? "#000" : "#fff",
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
                  )}

                  {(watchCountType === "2" || watchCountType === 2) && (
                    <>
                      <Grid container>
                        {/* Individual Counters */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <Controller
                            name="IndvCount"
                            control={control}
                            render={({ field, fieldState: { error } }) => {
                              const options = InvCRows.map((user) => ({
                                value: Number(user.DocEntry),
                                label: `${user.UserName}`,
                              }));

                              return (
                                <Box
                                  sx={{
                                    width: "100%",
                                    maxWidth: 220,
                                    textAlign: "left",
                                  }}
                                >
                                  {/* Label Above Field */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.85rem",
                                      color: "#555",
                                      mb: 0.5,
                                      display: "block",
                                    }}
                                  >
                                    INDIVIDUAL COUNTERS
                                  </Typography>

                                  {/* Select Field */}
                                  <Select
                                    isMulti
                                    options={options}
                                    isDisabled={allFormData.Status === "0"}
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
                                      if (selected.length > 5) return; // limit selection to 5
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
                                          LineNum: existing?.LineNum || "",
                                          CounterNum:
                                            existing?.CounterNum || "",
                                        };
                                      });
                                      field.onChange(newValue);
                                    }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    placeholder="Select Users..."
                                    components={{
                                      DropdownIndicator: () => null,
                                      IndicatorSeparator: () => null,
                                    }}
                                    styles={{
                                      container: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                        backgroundColor: "transparent",
                                      }),

                                      control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "#060B27"
                                            : "#rgb(245,246,250)",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(6px)"
                                            : "none",
                                        minHeight: "40px",
                                        borderColor: state.isFocused
                                          ? theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976d2"
                                          : theme.palette.divider,
                                        boxShadow: state.isFocused
                                          ? "0 0 0 1px rgba(144,202,249,0.4)"
                                          : "none",

                                        "&:hover": {
                                          borderColor:
                                            theme.palette.mode === "dark"
                                              ? "#90caf9"
                                              : "#1976d2",
                                        },
                                      }),

                                      menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "rgba(25,25,25,0.85)"
                                            : "#ffffff",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(8px)"
                                            : "none",
                                        border:
                                          theme.palette.mode === "dark"
                                            ? "1px solid #444"
                                            : "1px solid #ddd",
                                      }),

                                      valueContainer: (provided) => ({
                                        ...provided,
                                        maxHeight: "70px",
                                        overflowY: "auto",
                                        flexWrap: "wrap",
                                      }),

                                      multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "rgba(255,255,255,0.08)"
                                            : "#e0e0e0",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(4px)"
                                            : "none",
                                        margin: "2px",
                                      }),

                                      // ⭐ ADD THIS — CHIP TEXT COLOR
                                      multiValueLabel: (provided) => ({
                                        ...provided,
                                        color:
                                          theme.palette.mode === "dark"
                                            ? "#ffffff"
                                            : "#000000",
                                      }),
                                      option: (provided, state) => ({
                                        ...provided,
                                        color:
                                          state.isFocused &&
                                          theme.palette.mode === "dark"
                                            ? "#000000" // ⭐ gray text on hover (dark mode only)
                                            : theme.palette.mode === "dark"
                                              ? "#ffffff" // normal dark mode text
                                              : "#000000", // normal light mode text
                                      }),
                                    }}
                                  />

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

                        {/* Team Counters */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <Controller
                            name="TeamCount"
                            control={control}
                            render={({ field, fieldState: { error } }) => {
                              const options = InvCRows.map((user) => ({
                                value: Number(user.DocEntry),
                                label: `${user.UserName}`,
                              }));

                              return (
                                <Box
                                  sx={{
                                    width: "100%",
                                    maxWidth: 220,
                                    textAlign: "left",
                                  }}
                                >
                                  {/* Label Above Field */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.85rem",
                                      color: "#555",
                                      mb: 0.5,
                                      display: "block",
                                    }}
                                  >
                                    TEAM COUNTERS
                                  </Typography>

                                  {/* Select Field */}
                                  <Select
                                    isMulti
                                    options={options}
                                    isDisabled={allFormData.Status === "0"}
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
                                      if (selected.length > 10) return; // limit selection to 10
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
                                          LineNum: existing?.LineNum || "",
                                          CounterNum:
                                            existing?.CounterNum || "",
                                        };
                                      });
                                      field.onChange(newValue);
                                    }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    placeholder="Select Users..."
                                    components={{
                                      DropdownIndicator: () => null,
                                      IndicatorSeparator: () => null,
                                    }}
                                    styles={{
                                      container: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                        backgroundColor: "transparent",
                                      }),

                                      control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "#060B27"
                                            : "#rgb(245,246,250)",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(6px)"
                                            : "none",
                                        minHeight: "40px",
                                        borderColor: state.isFocused
                                          ? theme.palette.mode === "dark"
                                            ? "#90caf9"
                                            : "#1976d2"
                                          : theme.palette.divider,
                                        boxShadow: state.isFocused
                                          ? "0 0 0 1px rgba(144,202,249,0.4)"
                                          : "none",

                                        "&:hover": {
                                          borderColor:
                                            theme.palette.mode === "dark"
                                              ? "#90caf9"
                                              : "#1976d2",
                                        },
                                        option: (provided, state) => ({
                                          ...provided,
                                          color:
                                            state.isFocused &&
                                            theme.palette.mode === "dark"
                                              ? "#000000" // ⭐ gray text on hover (dark mode only)
                                              : theme.palette.mode === "dark"
                                                ? "#ffffff" // normal dark mode text
                                                : "#000000", // normal light mode text
                                        }),
                                      }),

                                      menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "rgba(25,25,25,0.85)"
                                            : "#ffffff",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(8px)"
                                            : "none",
                                        border:
                                          theme.palette.mode === "dark"
                                            ? "1px solid #444"
                                            : "1px solid #ddd",
                                      }),

                                      valueContainer: (provided) => ({
                                        ...provided,
                                        maxHeight: "70px",
                                        overflowY: "auto",
                                        flexWrap: "wrap",
                                      }),

                                      multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "rgba(255,255,255,0.08)"
                                            : "#e0e0e0",
                                        backdropFilter:
                                          theme.palette.mode === "dark"
                                            ? "blur(4px)"
                                            : "none",
                                        margin: "2px",
                                      }),

                                      // ⭐ ADD THIS — CHIP TEXT COLOR
                                      multiValueLabel: (provided) => ({
                                        ...provided,
                                        color:
                                          theme.palette.mode === "dark"
                                            ? "#ffffff"
                                            : "#000000",
                                      }),
                                    }}
                                  />

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
                      </Grid>
                    </>
                  )}
                </Paper>
                <Grid container width={"100%"}>
                  <Paper
                    sx={{
                      width: "100%",
                      mb: 2,
                      p: 2,
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                      borderRadius: "12px",
                    }}
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="tabs example"
                    >
                      <Tab
                        value={0}
                        icon={<HomeIcon fontSize="small" />}
                        iconPosition="start"
                        label="General"
                      />

                      <Tab
                        value={1}
                        icon={<GroupsIcon fontSize="small" />}
                        iconPosition="start"
                        label="Team Counting"
                        disabled={
                          !Array.isArray(teamCountValue) ||
                          teamCountValue.length === 0
                        }
                      />

                      <Tab
                        value={2}
                        icon={<PersonIcon fontSize="small" />}
                        iconPosition="start"
                        label="Individual Counting"
                        disabled={
                          !Array.isArray(IndCountValue) ||
                          IndCountValue.length === 0
                        }
                      />

                      <Tab
                        value={3}
                        icon={<AttachFileIcon fontSize="small" />}
                        iconPosition="start"
                        label="Attachments"
                      />
                    </Tabs>

                    <Divider />

                    {tabvalue === 0 && (
                      <>
                        <Grid container width={"100%"}>
                          <Grid
                            container
                            item
                            width="100%"
                            m={1}
                            // border="1px solid grey"
                          >
                            <Divider />

                            <>
                              <Grid
                                container
                                item
                                sx={{
                                  overflow: "auto",
                                  width: "100%",
                                  height: "50vh",
                                  // minHeight: "300px",
                                  // maxHeight: "500px",
                                  mt: "5px",
                                }}
                              >
                                <DataGrid
                                  key={formKey}
                                  className="datagrid-style"
                                  sx={gridSx}
                                  columns={columns}
                                  columnVisibilityModel={visibilityModel}
                                  apiRef={apiRef}
                                  editMode="cell"
                                  experimentalFeatures={{ newEditingApi: true }}
                                  processRowUpdate={processRowUpdate}
                                  onCellKeyDown={handleCellKeyDown}
                                  onProcessRowUpdateError={(err) =>
                                    console.error(err)
                                  }
                                  // hideFooter
                                  onColumnVisibilityModelChange={
                                    setVisibilityModel
                                  }
                                  rows={oLines.map((data, index) => ({
                                    ...data,
                                    id: index,
                                  }))}
                                  getRowClassName={() =>
                                    allFormData.Status === "0"
                                      ? "disabled-row"
                                      : ""
                                  }
                                />
                              </Grid>
                            </>
                          </Grid>
                        </Grid>
                      </>
                    )}
                    {tabvalue === 1 && (
                      <>
                        <Grid
                          container
                          item
                          sx={{
                            overflow: "auto",
                            width: "100%",
                            height: "50vh",
                            // minHeight: "300px",
                            // maxHeight: "500px",
                            mt: "5px",
                          }}
                        >
                          <DataGrid
                            className="datagrid-style"
                            sx={gridSx}
                            columns={TeamCountingColumns}
                            apiRef={TeamApiRef}
                            editMode="cell"
                            experimentalFeatures={{ newEditingApi: true }}
                            processRowUpdate={processTeamCountingRowUpdate}
                            onCellKeyDown={handleTeamCellKeyDown}
                            onProcessRowUpdateError={(err) =>
                              console.error(err)
                            }
                            // hideFooter
                            // columnVisibilityModel={visibilityModel}
                            rows={TeamCountingoLines.map((data, index) => ({
                              ...data,
                              id: index,
                            }))}
                            getRowClassName={() =>
                              allFormData.Status === "0" ? "disabled-row" : ""
                            }
                            // rowCount={olineRowCount}
                            // paginationMode="server"
                            // paginationModel={{
                            //   pageSize: PAGE_LIMIT,
                            //   page: olinePage,
                            // }}
                            // onPaginationModelChange={(model) =>
                            //   setOlinePage(model.page)
                            // }
                            // pageSizeOptions={[PAGE_LIMIT]}
                            loading={isLoading}
                          />
                        </Grid>
                      </>
                    )}
                    {tabvalue === 2 && (
                      <>
                        <Grid
                          container
                          item
                          sx={{
                            overflow: "auto",
                            width: "100%",
                            height: "50vh",
                            // minHeight: "300px",
                            // maxHeight: "500px",
                            mt: "5px",
                          }}
                        >
                          <DataGrid
                            className="datagrid-style"
                            key={IndividualCountingColumns.length}
                            columns={IndividualCountingColumns}
                            apiRef={IndividualApiRef}
                            editMode="cell"
                            experimentalFeatures={{ newEditingApi: true }}
                            processRowUpdate={
                              processIndividualCountingRowUpdate
                            }
                            onCellKeyDown={handleIndividualCellKeyDown}
                            onProcessRowUpdateError={(err) =>
                              console.error(err)
                            }
                            sx={gridSx}
                            // hideFooter
                            // columnVisibilityModel={visibilityModel}
                            rows={IndividualCountingoLines.map(
                              (data, index) => ({
                                ...data,
                                id: index,
                              }),
                            )}
                            getRowClassName={() =>
                              allFormData.Status === "0" ? "disabled-row" : ""
                            }
                            loading={isLoading}
                          />
                        </Grid>
                      </>
                    )}
                    {tabvalue === 3 && (
                      <>
                        <Grid
                          container
                          mt={1}
                          sx={{
                            height: "60vh",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Grid item xs={12}>
                            <input
                              type="file"
                              id="file-upload"
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                              multiple
                              accept="
                         .pdf,.xls,.xlsx,.csv,.doc,.docx,.txt,
                         .tiff,.tif,.jpg,.jpeg,.png,
                         .zip,.rar,
                         .json,.xml,
                         .dwg,.dxf,
                         .heic,.webp,.bmp,.gif,.svg
                       "
                            />
                            <label
                              htmlFor="file-upload"
                              style={{
                                marginLeft: 5,
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                backgroundColor: "#2E7D32",
                                color: "#fff",
                                borderRadius: "5px",
                                cursor: "pointer",
                                transition: "background-color 0.3s",
                              }}
                            >
                              <CloudUploadIcon
                                sx={{ fontSize: 20, marginRight: "5px" }}
                              />
                              Upload File
                            </label>

                            <TableContainer
                              sx={{
                                margin: "7px",
                                maxHeight: 200,
                                width: "80%",
                              }}
                            >
                              {fileData.length > 0 && (
                                <Table sx={{ minWidth: 500 }} stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Selected File Name</TableCell>
                                      <TableCell>Action</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <Divider />
                                  <TableBody>
                                    {fileData.map((data, index) => (
                                      <TableRow
                                        key={index}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <TableCell
                                          onClick={
                                            () =>
                                              data.LineNum === "0"
                                                ? openFileinNewTab(data) // API case
                                                : Base64FileinNewTab(
                                                    data.DocEntry,
                                                    data.LineNum,
                                                    data.FileExt,
                                                    data.Description,
                                                  ) // Base64 case
                                          }
                                        >
                                          {data.FileName}
                                        </TableCell>
                                        <TableCell>
                                          <RemoveCircleOutlineIcon
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemove(index);
                                            }}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </TableContainer>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </Paper>

                  <Grid container>
                    <Grid
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>{" "}
                    <Grid
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                    <Grid
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                    <Grid item md={6} lg={3} xs={12} textAlign={"center"}>
                      <Controller
                        name="Remarks" // ✅ field name for REMARKS
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="REMARKS"
                            placeholder="REMARK"
                            rows={2}
                            multiline
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
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
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  sx={{ color: "white" }}
                  disabled={
                    !perms.IsAdd || !perms.IsEdit || allFormData.Status === "0"
                  }
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              {/* <Grid item>
                <Button
                  variant="contained"
                  color="error"
                  disabled={!perms.IsDelete}
                >
                  CANCEL
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* Drawer for smaller screens */}
    </>
  );
}
