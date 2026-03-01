import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabPanel } from "@mui/lab";
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
  Paper,
  Tab,
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
import SignatureCanvas from "react-signature-canvas";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { dataGridSx } from "../../Styles/dataGridStyles";
import AutoCompleteDropdown from "../Components/AutoCompleteDropdown";
import CardComponent from "../Components/CardComponent";

import apiClient from "../../services/apiClient";
import {
  InputDatePickerField,
  InputTextArea,
  InputTextAreaFields,
  InputTextField,
  InputTextFieldLarge,
  InputTextSearchButton,
  InputTimePicker
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

export default function IssueMaterial() {
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const [tab, settab] = useState("0");
  const [jackOptions, setJackOptions] = useState([]);
  const [technicianOptions, settechnicianOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const timeoutRef = useRef(null);
  const [oldOpenData, setSelectData] = useState(null);
  const [DocEntry, setDocEntry] = useState("");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");

  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=========================================open List State End================================================================
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  const perms = usePermissions(133);
  const [beforeCloseUpdateFlag, setBeforeCloseUpdateFlag] = useState(false);

  const [openQCModal, setOpenQCModal] = useState(false);
  const [QcSaveUpdateName, setQcSaveUpdateName] = useState("SAVE");
  const [qcMasterList, setQcMasterList] = useState(null);

  const sigCanvas = useRef(null);
  const [isSigned, setIsSigned] = useState(false);

  const [allQCQuestions, setAllQCQuestions] = useState([]);
  const [QCoLines, setQCoLines] = useState([]);

  const handleCheckboxChange = (index, field, checked) => {
    setQCoLines((prevLines) => {
      const updated = [...prevLines];
      updated[index] = {
        ...updated[index],
        [field]: checked,
      };
      return updated;
    });
  };

  const handleEnd = () => {
    if (!sigCanvas.current.isEmpty()) {
      setIsSigned(true);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setIsSigned(false);
  };

  const handleInputChange = (index, field, value) => {
    setQCoLines((prevLines) => {
      const updated = [...prevLines];
      updated[index] = {
        ...updated[index],
        [field]: value || "",
      };
      return updated;
    });
  };

  const QCitemsTable = [
    {
      field: "Question",
      headerName: "QUESTIONS",
      width: 950,
      editable: true,
      sortable: false,
    },
    {
      field: "Inspected",
      headerName: "INSPECTED",
      width: 170,
      sortable: true,
      renderCell: (params) => {
        const index = QCoLines.findIndex(
          (r) => r.QCDocEntry === params.row.QCDocEntry,
        );

        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Checkbox
              checked={params.row.Inspected || false}
              disabled={allFormData.Status === "0"}
              onChange={(e) =>
                handleCheckboxChange(index, "Inspected", e.target.checked)
              }
              size="medium"
            />
          </Box>
        );
      },
    },
    {
      field: "Notes",
      headerName: "NOTES",
      width: 330,
      sortable: false,
      renderCell: (params) => {
        const index = QCoLines.findIndex(
          (r) => r.QCDocEntry === params.row.QCDocEntry,
        );

        return (
          <div style={{ marginTop: 8, marginBottom: 8, width: "100%" }}>
            <InputTextFieldLarge
              name={`oLines.${index}.Notes`}
              placeholder="WRITE NOTE HERE..."
              value={params.row.Notes || ""}
              readOnly={allFormData.Status === "0"}
              onChange={(e) =>
                handleInputChange(index, "Notes", e.target.value)
              }
            />
          </div>
        );
      },
    },
  ];

  const fetchAndSetData = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/JobCard/${DocEntry}`);

      const data = res.data.values;
      const transformed = {
        ...data,
        OrderNo: data.OrderNo,
        CardName: data.CardName,
        CardCode: data.CardCode,
        // RequestDate: data.RequestDate,
        RequestDate: data.RequestDate ? dayjs(data.RequestDate) : dayjs(),
        ReqNo: data.RequestNo,
        JobCardNo: data.JobCardNo,
        VehInwardNo: data.VehInwardNo,
        VehInwardBy: data.VehInwardBy,
        JobWorkAt: data.JobWorkAt,
        RegistrationNo: data.RegistrationNo,
        OrderDocEntry: data.OrderDocEntry,
        JobWorkDetails: data.JobRemarks,
        PhoneNumber1: data.PhoneNumber1,
        BeforeLH: data.BeforeLH,
        BeforeRH: data.BeforeRH,
        TotalHeight: data.TotalHeight,
        AfterLH: data.AfterLH,
        AfterRH: data.AfterRH,
        JobRemarks: data.JobRemarks,
        JobCardRemarks: data.JobCardRemarks,
        JobWorkBy: data.CreatedBy,
        JobCardTime: data.JobCardTime ? dayjs(data.JobCardTime) : dayjs(),
        JobStartDate: data.JobStartDate ? dayjs(data.JobStartDate) : dayjs(),
        JobCloseDate: data.JobCloseDate ? dayjs(data.JobCloseDate) : dayjs(),
        oLines: data.oLines?.map((Job) => ({
          ItemCode: Job.ItemCode,
          ItemName: Job.ItemName,
          WHSCode: Job.WHSCode,
          ReqQuantity: Job.ItemQuantity,
          JobWorkstationId: Number(Job.JobWorkstationId),
          Technician: Number(Job.Technician),
          LineJobStatus: Number(Job.LineJobStatus),
        })),
      };

      // fetchTechnicianData();
      // reset(transformed);
      await Promise.all([fetchTechnicianData(), fetchJacks()]);
      reset(transformed);
      setSelectData(DocEntry);
      setDocEntry(DocEntry);
      setSaveUpdateName("UPDATE");
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        text: error?.response?.data?.message || "Failed to fetch data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const setOldOpenData = (DocEntry) => {
    fetchAndSetData(DocEntry);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const ClearForm = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setSelectData([]);
  };

  const initial = {
    CardName: "",
    RequestDocNums: "",
    PhoneNumber1: "",
    JobCardNo: "",
    OrderNo: "",
    ReqNo: "",
    RequestDate: dayjs(new Date()),
    VehicleInwardNo: "",
    VehInwardBy: "",
    JobWorkAt: "",
    RegistrationNo: "",
    JobWorkDetails: "",
    JobCardRemarks: "",
    JobWorkBy: "",
    BeforeLH: "",
    BeforeRH: "",
    TotalHeight: "",
    AfterLH: "",
    AfterRH: "",
    VehInwardNo: "",
    JobStartDate: dayjs(new Date()),
    JobCloseDate: dayjs(new Date()),
    JobCardTime: dayjs(),
    OrderDocEntry: "",
    oLines: [],
  };

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    setValue,
    // formState: { errors },
  } = useForm({
    defaultValues: initial,
  });

  const {
    setValue: setValueMdl,
  } = useForm({});

  const allFormData = getValues();

  const signatureEditable =
    SaveUpdateName === "SAVE" || allFormData.Status === "1";

  const closeQCModal = () => {
    setOpenQCModal(false);
  };

  const getQcListByJBC = async (DocEntry) => {
    if (!DocEntry) {
      Swal.fire({
        text: "Please save the Job Card first to perform QC.",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    setOpenQCModal(true);
    setLoading(true);

    try {
      const response = await apiClient.get(`/JQC/getbyjbc/${DocEntry}`);

      const newData = response.data.values;

      if (newData.length === 0) {
        setQcSaveUpdateName("SAVE");
        const freshLines = allQCQuestions.map((q) => ({
          UserId: localStorage.getItem("UserId"),
          CreatedBy: localStorage.getItem("UserName"),
          ModifiedBy: localStorage.getItem("UserName"),
          Status: "1",
          QCDocEntry: q.QCDocEntry || q.DocEntry,
          Question: q.Question,
          Inspected: false,
          Notes: "",
        }));

        setQcMasterList({
          UserId: localStorage.getItem("UserId"),
          CreatedBy: localStorage.getItem("UserName"),
          ModifiedBy: localStorage.getItem("UserName"),
          Status: "1",
          JBCDocEntry: String(DocEntry),
          SignPath: "",
          oLines: freshLines,
        });

        setQCoLines(freshLines);
      } else {
        const JQC = response.data.values[0];
        setQcSaveUpdateName("UPDATE");
        const mappedLines = JQC.oLines.map((line) => ({
          UserId: line.UserId,
          CreatedBy: line.CreatedBy,
          ModifiedBy: localStorage.getItem("UserName"),
          Status: line.Status,
          QCDocEntry: line.QCDocEntry,
          Question: line.Question,
          Inspected: line.Inspected === "1",
          Notes: line.Notes || "",
        }));

        setQcMasterList({
          UserId: JQC.UserId,
          CreatedBy: JQC.CreatedBy,
          ModifiedBy: JQC.ModifiedBy,
          Status: JQC.Status,
          JBCDocEntry: JQC.JBCDocEntry,
          SignPath: JQC.SignPath,
          oLines: mappedLines,
        });
        mappedLines.forEach((line, index) => {
          setValueMdl(`Notes-${index}`, line.Notes ?? "");
        });

        setQCoLines(mappedLines);

        const base64Image = `data:image/png;base64,${JQC.SignPath}`;
        if (sigCanvas.current) {
          sigCanvas.current.fromDataURL(base64Image);
          sigCanvas.current.off();
        }
      }
    } catch (error) {
      console.error(error);
      setOpenQCModal(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Failed to fetch QC data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/QCM`);
        const questions = response.data.values.map((q) => ({
          QCDocEntry: q.DocEntry,
          Question: q.Question,
          UserId: q.UserId,
          CreatedBy: q.CreatedBy,
          Status: q.Status,
        }));
        setAllQCQuestions(questions);
        setQCoLines(questions);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || "Failed to fetch questions",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuestions();
  }, []);

  const handleFieldChange = (index, fieldName, value) => {
    const allValues = getValues("oLines");

    allValues[index][fieldName] = value;

    if (index === 0) {
      allValues.forEach((row) => {
        row[fieldName] = value;
      });
    }
    setValue("oLines", allValues, { shouldValidate: true, shouldDirty: true });
    if (SaveUpdateName === "Update") {
      setBeforeCloseUpdateFlag(true);
    }
  };

  const fetchJacks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/Jack?Limit=50`);

      if (res.data.success) {
        const options = [
          { key: "", value: "" },
          ...res.data.values.map((jack) => ({
            key: Number(jack.DocEntry),
            value: jack.JackName,
          })),
        ];

        setJackOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch Jacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicianData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/Technician?Limit=200`);

      if (res.data.success) {
        const options = res.data.values.map((jack) => ({
          key: Number(jack.DocEntry),
          value: jack.TechnicianName,
        }));

        settechnicianOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch Technicians:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJacks();
    fetchTechnicianData();
  }, []);

  const oLines = useWatch({ control, name: "oLines" }) || [];

  const columns = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "ItemName",
      headerName: "DESCRIPTION",
      width: 390,
      editable: true,
      sortable: false,
    },
    {
      field: "ReqQuantity",
      headerName: "QTY",
      width: 140,
      editable: true,
      sortable: false,
    },

    {
      field: "LineJobStatus",
      headerName: "STATUS",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const index = oLines.findIndex(
          (line) => line.ItemCode === params.row.ItemCode,
        );

        const statusOptions = [
          { key: "", value: "" },
          { key: 1, value: "DONE" },
          { key: 0, value: "NOT DONE" },
        ];

        return (
          <Controller
            name={`oLines.${index}.LineJobStatus`}
            control={control}
            render={({ field }) => (
              <Tooltip
                title={
                  field.value !== "" && field.value !== null
                    ? statusOptions.find((opt) => opt.key === field.value)
                        ?.value
                    : ""
                }
                arrow
              >
                <div>
                  <AutoCompleteDropdown
                    name={`oLines.${index}.LineJobStatus`}
                    label=""
                    placeholder=" "
                    value={
                      statusOptions.find((opt) => opt.key === field.value) ||
                      null
                    }
                    options={statusOptions.filter((opt) => opt.key !== "")}
                    field="value"
                    control={control}
                    onSelect={(item) =>
                      handleFieldChange(index, "LineJobStatus", item?.key ?? "")
                    }
                    readOnly={allFormData.Status === "0"}
                    dropdownWidth={170}
                    style={{ width: 140 }}
                  />
                </div>
              </Tooltip>
            )}
          />
        );
      },
    },
    {
      field: "JobWorkstationId",
      headerName: "WORK STATION",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const index = oLines.findIndex(
          (line) => line.ItemCode === params.row.ItemCode,
        );

        return (
          <Controller
            name={`oLines.${index}.JobWorkstationId`}
            control={control}
            render={({ field }) => (
              <div style={{ marginTop: 8 }}>
                <Tooltip
                  title={
                    field.value !== "" && field.value !== null
                      ? jackOptions.find((opt) => opt.key === field.value)
                          ?.value
                      : ""
                  }
                  arrow
                >
                  <div>
                    <AutoCompleteDropdown
                      name={`oLines.${index}.JobWorkstationId`}
                      label=""
                      placeholder=" "
                      value={
                        jackOptions.find((opt) => opt.key === field.value) ||
                        null
                      }
                      options={jackOptions.filter((opt) => opt.key !== "")}
                      field="value"
                      control={control}
                      onSelect={(item) =>
                        handleFieldChange(
                          index,
                          "JobWorkstationId",
                          item?.key ?? "",
                        )
                      }
                      readOnly={allFormData.Status === "0"}
                      dropdownWidth={200}
                      style={{ width: 160 }}
                    />
                  </div>
                </Tooltip>
              </div>
            )}
          />
        );
      },
    },
    {
      field: "Technician",
      headerName: "TECHNICIAN",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const index = oLines.findIndex(
          (line) => line.ItemCode === params.row.ItemCode,
        );

        return (
          <Controller
            name={`oLines.${index}.Technician`}
            control={control}
            render={({ field }) => (
              <div style={{ marginTop: 8 }}>
                <Tooltip
                  title={
                    field.value !== "" && field.value !== null
                      ? technicianOptions.find((opt) => opt.key === field.value)
                          ?.value
                      : ""
                  }
                  arrow
                >
                  <div>
                    <AutoCompleteDropdown
                      name={`oLines.${index}.Technician`}
                      label=""
                      placeholder=" "
                      value={
                        technicianOptions.find(
                          (opt) => opt.key === field.value,
                        ) || null
                      }
                      options={technicianOptions}
                      field="value"
                      control={control}
                      onSelect={(item) => field.onChange(item?.key || "")}
                      dropdownWidth={200}
                      style={{ width: 160 }}
                      readOnly={allFormData.Status === "0"}
                    />
                  </div>
                </Tooltip>
              </div>
            )}
          />
        );
      },
    },
  ];

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/JobCard/GetListForCreate/Search/${searchTerm}/${pageNum}`
        : `/JobCard/GetListForCreate/${pageNum}`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
    }
  }, [searchmodelOpen]);

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      // Build params dynamically
      const params = {
        Status: 1,
        Page: pageNum,
      };

      // Only add SearchText if it exists
      if (searchTerm && searchTerm.trim() !== "") {
        params.SearchText = searchTerm.trim();
      }

      const response = await apiClient.get("/JobCard", { params });

      if (response.data.success) {
        const newData = response.data.values;

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        const pageSize = 20;
        setHasMoreOpen(newData.length === pageSize);
        setOpenListPage(pageNum);
      } else {
        setHasMoreOpen(false);
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreOpen(false);
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

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

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onSelectBusinessPartner = (DocEntry) => {
    const selectedItem = getListData.find((item) => item.DocEntry === DocEntry);
    if (!selectedItem) return;

    const fieldsToSet = {
      OrderNo: selectedItem.OrderNo,
      CardName: selectedItem.CardName,
      CardCode: selectedItem.CardCode,
      RequestDate: selectedItem.RequestDate
        ? dayjs(selectedItem.RequestDate)
        : dayjs(),
      ReqNo: selectedItem.DocNum,
      JobCardNo: "",
      VehInwardNo: selectedItem.VehInwardNo,
      VehInwardBy: selectedItem.VehInwardBy,
      JobWorkAt: selectedItem.JobWorkAt,
      RegistrationNo: selectedItem.RegistrationNo,
      OrderDocEntry: selectedItem.OrderDocEntry,
      JobWorkDetails: selectedItem.ReqRemarks.toUpperCase(),
      PhoneNumber1: selectedItem.PhoneNumber1,
      BeforeLH: "",
      BeforeRH: "",
      TotalHeight: "",
      AfterLH: "",
      AfterRH: "",
      oLines: selectedItem.oLines?.map((Job) => ({
        ItemCode: Job.ItemCode,
        ItemName: Job.ItemName,
        ReqQuantity: Job.ReqQuantity,
        WHSCode: Job.WHSCode,
        LineJobStatus: {},
        JobWorkstationId: {},
      })),
    };

    Object.entries(fieldsToSet).forEach(([key, value]) => {
      setValue(key, value, { shouldValidate: true });
    });

    SearchModelClose();
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `/JobCard/search/${searchTerm}/0/${pageNum}`
        : `/JobCard/pages/${pageNum}/0`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreClosed(newData.length === 20);
        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreClosed(false);
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreClosed(false);
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

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
      <Loader open={loading} />
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
          Job Card List
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
                          title={item.DocNum}
                          subtitle={item.PhoneNumber1}
                          description={item.CardName}
                          searchResult={query}
                          isSelected={oldOpenData === item.DocEntry}
                          onClick={() =>
                            setOldOpenData(
                              item.DocEntry,
                              item.CardCode,
                              item.OrderNo,
                            )
                          }
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

  const handleSubmitForm = async (data) => {
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");

    if (!data.oLines || data.oLines.length === 0) {
      Swal.fire({
        text: "Can not process document without item",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
      return;
    }

    const emptyLines = data.oLines.filter(
      (line) =>
        !(
          line &&
          line.LineJobStatus != null &&
          line.Technician != null &&
          line.JobWorkstationId != null &&
          line.LineJobStatus !== "" &&
          line.Technician !== "" &&
          line.JobWorkstationId !== ""
        ),
    );

    if (emptyLines.length > 0) {
      Swal.fire({
        title: "Warning!",
        text: "Please select Status, Technician and Jack for all items...",
        icon: "info",
        toast: true,
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const obj = {
      UserId: UserId,
      CreatedBy: CreatedBy,
      OrderNo: data.OrderNo,
      CardName: data.CardName,
      CardCode: data.CardCode,
      JobCardStatus: "",
      // DocDate: dayjs(),
      RequestDate: dayjs(data.RequestDate).format("YYYY-MM-DD HH:mm:ss"),
      RequestNo: data.ReqNo,
      RequestDocNums: data.RequestDocNums,
      JobCardNo: "",
      VehInwardNo: data.VehInwardNo,
      VehInwardBy: data.VehInwardBy,
      JobWorkAt: data.JobWorkAt,
      RegistrationNo: data.RegistrationNo,
      OrderDocEntry: data.OrderDocEntry,
      PhoneNumber1: data.PhoneNumber1,
      BeforeLH: data.BeforeLH,
      BeforeRH: data.BeforeRH,
      TotalHeight: data.TotalHeight,
      AfterLH: data.AfterLH,
      AfterRH: data.AfterRH,
      JobRemarks: data.JobWorkDetails,
      JobCardRemarks: data.JobCardRemarks,
      JobCardTime: dayjs(data.JobCardTime).format("HH:mm"),
      JobStartDate: dayjs(data.JobStartDate).format("YYYY-MM-DD HH:mm:ss"),
      JobCloseDate: dayjs(data.JobStartDate).format("YYYY-MM-DD HH:mm:ss"),
      oLines: data.oLines?.map((Job) => ({
        UserId: UserId,
        CreatedBy: CreatedBy,
        ItemCode: Job.ItemCode,
        ItemName: Job.ItemName,
        WHSCode: Job.WHSCode,
        JobCardNo: "",
        JobCardLineNo: "",
        LineJobRemarks: "",
        LineJobCloseTime: "",
        LineJobStartTime: "",
        ItemQuantity: Job.ReqQuantity || Job.ItemQuantity,
        JobWorkstationId: String(
          Job.JobWorkstationId?.DocEntry ?? Job.JobWorkstationId,
        ),
        Technician: String(Job.Technician?.DocEntry ?? Job.Technician),
        LineJobStatus: String(Job.LineJobStatus?.key ?? Job.LineJobStatus),
      })),
    };

    if (SaveUpdateName === "SAVE") {
      if (!data.BeforeLH || !data.BeforeRH || !data.TotalHeight) {
        Swal.fire({
          text: "Please add measurement (BeforeLH, BeforeRH, TotalHeight)",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }
      setLoading(true);

      try {
        const res = await apiClient.post(`/jobcard`, obj);

        if (res.data.success) {
          setOpenListData([]);
          fetchOpenListData(0);
          handleGetListClear();
          ClearForm();

          Swal.fire({
            text: "Job Card Added",
            icon: "success",
            title: "Success!",
            showConfirmButton: false,
            timer: 1500,
          });
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
    } else if (SaveUpdateName === "UPDATE") {
      const result = await Swal.fire({
        text: `Do you want to Update ${data.JobCardNo}?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (result.isConfirmed) {
        setLoading(false);
        try {
          const res = await apiClient.put(`/jobcard/${data.DocEntry}`, obj);

          if (res.data.success) {
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            ClearForm();
            Swal.fire({
              title: "Success!",
              text: "Job Card Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            setLoading(false);
            Swal.fire({
              title: "Error!",
              text: res.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } catch (error) {
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        setLoading(false);
        Swal.fire({
          title: "Error!",
          text: "Job Card Not Updated",
          icon: "info",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      }
    }
  };

  const onSubmitQC = async () => {
    const checkedCount = QCoLines.filter(
      (line) =>
        line.Inspected === true || (line.Notes && line.Notes.trim() !== ""),
    );

    if (checkedCount.length === 0) {
      Swal.fire({
        text: "Please check QC first...",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      Swal.fire({
        text: "Please add Signature...",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const payload = {
      ...qcMasterList,
      oLines: QCoLines.map((line) => ({
        ...line,
        QCDocEntry: String(line.QCDocEntry),
        Status: String(line.Status),
        Inspected: line.Inspected ? "1" : "0",
        Notes: line.Notes || "",
      })),
      SignPath: sigCanvas.current.toDataURL().split(",")[1],
    };

    try {
      setLoading(true);
      const response = await apiClient.post(`/JQC`, payload);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          text: "QC Saved Successfully!",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });

        setOpenQCModal(false);
        ClearForm();
      } else {
        setLoading(false);
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        text: error.message || "Failed to submit QC",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeJobCard = async (DocEntry) => {
    const CreatedBy = localStorage.getItem("UserName");

    const formData = getValues();

    if (!formData.oLines || formData.oLines.length === 0) {
      Swal.fire({
        text: "Can not process document without item",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
      return;
    }

    if (
      !formData.BeforeLH ||
      !formData.BeforeRH ||
      !formData.TotalHeight ||
      !formData.AfterRH ||
      !formData.AfterLH
    ) {
      Swal.fire({
        text: "Please add measurement",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    } else if (beforeCloseUpdateFlag) {
      Swal.fire({
        text: "Please Update Changes First",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const result = await Swal.fire({
      text: `Do You Want Closed JobCard ${formData.JobCardNo}`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const resp = await apiClient.put(
          `/JobCard/close/${formData.DocEntry}/${CreatedBy}`,
        );

        if (resp.data.success) {
          setLoading(false);
          setOpenListData([]);
          fetchOpenListData(0);
          handleGetListClear();
          Swal.fire({
            title: "Success!",
            text: "JobCard Closed!",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: resp.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } catch (error) {
        setLoading(false);
        Swal.fire({
          title: "Error!",
          text: "Something went wrong",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } else {
      setLoading(false);
      Swal.fire({
        title: "Error!",
        text: "JobCard Not Closed",
        icon: "info",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    }
  };

  return (
    <>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
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

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
          // onClick={handleOnSubmit}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
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
              Job Card Entry Details
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
              textTransform={"uppercase"}
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
                          name="OrderNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextSearchButton
                              label="So No"
                              type="text"
                              readOnly={true}
                              disabled={!!DocEntry}
                              onClick={() => {
                                OpenDailog();
                              }}
                              onChange={OpenDailog}
                              {...field}
                            />
                          )}
                        />
                        <SearchModel
                          open={searchmodelOpen}
                          onClose={SearchModelClose}
                          onCancel={SearchModelClose}
                          title="Select Job Card"
                          onChange={(e) => handleGetListSearch(e.target.value)}
                          value={getListquery}
                          onClickClear={handleGetListClear}
                          cardData={
                            <>
                              <InfiniteScroll
                                style={{
                                  textAlign: "center",
                                  justifyContent: "center",
                                }}
                                dataLength={getListData.length}
                                next={fetchMoreGetListData}
                                hasMore={hasMoreGetList}
                                loader={
                                  <BeatLoader
                                    color={theme.palette.primary.main}
                                  />
                                }
                                scrollableTarget="getListForCreateScroll"
                                endMessage={
                                  <Typography>No More Records</Typography>
                                }
                              >
                                {getListData.map((item, index) => (
                                  <CardComponent
                                    // key={index}
                                    key={item.DocEntry}
                                    title={item.OrderNo}
                                    subtitle={item.PhoneNumber1}
                                    description={item.CardName}
                                    searchResult={getListquery}
                                    isSelected={
                                      allFormData.CardCode === item.CardCode
                                    }
                                    onClick={() => {
                                      onSelectBusinessPartner(item.DocEntry);
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
                          name="JobCardNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Job Card No"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="ReqNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="REQ No"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="BeforeLH"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Before LH"
                              readOnly={allFormData.Status === "0"}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="BeforeRH"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Before RH"
                              readOnly={allFormData.Status === "0"}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={6}
                        md={6}
                        lg={4}
                        xs={12}
                        textAlign={"center"}
                      >
                        <Button
                          type="button"
                          variant="contained"
                          sx={{ maxWidth: 220 }}
                          disabled={SaveUpdateName === "SAVE"}
                          onClick={() => {
                            const getDocEntry = getValues("DocEntry");
                            getQcListByJBC(getDocEntry);
                          }}
                        >
                          QC
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="RequestDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              label="REQ Date"
                              value={field.value}
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="VehInwardNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Inward No"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="TotalHeight"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Total Height"
                              readOnly={allFormData.Status === "0"}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="AfterLH"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="After LH"
                              readOnly={allFormData.Status === "0"}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="AfterRH"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="After RH"
                              readOnly={allFormData.Status === "0"}
                              {...field}
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
                          name="JobWorkAt"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Job Work At"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="VehInwardBy"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Inward By"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="RegistrationNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Rgistration No"
                              readOnly={true}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Tooltip
                          title={(watch("JobWorkDetails") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="JobWorkDetails"
                              control={control}
                              render={({ field }) => (
                                <InputTextArea
                                  label="Job Work Details"
                                  readOnly={true}
                                  {...field}
                                />
                              )}
                            />
                          </div>
                        </Tooltip>
                      </Grid>
                      <Grid item textAlign={"center"}>
                        <Tooltip
                          title={(watch("JobCardRemarks") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="JobCardRemarks"
                              control={control}
                              rules={{ required: "Remarks is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextAreaFields
                                  label="Remarks"
                                  readOnly={allFormData.Status === "0"}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </div>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Paper
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    height: "23%",
                    padding: 2,
                    marginBottom: 3,
                    marginTop: 2,
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    getRowId={(row) => row.ItemCode}
                    rows={oLines}
                    columns={columns}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    hideFooter
                    disableRowSelectionOnClick
                    autoHeight="false"
                    editMode="cell"
                    disableColumnFilter
                    disableColumnSelector
                    disableDensitySelector
                    slotProps={{
                      toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                      },
                    }}
                    sx={{
                      ...gridSx,
                    }}
                  />
                </Paper>
                <Grid container>
                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="JobWorkBy"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Job Work BY"
                          readOnly={true}
                          {...field}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="JobStartDate"
                      control={control}
                      render={({ field }) => (
                        <InputDatePickerField
                          label="DATE"
                          {...field}
                          value={field.value}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="JobCloseDate"
                      control={control}
                      render={({ field }) => (
                        <InputDatePickerField
                          label="JOB-WORK DONE ON"
                          {...field}
                          value={field.value}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="JobCardTime"
                      control={control}
                      render={({ field }) => (
                        <InputTimePicker
                          {...field}
                          label="TIME"
                          readOnly={true}
                        />
                      )}
                    />
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
              }}
            >
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName === "UPDATE" && !perms.IsEdit) ||
                  allFormData.Status === "0"
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disabled={
                  SaveUpdateName === "SAVE" || allFormData.Status === "0"
                }
                onClick={closeJobCard}
              >
                CLOSE JOB CARD
              </Button>
              <Button type="button" variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>

            <Dialog
              open={openQCModal}
              onClose={() => setOpenQCModal(false)}
              scroll="paper"
              fullWidth
              maxWidth="xl"
            >
              <DialogTitle>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="h6"
                    component="div"
                    textAlign={"center"}
                    alignItems={"center"}
                  >
                    QC
                  </Typography>
                  <IconButton
                    onClick={() => setOpenQCModal(false)}
                    aria-label="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </DialogTitle>
              <Divider />

              <DialogContent className="d-flex justify-content-center">
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ height: 450, width: "100%" }}>
                    <DataGrid
                      className="datagrid-style"
                      getRowId={(row) => Math.random()}
                      rows={QCoLines}
                      columns={QCitemsTable}
                      columnHeaderHeight={35}
                      rowHeight={45}
                      hideFooter
                      disableRowSelectionOnClick
                      editMode="cell"
                      disableColumnFilter
                      disableColumnSelector
                      disableDensitySelector
                      sx={{ ...gridSx }}
                    />
                  </Box>

                  {/* Signature Title */}
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "#F5F5F5",
                      py: 1,
                      mt: 2,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                        Signature
                      </Typography>

                      {isSigned && signatureEditable && (
                        <IconButton
                          onClick={clearSignature}
                          size="small"
                          sx={{ color: "red" }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Signature Field */}
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: 1,
                      mt: 1,
                    }}
                  >
                    <div
                      className="Signaturefield"
                      style={{
                        margin: "0 auto",
                        width: "80%",
                        maxWidth: 1000,
                      }}
                    >
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                          style: {
                            width: "100%",
                            height: "100%",
                            pointerEvents: signatureEditable ? "auto" : "none",
                          },
                        }}
                        onEnd={handleEnd}
                      />
                    </div>
                  </Box>
                </Box>
              </DialogContent>

              <Divider />
              <DialogActions
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  paddingBottom: 20,
                  paddingTop: 20,
                }}
              >
                <Button
                  type="submit"
                  className="me-1"
                  variant="contained"
                  color="primary"
                  disabled={
                    allFormData.Status === "0" || SaveUpdateName === "SAVE"
                  }
                  name={QcSaveUpdateName}
                  onClick={onSubmitQC}
                >
                  {QcSaveUpdateName}
                </Button>
                <Button
                  type="button"
                  color="error"
                  variant="contained"
                  className="me-1"
                  onClick={closeQCModal}
                >
                  CLOSE
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
