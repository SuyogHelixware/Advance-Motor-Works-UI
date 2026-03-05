import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";

import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import SearchInputField from "../Components/SearchInputField";

import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import {
  InputFields,
  InputSelectTextField,
  InputTextField,
  SelectedDatePickerField,
  SelectedYearPickerField,
} from "../Components/formComponents";
import usePermissions from "../Components/usePermissions";
import { Loader } from "../Components/Loader";

export default function PostingPeriod() {
  const theme = useTheme();
  const perms = usePermissions(42);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const timeoutRef = useRef(null);
  let [ok, setok] = useState("OK");

  //=====================================get List State======================================
  const [DocEntry, setDocEntry] = useState("");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  //=====================================open List State=====================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================Period Indicator====================================
  const [openIndicator, setopenIndicator] = useState(false);
  const [IndicatorList, setIndicatorList] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  // ===================================================================================
  const [selectedIndicatorRowId, setSelectedIndicatorRowId] = useState(null);
  const [defaultPostingDate, setDefaultPostingDate] = useState(null);
  const [defaultPostingToDate, setDefaultPostingToDate] = useState(null);

  const [postingDate, setpostingDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD "),
  );
  const [DueDate, setDueDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD "),
  );

  const [DocDate, setDocDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD "),
  );
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Code: "",
    Name: "",
    Description: "",
    SubPeriod: "",
    NoOfPeriods: "",
    PeriodStat: "N",
    Indicator: "",
    StrtFisclYear: "",
    FisclYear: "",
    Category: "",
    DueDteTo: "",
    DocmntDteTo: "",
    PostngDteFrom: "",
    PostngDteTo: "",
    DueDteFrom: "",
    DocmntDteFrom: "",
  };

  const { control, setValue, reset, watch, handleSubmit } = useForm({
    defaultValues: initialFormData,
  });
  const { isDirty } = useFormState({ control });
  const nameValue = watch("Name");
  const subPeriod = watch("SubPeriod");
  const noOfPeriods = watch("NoOfPeriods");
  const postingFrom = watch("PostngDteFrom");

  const initialIndicatorData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Code: "",
    Descrip: "",
  };

  const {
    handleSubmit: HandleIndicatorForm,
    control: ControlIndicate,
    reset: resetIndicate,
    // getValues: getValues1,
    // setValue: setValueIndic,
  } = useForm({
    defaultValues: initialIndicatorData,
  });
  // const IndicateDoc = getValues1();

  const statusData = [
    { key: "N", value: "Unlocked" },
    { key: "S", value: "Unlocked Expert Sales" },
    { key: "C", value: "Closing Period" },
    { key: "Y", value: "Locked" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const clearFormData = async () => {
    resetIndicate(initialIndicatorData);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    await fetchAllPostingPeriods();
    reset(buildDefaultFormData());
  };

  useEffect(
    () => {
      fetchOpenListData(0);
      fetchAllPostingPeriods();
      fetchData();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ==================================featch more data============================
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
        ? `/PostingPeriod/Search/${searchTerm}/1/${pageNum}/20`
        : `/PostingPeriod/Pages/1/${pageNum}/20`;

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
  const fetchAllPostingPeriods = async () => {
    try {
      setIsLoading(true);

      const response = await apiClient.get("/PostingPeriod/All");

      const { success, values, message } = response?.data || {};

      // ❌ API responded but failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch posting periods",
          confirmButtonText: "OK",
        });
        return;
      }

      const allPeriods = Array.isArray(values) ? values : [];

      // ❌ No posting periods found
      if (allPeriods.length === 0) {
        Swal.fire({
          icon: "warning",
          text: "No posting periods found.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ✅ Find max "To" date
      const maxToDate = allPeriods.reduce((max, period) => {
        const toDate = dayjs(period.PostngDteTo, "MM/DD/YYYY HH:mm:ss");
        return toDate.isAfter(max) ? toDate : max;
      }, dayjs("1900-01-01"));

      const nextYear = maxToDate.year() + 1;
      const nextFromDate = dayjs(`04/01/${nextYear}`, "MM/DD/YYYY");
      const nextToDate = nextFromDate.add(1, "year").subtract(1, "day");

      // ✅ Set defaults
      setDefaultPostingDate(nextFromDate);
      setDefaultPostingToDate(nextToDate);
    } catch (error) {
      let errorMessage = "Something went wrong while fetching posting periods.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        text: errorMessage,
        confirmButtonText: "OK",
      });

      console.error("Error fetching all posting periods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================Search OPen List======================================
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
          SetOldDataFetch(DocEntry);
          // setSaveUpdateName("UPDATE");
        });
      } else {
        SetOldDataFetch(DocEntry);
        // setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting Doc Series data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const SetOldDataFetch = async (DocEntry) => {
    if (!DocEntry) {
      Swal.fire({
        icon: "warning",
        text: "Invalid document reference.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.get(`/PostingPeriod/${DocEntry}`);

      const { success, values, message } = response?.data || {};

      // ❌ API responded but failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch posting period data.",
          confirmButtonText: "OK",
        });
        return;
      }

      const data = values;

      // ❌ No data returned
      if (!data) {
        Swal.fire({
          icon: "warning",
          text: "No data found for selected posting period.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ✅ UI state updates
      toggleDrawer();
      setDefaultPostingDate(null);
      setDefaultPostingToDate(null);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);

      const correctIndicatorCode =
        IndicatorList.find((item) => item.DocEntry === data.Indicator)?.Code ||
        "";

      console.log("Indicator Code:", correctIndicatorCode);

      // ✅ Reset form
      reset({
        ...data,
        ModifiedBy: data.ModifiedBy,
        CreatedBy: data.CreatedBy,
        Category: data.Category,
        DocEntry: data.DocEntry,
        Indicator: data.Indicator,
        SubPeriod: data.SubPeriod,
        PeriodStat: data.PeriodStat,
        FisclYear: data.FisclYear,
        ModifiedDate: dayjs(data.ModifiedDate).format("YYYY-MM-DD"),
        StrtFisclYear: dayjs(data.StrtFisclYear).format("YYYY-MM-DD"),
        PostngDteFrom: dayjs(data.PostngDteFrom).format("YYYY-MM-DD"),
      });

      // ✅ Set dependent fields after reset
      setTimeout(() => {
        setValue("SubPeriod", data.SubPeriod);
        setpostingDate(data.PostngDteFrom);
        setDocDate(data.DocmntDteFrom);
        setDueDate(data.DueDteFrom);
      }, 0);
    } catch (error) {
      let errorMessage = "Something went wrong while fetching posting period.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        text: errorMessage,
        confirmButtonText: "OK",
      });

      console.error("Error fetching posting period:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const HandlePIndicatorOpen = () => setopenIndicator(true);
  const handleClose = () => setopenIndicator(false);

  const handleSubmitForm = async (data) => {
    // ------------------ VALIDATIONS ------------------
    if (
      data.PostngDteTo &&
      dayjs(data.PostngDteTo).isBefore(dayjs(postingDate), "day")
    ) {
      await Swal.fire({
        title: "Error!",
        text: "Posting To Date cannot be before Posting From Date",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (
      data.DueDteTo &&
      dayjs(data.DueDteTo).isBefore(dayjs(data.DueDteFrom), "day")
    ) {
      await Swal.fire({
        title: "Error!",
        text: "Due To Date cannot be before Due From Date",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (
      data.DocmntDteTo &&
      dayjs(data.DocmntDteTo).isBefore(dayjs(data.DocmntDteFrom), "day")
    ) {
      await Swal.fire({
        title: "Error!",
        text: "Doc To Date cannot be before Doc From Date",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // ------------------ PAYLOAD ------------------
    const obj = {
      DocEntry: data.DocEntry,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
      ModifiedBy: data.ModifiedBy,
      ModifiedDate: dayjs(data.ModifiedDate).format("YYYY-MM-DD"),
      Status: "1",
      Name: data.Name,
      Description: data.Description || "0",
      SubPeriod: data.SubPeriod,
      NoOfPeriods: data.NoOfPeriods || "0",
      PeriodStat: data.PeriodStat,
      FisclYear: data.FisclYear,
      PostngDteFrom: dayjs(data.PostngDteFrom).format("YYYY-MM-DD"),
      PostngDteTo: dayjs(data.PostngDteTo).format("YYYY-MM-DD"),
      DueDteFrom: dayjs(data.DueDteFrom).format("YYYY-MM-DD"),
      DueDteTo: dayjs(data.DueDteTo).format("YYYY-MM-DD"),
      DocmntDteFrom: dayjs(data.DocmntDteFrom).format("YYYY-MM-DD"),
      DocmntDteTo: dayjs(data.DocmntDteTo).format("YYYY-MM-DD"),
      StrtFisclYear: dayjs(data.StrtFisclYear).format("YYYY-MM-DD"),
      Category: SaveUpdateName === "SAVE" ? data.Name : data.Category,
      Indicator: data.Indicator,
      SubNum: data.SubNum || "",
      WasStatChd: data.WasStatChd || "",
      oModel: data.oModel || [],
    };

    try {
      setIsLoading(true);
      // ================= SAVE =================
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/PostingPeriod`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          setSelectedData([]);

          Swal.fire({
            title: "Success!",
            text: "Posting Period Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1500, // ✅ SUCCESS TIMER
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "warning",
            confirmButtonText: "Ok", // ❌ NO TIMER
          });
        }
      }

      // ================= UPDATE =================
      else {
        const confirmation = await Swal.fire({
          text: `Do You Want to Update "${obj.Name}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!confirmation.isConfirmed) {
          Swal.fire({
            text: "Posting Period Not Updated",
            icon: "info",
            confirmButtonText: "Ok", // ❌ NO TIMER
          });
          return;
        }

        const response = await apiClient.put(
          `/PostingPeriod/${obj.DocEntry}`,
          obj,
        );

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          setSelectedData([]);

          Swal.fire({
            title: "Success!",
            text: "Posting Period Updated",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1500, // ✅ SUCCESS TIMER
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "warning",
            confirmButtonText: "Ok", // ❌ NO TIMER
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    } finally {
      setIsLoading(false);
    }
  };

  // +++++++++++++++++++++++++++++++++INDICATOR FUNCTION+++++++++++++++++++++++++++++++++++++++++++++++++++
  // Function to calculate Posting To Date
  const calculatePostingToDate = () => {
    if (!postingFrom || !subPeriod || !noOfPeriods) {
      setValue("PostngDteTo", defaultPostingToDate);
      return;
    }
    let endDate = dayjs(postingFrom);
    if (SaveUpdateName === "SAVE") {
      switch (subPeriod) {
        case "Y":
          endDate = endDate.add(noOfPeriods, "year").subtract(1, "day");
          break;
        case "Q":
          endDate = endDate.add(noOfPeriods * 3, "month").subtract(1, "day");
          break;
        case "M":
          endDate = endDate.add(noOfPeriods, "month").subtract(1, "day");
          break;
        case "D":
          endDate = endDate.add(parseInt(noOfPeriods, 10), "day"); // no -1
          break;
        default:
          return;
      }

      setValue("PostngDteTo", endDate.format("YYYY-MM-DD"));
    }
  };
  // Call it inside useEffect
  useEffect(
    () => {
      if (SaveUpdateName === "SAVE") {
        calculatePostingToDate();
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      postingFrom,
      subPeriod,
      noOfPeriods,
      SaveUpdateName,
      defaultPostingToDate,
      setValue,
    ],
  );

  const buildDefaultFormData = () => {
    if (defaultPostingDate && defaultPostingToDate) {
      const dateObj = dayjs(defaultPostingDate);
      return {
        ...initialFormData,
        PostngDteFrom: defaultPostingDate,
        DueDteFrom: defaultPostingDate,
        DocmntDteFrom: defaultPostingDate,
        PostngDteTo: defaultPostingToDate,
        DueDteTo: defaultPostingToDate,
        DocmntDteTo: defaultPostingToDate,
        StrtFisclYear: dateObj.startOf("month"),
        FisclYear: dateObj.year().toString(),
      };
    }
    return initialFormData;
  };
  useEffect(
    () => {
      if (SaveUpdateName === "SAVE") {
        const defaults = buildDefaultFormData();
        reset(defaults);

        if (defaultPostingDate) {
          setpostingDate(defaultPostingDate);
          setDocDate(defaultPostingDate);
          setDueDate(defaultPostingDate);
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultPostingDate, defaultPostingToDate, reset],
  );

  const handleAddOrUpdate = async (data) => {
    console.log("DATA", data);

    const initialIndicatorData = {
      DocEntry: data.DocEntry,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: selectedIndicatorRowId ? dayjs().format("YYYY-MM-DD") : "",
      Status: "1",
      Code: data.Code || "0",
      Descrip: data.Descrip || "0",
      model: data.model || "0",
    };

    const apiUrl = selectedIndicatorRowId
      ? `/Indicators/${selectedIndicatorRowId}` // PUT API for Update
      : `/Indicators`; // POST API for Add

    const method = selectedIndicatorRowId ? "put" : "post";

    try {
      if (selectedIndicatorRowId !== null || selectedIndicatorRowId !== "") {
        // 🔹 Direct Save (Add or Update)
        const response = await apiClient[method](apiUrl, initialIndicatorData);

        if (response.data?.success) {
          await fetchData();
          clearFormData();
          setSelectedIndicatorRowId(null);

          Swal.fire({
            title: "Success!",
            text: `Indicator ${
              selectedIndicatorRowId ? "updated" : "added"
            } successfully!`,
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1500,
          });
        } else {
          Swal.fire("Error!", response.data?.message || "Failed!", "error");
        }
      } else {
        // 🔹 Confirm Update mode
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.Code}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/Indicators/${selectedIndicatorRowId}`,
            initialIndicatorData,
          );

          if (response.data?.success) {
            await fetchData();
            clearFormData();
            setSelectedIndicatorRowId(null);

            Swal.fire({
              title: "Success!",
              text: "Indicator Updated Successfully!",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire(
              "Error!",
              response.data?.message || "Update failed!",
              "error",
            );
          }
        } else {
          Swal.fire({
            text: "Indicator is Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const handleOnDelete = async () => {
    const confirmation = await Swal.fire({
      text: "Do You Want to Delete?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!confirmation.isConfirmed) {
      await Swal.fire({
        text: "Posting Period Not Deleted",
        icon: "info",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.delete(`/PostingPeriod/${DocEntry}`);

      if (response.data.success === true) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        await Swal.fire({
          title: "Success!",
          text: "Posting Period Deleted",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1500, // ✅ SUCCESS TIMER
        });
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
          confirmButtonText: "Ok", // ❌ NO TIMER
        });
      }
    } catch (error) {
      console.error("Delete error:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while deleting.",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------
  // Handle Edit
  // const handleEdit = (row) => {
  //   setSelectedRowId(row.id);
  //   setUpdatedIndicator(row.Code || ""); // Ensure row.Code exists
  //   setValueIndic("Code", row.Code || "");
  //   setValueIndic("Descrip", row.Descrip || "");
  //   setValueIndic("model", row.model || "");
  //   setValueIndic("DocEntry",row.DocEntry)
  //   console.log(row.DocEntry)
  // };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const res = await apiClient.get(`/Indicators/All`);
      const response = res.data;

      if (response.success === true) {
        setIndicatorList(response.values || []);
        reset(response.values || []);
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.message || "Failed to fetch Indicators",
          icon: "warning",
          confirmButtonText: "Ok", // ❌ NO TIMER
        });
      }
    } catch (error) {
      console.error("Fetch Indicators Error:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching Indicators",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "Code", headerName: "Period Indicator", width: 250 },
    // {
    //   field: "edit",
    //   headerName: "Edit",
    //   width: 100,
    //   renderCell: (params) => (
    //     <IconButton color="primary" onClick={() => {handleEdit(params.row); }}>
    //     <EditIcon />
    //   </IconButton>

    //   ),
    // },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <>
          {/* <IconButton
          color="primary"
          onClick={() => handleEdit(params.row)}
        >
          <EditIcon />
        </IconButton> */}
          <IconButton
            color="error"
            onClick={() => handleIndicateDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  // const handleEdit = async (row) => {
  //   try {
  //     const res = await apiClient.get(`/Indicators/${row.DocEntry}`);
  //     const response = res.data;

  //     if (response.success) {
  //       const { DocEntry, Code } = response.values;

  //       // Set the Code into the form field
  //       setValueIndic("Code", Code);

  //       // Store DocEntry for later update
  //       setSelectedIndicatorRowId(DocEntry);
  //     } else {
  //       Swal.fire("Error!", response.message, "warning");
  //     }
  //   } catch (error) {
  //     Swal.fire("Error!", error.message || error, "error");
  //   }
  // };

  const handleIndicateDelete = async (data) => {
    console.log("DATADELETED", data.DocEntry);

    const confirmation = await Swal.fire({
      text: `Do You Want to Delete "${data.Code}" ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!confirmation.isConfirmed) {
      await Swal.fire({
        text: "Indicator Not Deleted",
        icon: "info",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.delete(`/Indicators/${data.DocEntry}`);

      if (response.data.success) {
        clearFormData();
        fetchData();

        await Swal.fire({
          title: "Success!",
          text: "Indicator Deleted",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1500, // ✅ SUCCESS TIMER
        });
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
          confirmButtonText: "Ok", // ❌ NO TIMER
        });
      }
    } catch (error) {
      console.error("Delete Indicator Error:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while deleting Indicator",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
          Posting Period List
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
                  key={item.DocEntry}
                  title={item.Category}
                  subtitle={item.Description}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  description={
                    statusData.find((status) => status.key === item.PeriodStat)
                      ?.value || "Unknown"
                  }
                  onClick={() => setOldOpenData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  // ========================PERIOD INDICATOR =====================================
  return (
    <>
      {isLoading && <Loader open={isLoading} />}

      {/* =================================PERIOD INDICATOR START======================================= */}
      {/* Modal Peroid Indicator */}
      <Dialog
        open={openIndicator}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
            height: "500px",
          },
        }}
      >
        {/* 🔹 Dialog Title with Close Icon */}
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
          }}
        >
          PERIOD INDICATOR
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <form onSubmit={HandleIndicatorForm(handleAddOrUpdate)}>
            <Grid container spacing={2} alignItems="center" mt={2}>
              <Grid item xs={8}>
                <Controller
                  name="Code"
                  control={ControlIndicate}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputFields
                      {...field}
                      label="Enter Period Indicator"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {selectedIndicatorRowId ? "UPDATE" : "ADD"}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* 🔹 DataGrid with scrollable rows only */}
          <Grid
            item
            xs={12}
            sx={{
              flexGrow: 1,
              marginTop: "15px",
            }}
          >
            <DataGrid
              className="datagrid-style"
              rows={IndicatorList.map((data, index) => ({
                ...data,
                id: data.id || index + 1,
              }))}
              columns={columns}
              pageSize={5}
              hideFooter
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              sx={{
                height: "310px",
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto !important", // only body scrolls
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 2, // ensure it stays above rows
                },
              }}
            />
          </Grid>
        </DialogContent>
      </Dialog>
      {/* =================================PERIOD INDICATOR END======================================= */}

      {/* =============== */}
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
        >
          {/* Hamburger Menu for smaller screens */}

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
            onClick={clearFormData}
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
              Posting Period
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
              textTransform={"uppercase"}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid
                  container
                  textTransform={"uppercase"}
                  marginBottom={"10px"}
                >
                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Name"
                      control={control}
                      rules={{
                        required: "Period Code is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PERIOD CODE"
                          type="text"
                          {...field}
                          disabled={SaveUpdateName === "UPDATE"}
                          inputProps={{ maxLength: 20 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          onChange={(e) => {
                            field.onChange(e); // update form state
                            setValue("Category", e.target.value); // instantly update Category
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Description"
                      control={control}
                      // rules={{
                      //   required: " this fild is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PERIOD DESC"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="SubPeriod"
                      control={control}
                      rules={{ required: "Sub Period is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="SUB-PERIOD"
                          {...field}
                          value={field.value || ""}
                          disabled={SaveUpdateName === "UPDATE"}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);

                            switch (value) {
                              case "Y":
                                setValue("NoOfPeriods", "1", {
                                  shouldValidate: true,
                                });
                                break;
                              case "Q":
                                setValue("NoOfPeriods", "4", {
                                  shouldValidate: true,
                                });
                                break;
                              case "M":
                                setValue("NoOfPeriods", "12", {
                                  shouldValidate: true,
                                });
                                break;
                              default:
                                setValue("NoOfPeriods", ""); // D or other → manual input
                                break;
                            }
                          }}
                          data={[
                            // { key: "0", value: "Select Sub-Period" },
                            { key: "Y", value: "Year" },
                            { key: "Q", value: "Quarters" },
                            { key: "M", value: "Months" },
                            { key: "D", value: "Days" },
                          ]}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="NoOfPeriods"
                      control={control}
                      rules={{ required: "No of Period is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="No. of Periods"
                          {...field}
                          type="number"
                          inputProps={{ maxLength: 10 }}
                          disabled={
                            subPeriod === "Y" || SaveUpdateName === "UPDATE"
                          }
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    justifyContent="center"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Grid
                      textAlign={"center"}
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                      width="100%"
                      sx={{ width: 220 }}
                      gap={1} // spacing like the reference
                    >
                      <Controller
                        name="Indicator"
                        control={control}
                        rules={{ required: "Indicator is required" }}
                        render={({ field, fieldState: { error } }) => {
                          const labelId = "indicator-label";

                          return (
                            <>
                              <FormControl
                                fullWidth
                                error={!!error}
                                variant="outlined"
                                size="small"
                              >
                                <InputLabel id={labelId}>
                                  Period Indicator
                                </InputLabel>

                                <Select
                                  {...field}
                                  labelId={labelId}
                                  input={
                                    <OutlinedInput label="Period Indicator" />
                                  }
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 200,
                                        overflowY: "auto",
                                      },
                                    },
                                  }}
                                >
                                  {IndicatorList.map((item) => (
                                    <MenuItem key={item.Code} value={item.Code}>
                                      {item.Code}
                                    </MenuItem>
                                  ))}
                                </Select>

                                {error && (
                                  <FormHelperText>
                                    {error.message}
                                  </FormHelperText>
                                )}
                              </FormControl>

                              {/* OUTSIDE ICON (reference matched) */}
                              <IconButton
                                onClick={HandlePIndicatorOpen}
                                size="small"
                                sx={{
                                  backgroundColor: "#00AEEF",
                                  color: "white",
                                  borderRadius: "5px",
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <DragIndicatorIcon />
                              </IconButton>
                            </>
                          );
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Category"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Category"
                          disabled
                          value={nameValue}
                          type="text"
                          {...field}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="PeriodStat"
                      control={control}
                      rules={{
                        required: "Period Status is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="Period Status"
                          data={[
                            { key: "N", value: "Unlocked" },
                            { key: "S", value: "Unlocked Expert Sales" },
                            { key: "C", value: "Closing Period" },
                            { key: "Y", value: "Locked" },
                          ]}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          // disabled={!isEditMode}
                          disabled={SaveUpdateName === "SAVE"}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4} textAlign="center">
                    <Controller
                      name="StrtFisclYear"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (value && dayjs(value).date() !== 1) {
                            return "Start Fiscal Year is required";
                          }
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Start Fiscal Year"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            if (newValue && dayjs(newValue).date() === 1) {
                              setValue("StrtFisclYear", newValue);
                            }
                          }}
                          shouldDisableDate={(date) => dayjs(date).date() !== 1}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FisclYear"
                      control={control}
                      // rules={{ required: "Model Year is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedYearPickerField
                          label="FISCAL YEAR"
                          name={field.name}
                          value={field.value} // `field.value` will be a string like "2009"
                          onChange={(date) => {
                            // Ensure the selected year is correctly passed back as ISO string
                            field.onChange(
                              date ? dayjs(date).toISOString() : undefined,
                            );
                            setValue(
                              "FisclYear",
                              date ? dayjs(date).year().toString() : "", // Save only the year as a string
                            );
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                    {/* <Controller
                      name="FisclYear"
                      control={control}
                      // rules={{
                      //   required: "Fiscal Year is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputFields
                          label="Fiscal Year"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    /> */}
                  </Grid>
                </Grid>
                <Divider />
                <Grid container textTransform={"uppercase"} marginTop={"10px"}>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="PostngDteFrom"
                      control={control}
                      // rules={{ required: "Posting From Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Posting From Date"
                          name={field.name}
                          // minDate={defaultPostingDate}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setpostingDate(newValue);
                            setValue("PostngDteFrom", newValue);
                            if (newValue) {
                              const dateObj = dayjs(newValue);

                              const startFiscal = dateObj.startOf("month");
                              setValue("StrtFisclYear", startFiscal);
                              calculatePostingToDate();

                              setValue("FisclYear", dateObj.year().toString());
                            }
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="PostngDteTo"
                      control={control}
                      rules={{
                        required: "Posting To Date is Required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          {...field}
                          label="Posting To Date"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            // update raw input only, no validation
                            setValue("PostngDteTo", newValue, {
                              shouldValidate: false,
                            });
                          }}
                          onBlur={() => {
                            field.onBlur();
                            const currentValue = field.value;
                            const minDate = dayjs(postingDate);
                            if (
                              currentValue &&
                              dayjs(currentValue).isBefore(minDate, "day")
                            ) {
                              // auto-correct only after typing complete
                              setValue("PostngDteTo", postingDate, {
                                shouldValidate: true,
                              });
                            } else {
                              setValue("PostngDteTo", currentValue, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          minDate={postingDate}
                          disabled={
                            !postingDate ||
                            subPeriod === "Q" ||
                            subPeriod === "M"
                          }
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="DueDteFrom"
                      control={control}
                      rules={{ required: "Due From Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Due From Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("DueDteFrom", newValue);
                            setDueDate(newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="DueDteTo"
                      control={control}
                      rules={{
                        required: "Due To Date is Required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          {...field}
                          label="Due To Date"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            setValue("DueDteTo", newValue, {
                              shouldValidate: false,
                            });
                          }}
                          onBlur={() => {
                            field.onBlur();
                            const currentValue = field.value;
                            const minDate = dayjs(DueDate);
                            if (
                              currentValue &&
                              dayjs(currentValue).isBefore(minDate, "day")
                            ) {
                              setValue("DueDteTo", DueDate, {
                                shouldValidate: true,
                              });
                            } else {
                              setValue("DueDteTo", currentValue, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          minDate={DueDate}
                          disabled={!DueDate}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="DocmntDteFrom"
                      control={control}
                      rules={{ required: "Doc From Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Doc FROM DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("DocmntDteFrom", newValue);
                            setDocDate(newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} sm={6} xs={12} textAlign="center">
                    <Controller
                      name="DocmntDteTo"
                      control={control}
                      rules={{
                        required: "Doc To Date is Required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          {...field}
                          label="Doc TO DATE"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            // just update, no validation yet
                            setValue("DocmntDteTo", newValue, {
                              shouldValidate: false,
                            });
                          }}
                          onBlur={() => {
                            field.onBlur();
                            const currentValue = field.value;
                            const minDate = dayjs(DocDate);
                            if (
                              currentValue &&
                              dayjs(currentValue).isBefore(minDate, "day")
                            ) {
                              setValue("DocmntDteTo", DocDate, {
                                shouldValidate: true,
                              });
                            } else {
                              setValue("DocmntDteTo", currentValue, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          minDate={DocDate}
                          disabled={!DocDate}
                          error={!!error}
                          helperText={error ? error.message : null}
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
                bottom: "0px",
              }}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  name={SaveUpdateName}
                  sx={{ color: "white " }}
                  // onClick={handleSubmitForm}
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                  }
                >
                  {SaveUpdateName}
                </Button>
              </Grid>

              <Grid item>
                <Button
                  disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                  onClick={handleOnDelete}
                  variant="contained"
                  color="error"
                >
                  DELETE
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
