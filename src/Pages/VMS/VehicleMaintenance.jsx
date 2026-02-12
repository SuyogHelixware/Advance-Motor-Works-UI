import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme
} from "@mui/material";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";

import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../services/apiClient";
import {
  InputFields,
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
  ModelInputText,
  SelectedDatePickerField
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";

export default function VehicleMaintenance() {
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(152);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const [MaintenanceData, setMaintenance] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearCache, setClearCache] = useState(false);

  const [OpenDrivar, setOpenDrivar] = useState(false);
  const [DriverListData, setDriverListData] = useState([]);
  const [DriverListPage, setDriverListPage] = useState(0);
  const [DriverListquery, setDriverListQuery] = useState("");
  const [DriverListSearching, setDriverListSearching] = useState(false);
  const [hasMoreDriverGetList, setHasMoreDriverGetList] = useState(true);

  const [openCategory, setopenCategory] = useState(false);
  const [selectedCategoryRowId, setSelectedCategoryRowId] = useState(null);
  const [CategoryList, setCategoryList] = useState([]);

  const [openVehicleType, setopenVehicleType] = useState(false);
  const [selectedVehicleTypeRowId, setSelectedVehicleTypeRowId] =
    useState(null);
  const [VehicleTypeList, setVehicleTypeList] = useState([]);
  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: "",
    Status: "1",
    MainDate: dayjs().format("YYYY-MM-DD"),
    VehicleID: "",
    VehicleName: "",
    Remarks: "",
    VehicleType: "",
    Series: "",
    DocNum: "",
    KMReading: "",
    AttcEntry: "",
    oLines: [],
  };
  // ==============useForm====================================
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    clearErrors,
  } = useForm({
    defaultValues: initial,
  });
  const rows = watch("oLines") || [];

  const rawDate = watch("MainDate");
  const MainDate = rawDate ? dayjs(rawDate).format("YYYY-MM-DD") : null;
  const AllData = getValues();
  const { DocSeries } = useDocumentSeries(
    "295",
    MainDate,
    setValue,
    clearCache,
    SaveUpdateName
  );
  console.log("dfdfsd", AllData.oLines);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
  };
  //===============================All other API=================================

const MaintenanceCheckApi = async () => {
  try {
    // Start loader
    setLoading(true);

    const res = await apiClient.get(`/MaintCheckPoint/ItemAll`);
    const response = res.data;

    if (response.success === true) {
      // Filter only status "1"
      const FilterMaintenance = response.values.filter(
        (check) => check.Status === "1"
      );
      setMaintenance(FilterMaintenance);
    } else {
      // Handle API success=false
      Swal.fire({
        title: "Warning!",
        text: response.message || "Something went wrong.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      setMaintenance([]); // optional: clear previous data
    }
  } catch (error) {
    // Handle network or unexpected errors
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};


  useEffect(
    () => {
      fetchOpenListData(0);
      MaintenanceCheckApi();
      fetchData();
      fetchDataVehicleType();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  //==================================================================================
  //   const addRow = () => {
  //     setcheckTabRows((prev) =>
  //       reindexRows([
  //         ...prev,
  //         {
  //           id: Date.now(),
  //           Checkpoint: "",
  //           Remarks: "",
  //           IsDone: true,
  //         },
  //       ])
  //     );
  //   };

  const vehicleTooltips = {
    1: "6-Tire HYVA, 10-Tire HYVA, 12-Tire HYVA",
    2: "2WD Tractor, 4WD Tractor",
    3: "Trailer Truck, Tipper Trailer",
    4: "JCB, Pokeland Dumper, Excavator",
    5: "Mini Truck, Pickup",
  };

  const rawData = [
    { key: "1", value: "TIPPER TRUCKS" },
    { key: "2", value: "TRACTORS" },
    { key: "3", value: "TRAILERS" },
    { key: "4", value: "CONSTRUCTION MACHINERY" },
    { key: "5", value: "LIGHT COMMERICAL" },
  ];
  const dataWithTooltip = rawData.map((item) => ({
    key: item.key,
    value: item.value, // ✅ STRING ONLY
    tooltip: vehicleTooltips[item.key] || "",
  }));

  const handleCellChange = useCallback(
    (rowId, field, value) => {
      const rows = getValues("oLines");
      const index = rows.findIndex((r) => r.LineNum === rowId);

      if (index === -1) return;

      // mutate safely (RHF allows this)
      rows[index][field] = value;

      setValue("oLines", rows, {
        shouldDirty: true,
        shouldValidate: false,
        shouldTouch: false,
      });
    },
    [getValues, setValue]
  );

  const columns = useMemo(
    () => [
      {
        field: "Category",
        headerName: "Category",
        width: 250,
        renderCell: (params) => (
          <InputSelectTextField
            value={params.row.Category || ""}
            data={CategoryList.map((item) => ({
              key: item.DocEntry,
              value: item.Type,
            }))}
            disabled={SaveUpdateName==="UPDATE"}
            onChange={(e) =>
              handleCellChange(params.row.LineNum, "Category", e.target.value)
            }
          />
        ),
      },
      // ... rest of the columns remain unchanged
      {
        field: "MaintChkpoint",
        headerName: "Maintenance Point",
        width: 230,
        renderCell: (params) => (
          <ModelInputText
            defaultValue={params.row.MaintChkpoint || ""}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.stopPropagation(); // 🔥 THIS IS THE FIX
              }
            }}
                        disabled={SaveUpdateName==="UPDATE"}

            onBlur={(e) =>
              handleCellChange(
                params.row.LineNum,
                "MaintChkpoint",
                e.target.value
              )
            }
          />
        ),
      },
      {
        field: "ChkpointRemarks",
        headerName: "Remarks",
        width: 250,
        renderCell: (params) => (
          <InputTextField
            defaultValue={params.row.ChkpointRemarks || ""}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.stopPropagation(); // 🔥 THIS IS THE FIX
              }
            }}
            onBlur={(e) =>
              handleCellChange(
                params.row.LineNum,
                "ChkpointRemarks",
                e.target.value
              )
            }
          />
        ),
      },
      {
        field: "IsDone",
        headerName: "Is Done",
        width: 100,
        renderCell: (params) => (
          <Checkbox
            checked={!!params.row.IsDone}
            onChange={(e) =>
              handleCellChange(params.row.LineNum, "IsDone", e.target.checked)
            }
          />
        ),
      },
    ],
    [handleCellChange, CategoryList,SaveUpdateName]
  ); // ✅ Added CategoryList to dependencies

  // const handleAccDeleteRow = (id) => {
  //   const currentRows = getValues("oLines") || [];
  //   const updatedRows = currentRows.filter((_, index) => index !== id);
  //   reset({
  //     ...AllData,
  //     oLines: updatedRows,
  //   });
  // };

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry) => {
    setok("");
    try {
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
          setMaintenanceCheckListDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setMaintenanceCheckListDataList(DocEntry);
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
  const setMaintenanceCheckListDataList = async (DocEntry) => {
  if (!DocEntry) {
    return;
  }

  try {
    // Start loader
    setLoading(true);

    const response = await apiClient.get(`/VehicleMaintainence/${DocEntry}`);
    const data = response.data.values;

    if (!data) {
      Swal.fire({
        title: "Warning!",
        text: "No data found for this entry.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    toggleDrawer();

    reset({
      ...data,
      oLines: (data.oLines || []).map((item) => ({
        DocEntry: data.DocEntry,
        UserId: user.UserId,
        ModifiedBy: user.UserName,
        CreatedBy: user.UserName,
        LineNum: item.LineNum,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        Status: item.Status,
        MaintChkpoint: item.Chkpoint,
        ChkpointRemarks: item.Remarks,
        IsDone: item.IsDone === "Y",
        Category: item.Category,
      })),
    });

    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);

  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "An error occurred while fetching the data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

  // ===============API for Pagination ==================================

 const fetchOpenListData = async (pageNum, searchTerm = "") => {
  try {
    // Start loader
    setLoading(true);

    const url = searchTerm
      ? `/VehicleMaintainence/Search/${searchTerm}/1/${pageNum}/20`
      : `/VehicleMaintainence/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);
    const data = response.data;

    if (data.success) {
      const newData = data.values || [];
      setHasMoreOpen(newData.length === 20);
      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Warning!",
        text: data.message || "No data found.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      setOpenListData([]); // optional: clear previous data
      setHasMoreOpen(false);
    }
  } catch (error) {
    console.error("Error fetching open list data:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong while fetching data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
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

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

 const fetchDriverListData = async (pageNum, searchTerm = "") => {
  try {
    // Start loader
    setLoading(true);

    const url = searchTerm
      ? `/VehicleMan?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
      : `/VehicleMan?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);
    const data = response.data;

    if (data.success) {
      const newData = data.values || [];
      setHasMoreDriverGetList(newData.length === 20);
      setDriverListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Warning!",
        text: data.message || "No driver data found.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      setDriverListData([]); // optional: clear previous data
      setHasMoreDriverGetList(false);
    }
  } catch (error) {
    console.error("Error fetching driver data:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong while fetching driver data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

  const handleDriverListSearch = (res) => {
    setDriverListQuery(res);
    setDriverListSearching(true);
    setDriverListPage(0);
    setDriverListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchDriverListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // Clear search
  const handleDriverListClear = () => {
    setDriverListQuery(""); // Clear search input
    setDriverListSearching(false); // Reset search state
    setDriverListPage(0); // Reset page count
    setDriverListData([]); // Clear data
    fetchDriverListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreDriverListData = () => {
    fetchDriverListData(
      DriverListPage + 1,
      DriverListSearching ? DriverListquery : ""
    );
    setDriverListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchDriverListData(0); // Load first page on mount
  }, []);

  const selectVehiclemaster = (
    VehicleNumber,
    VehicleType,
    LicenseExpiryDate,
    DriverID
  ) => {
    setValue("VehicleName", VehicleNumber);
    setValue("VehicleType", VehicleType);
    setValue("LicenseExpiryDate", LicenseExpiryDate);
    setValue("DriverID", DriverID);
    setOpenDrivar(false);
    const FilterCheckPointData = (MaintenanceData || [])
      .filter((checktype) => checktype.VehicleType === VehicleType)
      .map((item) => item.oLines);
    console.log("Data Oline", FilterCheckPointData[0]);
    const preparedRows = (FilterCheckPointData[0] || []).map((row, index) => ({
      id: index, // or your unique identifier
      ...row,
      IsDone: row.IsDone ?? true, // default to true if undefined or null
    }));
    console.log("prepared", preparedRows);
    setValue("oLines", preparedRows);
    clearErrors("VehicleName");
    clearErrors("VehicleType");
  };

  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
const handleSubmitForm = async (data) => {
  try {
    // Start loader
    setLoading(true);

    console.log("Submitted Data", data);

    const OLines = data.oLines.filter((check) => check.IsDone === true);

    const obj = {
      DocEntry: "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      Status: data.Status,
      MainDate: dayjs(data.MainDate).format("YYYY-MM-DD"),
      VehicleID: data.VehicleID,
      VehicleName: data.VehicleName,
      Remarks: data.Remarks,
      VehicleType: String(data.VehicleType),
      Series: String(data.Series),
      DocNum: data.DocNum,
      KMReading: data.KMReading,
      AttcEntry: data.AttcEntry,
      oLines: (OLines || []).map((item) => ({
        DocEntry: "",
        UserId: user.UserId,
        ModifiedBy: user.UserName,
        CreatedBy: user.UserName,
        LineNum: "",
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        Status: item.Status,
        Chkpoint: item.MaintChkpoint,
        Remarks: item.ChkpointRemarks,
        IsDone: item.IsDone ? "Y" : "N",
        Category: String(item.Category),
        BaseLineNum: item.LineNum || "0",
      })),
    };

    console.log("=======", obj);

    if (SaveUpdateName === "SAVE") {
      // SAVE new record
      const res = await apiClient.post(`/VehicleMaintainence`, obj);

      if (res.data.success) {
        clearFormData();
        setOpenListData([]);
        fetchOpenListData(0);
        setClearCache(true);

        Swal.fire({
          title: "Success!",
          text: "Vehicle Maintenance saved successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message || "Failed to save vehicle maintenance",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } else {
      // UPDATE existing record
      const result = await Swal.fire({
        text: `Do you want to update "${obj.VehicleName}"?`,
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "YES",
        denyButtonText: "No",
      });

      if (result.isConfirmed) {
        const res = await apiClient.put(
          `/VehicleMaintainence/${data.DocEntry}`,
          obj
        );

        if (res.data.success) {
          clearFormData();
          setOpenListData([]);
          setOpenListPage(0);
          setClearCache(true);
          fetchOpenListData(0);

          Swal.fire({
            title: "Success!",
            text: "Vehicle Maintenance updated successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.message || "Failed to update vehicle maintenance",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        Swal.fire({
          text: "Vehicle Maintenance not updated",
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
        "Something went wrong while submitting the form",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

  // ===============Delete API ===================================
const handleOnDelete = async (DocEntry) => {
  try {
    const result = await Swal.fire({
      text: "Do you want to delete ?",
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "YES",
      denyButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "MaintenanceCheckList was not deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // Start loader
    setLoading(true);

    const response = await apiClient.delete(`/VehicleMaintainence/${selectedData}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Record deleted successfully",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        title: "Error",
        text: message || "Failed to delete record",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting record:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting the MaintenanceCheckList.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

  const initialCategoryData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Type: "",
    Description: "",
  };

  const {
    handleSubmit: HandleCategoryForm,
    control: ControlCategory,
    reset: resetCategory,
    // getValues: getValues1,
    setValue: setValueIndic,
  } = useForm({
    defaultValues: initialCategoryData,
  });
  const HandlePCategoryOpen = () => setopenCategory(true);
  const handleClose = () => setopenCategory(false);
 const fetchData = async () => {
  try {
    // Start loader
    setLoading(true);

    const res = await apiClient.get(`/VehicleMaintCateg?Status=1&Page=0&Limit=100`);
    const response = res.data;

    console.log("Fetched Category Data:", response);

    if (response.success) {
      setCategoryList(response.values || []);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response.message || "Failed to fetch categories.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      setCategoryList([]); // optional: clear previous data
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong while fetching categories.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

 const handleAddOrUpdate = async (data) => {
  try {
    setLoading(true); // Start loader
    console.log("DATA", data);

    const obj = {
      DocEntry: data.DocEntry || "0",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: "1",
      Type: data.Type || "",
      Description: data.Description || "",
    };

    const isUpdate = selectedCategoryRowId !== null && selectedCategoryRowId !== "";
    const apiUrl = isUpdate
      ? `/VehicleMaintCateg/${selectedCategoryRowId}`
      : `/VehicleMaintCateg`;
    const method = isUpdate ? "put" : "post";

    // Confirm before update
    if (isUpdate) {
      const result = await Swal.fire({
        text: `Do you want to update "${data.Code}"?`,
        icon: "question",
        showDenyButton: true,
        confirmButtonText: "YES",
        denyButtonText: "No",
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Category not updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    }

    // Call API
    const response = await apiClient[method](apiUrl, obj);

    if (response.data?.success) {
      await fetchData(); // refresh list
      resetCategory(initialCategoryData);
      setSelectedCategoryRowId(null);

      Swal.fire({
        title: "Success!",
        text: `Category ${isUpdate ? "updated" : "added"} successfully!`,
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire("Error!", response.data?.message || "Operation failed!", "error");
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
  } finally {
    setLoading(false); // Stop loader
  }
};

  const CategoryColumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "Type", headerName: "CATEGORY", width: 200 },
    { field: "Description", headerName: "DETAILS", width: 200 },

    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            handleEdit(params.row);
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
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
            onClick={() => handleCategoryDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const handleCategoryDelete = async (data) => {
  try {
    const result = await Swal.fire({
      text: `Do you want to delete "${data.Type}"?`,
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "YES",
      denyButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Category not deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // Start loader
    setLoading(true);

    const response = await apiClient.delete(`/VehicleMaintCateg/${data.DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      await fetchData(); // refresh category list

      Swal.fire({
        title: "Success!",
        text: "Category deleted successfully",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to delete category",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error deleting category:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while deleting the category.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

const handleEdit = async (row) => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/VehicleMaintCateg?DocEntry=${row.DocEntry}`);
    const response = res.data;

    if (response.success) {
      const { DocEntry, Type, Description } = response.values;

      // Set form values
      setValueIndic("Type", Type);
      setValueIndic("Description", Description);

      // Store DocEntry for later update
      setSelectedCategoryRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response.message || "Failed to fetch category details",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong while fetching category details.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  //====================================vehicle type===============================================
  const initialVehicleTypeData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Name: "",
    Description: "",
  };

  const {
    handleSubmit: HandleVehicleTypeForm,
    control: ControlVehicleType,
    reset: resetVehicleType,
    // getValues: getValues1,
    setValue: setValueVehicleType,
  } = useForm({
    defaultValues: initialVehicleTypeData,
  });
  const HandlePVehicleTypeOpen = () => setopenVehicleType(true);
  const handleCloseVehicleType = () => setopenVehicleType(false);
  const fetchDataVehicleType = async () => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/VehicleType?Status=1&Page=0&Limit=100`);
    const response = res.data;

    console.log("Fetched Vehicle Type Data:", response);

    if (response.success) {
      setVehicleTypeList(response.values || []);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response.message || "Failed to fetch vehicle types.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      setVehicleTypeList([]); // optional: clear previous data
    }
  } catch (error) {
    console.error("Error fetching vehicle types:", error);

    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Something went wrong while fetching vehicle types.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

 const handleAddOrUpdateVehicleType = async (data) => {
  try {
    setLoading(true); // Start loader
    console.log("DATA", data);

    const obj = {
      DocEntry: data.DocEntry || "0",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: "1",
      Name: data.Name || "",
      Description: data.Description || "",
    };

    const isUpdate =
      selectedVehicleTypeRowId !== null && selectedVehicleTypeRowId !== "";
    const apiUrl = isUpdate
      ? `/VehicleType/${selectedVehicleTypeRowId}` // PUT for update
      : `/VehicleType`; // POST for add
    const method = isUpdate ? "put" : "post";

    // Confirm update if editing
    if (isUpdate) {
      const result = await Swal.fire({
        text: `Do you want to update "${data.Name}"?`,
        icon: "question",
        showDenyButton: true,
        confirmButtonText: "YES",
        denyButtonText: "No",
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Vehicle Type not updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    }

    // Call API
    const response = await apiClient[method](apiUrl, obj);

    if (response.data?.success) {
      await fetchDataVehicleType(); // refresh list
      resetVehicleType(initialVehicleTypeData);
      setSelectedVehicleTypeRowId(null);

      Swal.fire({
        title: "Success!",
        text: `Vehicle Type ${isUpdate ? "updated" : "added"} successfully!`,
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire("Error!", response.data?.message || "Operation failed!", "error");
    }
  } catch (error) {
    console.error("Error submitting Vehicle Type form:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while submitting the Vehicle Type.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  const VehicleTypecolumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "Name", headerName: "Vehicle Type", width: 200 },
    { field: "Description", headerName: "DETAILS", width: 200 },

    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            handleVehicleTypeEdit(params.row);
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
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
            onClick={() => handleVehicleTypeDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
 const handleVehicleTypeDelete = async (data) => {
  try {
    const result = await Swal.fire({
      text: `Do you want to delete "${data.Name}"?`,
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "YES",
      denyButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Vehicle Type not deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // Start loader
    setLoading(true);

    const response = await apiClient.delete(`/VehicleType/${data.DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      await fetchDataVehicleType(); // refresh list

      Swal.fire({
        title: "Success!",
        text: "Vehicle Type deleted successfully",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to delete Vehicle Type",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error deleting Vehicle Type:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while deleting the Vehicle Type.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    // Stop loader
    setLoading(false);
  }
};

 const handleVehicleTypeEdit = async (row) => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/VehicleType?DocEntry=${row.DocEntry}`);
    const response = res.data;

    if (response.success) {
      const { DocEntry, Name, Description } = response.values;

      // Set form values
      setValueVehicleType("Name", Name);
      setValueVehicleType("Description", Description);

      // Store DocEntry for later update
      setSelectedVehicleTypeRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response.message || "Failed to fetch vehicle type details",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching vehicle type:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching vehicle type details.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
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
          VEHICLE MAINTENANCE LIST
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
                    title={item.VehicleName}
                    subtitle={item.Description}
                    isSelected={selectedData === item.DocEntry}
                    searchResult={openListquery}
                    onClick={() => setOldOpenData(item.DocEntry)}
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
      <Dialog
        open={openVehicleType}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "80vw",
            height: "80vh",
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
          <IconButton
            onClick={() => {
              setSelectedVehicleTypeRowId(null);
              resetVehicleType(initialVehicleTypeData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
          Vehicle Type
          <IconButton
            onClick={handleCloseVehicleType}
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
          <form onSubmit={HandleVehicleTypeForm(handleAddOrUpdateVehicleType)}>
            <Grid container spacing={2} alignItems="center" mt={2}>
              <Grid item md={5} xs={12} textAlign="center">
                <Controller
                  name="Name"
                  control={ControlVehicleType}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputFields
                      {...field}
                      label="VEHICLE TYPE"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item md={5} xs={12} textAlign="center">
                <Controller
                  name="Description"
                  control={ControlVehicleType}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputFields
                      {...field}
                      label="DETAILS"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item md={2} xs={12} textAlign="center">
                <Button type="submit" variant="contained" color="primary">
                  {selectedVehicleTypeRowId ? "UPDATE" : "ADD"}
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
              rows={VehicleTypeList.map((data, index) => ({
                ...data,
                id: data.id || index + 1,
              }))}
              columns={VehicleTypecolumns}
              // pageSize={5}
              hideFooter
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              sx={{
                height: "50vh",
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
      <Dialog
        open={openCategory}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "80vw",
            height: "80vh",
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
          <IconButton
            onClick={() => {
              setSelectedCategoryRowId(null);
              resetCategory(initialCategoryData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
          Category
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
          <form onSubmit={HandleCategoryForm(handleAddOrUpdate)}>
            <Grid container spacing={2} alignItems="center" mt={2}>
              <Grid item md={5} xs={12} textAlign="center">
                <Controller
                  name="Type"
                  control={ControlCategory}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputFields
                      {...field}
                      label="MAINTENANCE CATEGORY"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item md={5} xs={12} textAlign="center">
                <Controller
                  name="Description"
                  control={ControlCategory}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputFields
                      {...field}
                      label="DETAILS"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item md={2} xs={12} textAlign="center">
                <Button type="submit" variant="contained" color="primary">
                  {selectedCategoryRowId ? "UPDATE" : "ADD"}
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
              rows={CategoryList.map((data, index) => ({
                ...data,
                id: data.id || index + 1,
              }))}
              columns={CategoryColumns}
              // pageSize={5}
              hideFooter
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              sx={{
                height: "50vh",
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
      {loading && <Loader open={loading} />}

      <SearchModel
        open={OpenDrivar}
        onClose={() => setOpenDrivar(false)}
        onCancel={() => setOpenDrivar(false)}
        title="Select Vehicle"
        onChange={(e) => handleDriverListSearch(e.target.value)}
        value={DriverListquery}
        onClickClear={handleDriverListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={DriverListData.length}
            next={fetchMoreDriverListData}
            hasMore={hasMoreDriverGetList}
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
            {DriverListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.DriverName}
                subtitle={item.VehicleNumber}
                description={item.YearOfManufacture}
                searchResult={DriverListquery}
                onClick={() => {
                  selectVehiclemaster(
                    item.VehicleNumber,
                    item.VehicleType,
                    item.LicenseExpiryDate,
                    item.DocEntry
                  );
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
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
              VEHICLE MAINTENANCE
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
                sx={
                  {
                    // "& .MuiTextField-root": { m: 1 },
                  }
                }
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
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
                          disabled={!initial.DocEntry === false}
                          {...field}
                          onChange={(e) => {
                            const selectedSeries = e.target.value;
                            field.onChange(selectedSeries);
                            setValue("Series", selectedSeries);
                            if (selectedSeries !== "0") {
                              const seriesData = DocSeries.find(
                                (item) => item.SeriesId === selectedSeries
                              );
                              setValue("DocNum", seriesData?.DocNum || "");
                              clearErrors("DocNum");
                            } else {
                              setValue("DocNum", "");
                              clearErrors("DocNum");
                            }
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
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
                          readOnly={watch("Series") !== "0"}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                    <Controller
                      name="VehicleName"
                      rules={{
                        required: "This field is required",
                        validate: "",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          label="VEHICLE NUMBER"
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setOpenDrivar(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  style={{
                                    backgroundColor: "green",

                                    borderRadius: "10%",
                                    color: "white",
                                    padding: 2,
                                  }}
                                >
                                  <ViewListIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="VehicleType"
                      control={control}
                      rules={{ required: "Vehicle Type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          label="VEHICLE TYPE"
                          data={dataWithTooltip}
                          {...field}
                          error={!!error}
                          // disabled={SaveUpdateName==="UPDATE"}
                          helperText={error ? error.message : null}
                          // usedLevels={
                          //   SaveUpdateName === "SAVE"
                          //     ? openListData.map((item) => item.VehicleType)
                          //     : []
                          // }
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                  >
                    <Controller
                      name="VehicleType"
                      control={control}
                      rules={{ required: "Vehicle Type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <FormControl
                            error={!!error}
                            variant="outlined"
                            size="small"
                            sx={{ width: 220 }} // select width
                          >
                            <InputLabel id="VehicleType-label">
                              VEHICLE TYPE
                            </InputLabel>

                            <Select
                              {...field}
                              labelId="VehicleType-label"
                              input={<OutlinedInput label="VehicleType" />}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200, // height of dropdown
                                  },
                                },
                              }}
                              onOpen={() => {
                                if (VehicleTypeList.length === 0) {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "No Vehicle Types Available",
                                    text: "Click the + icon to add a new Vehicle Type.",
                                  });
                                }
                              }}
                            >
                              {VehicleTypeList.length > 0 ? (
                                VehicleTypeList.map((item) => (
                                  <MenuItem
                                    key={item.DocEntry}
                                    value={item.DocEntry}
                                  >
                                    {item.Name}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  No Vehicle Types Found
                                </MenuItem>
                              )}
                            </Select>

                            {error && (
                              <FormHelperText>{error.message}</FormHelperText>
                            )}
                          </FormControl>

                        
                        </>
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="KMReading"
                      control={control}
                      rules={{
                        required: "KMReading is required",
                        validate: (value) =>
                          value.trim() !== "" || "Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="KM READING"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="MainDate"
                      control={control}
                      rules={{
                        required: "Date is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("MainDate", newValue, {
                              shouldDirty: true,
                            });
                            clearErrors("MainDate");
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    mt={2}
                  >
                    <Controller
                      name="Remarks"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="REMARK"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mt={2}
                  >
                    <Button
                      onClick={HandlePCategoryOpen}
                      variant="contained"
                      color="info"
                      // size="small"
                      sx={{
                        height: 40,
                        padding: "0 16px",
                        borderRadius: "5px",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ADD CATEGORY
                    </Button>
                  </Grid> */}
                </Grid>
                <Grid
                  container
                  item
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    minHeight: 50,
                    border: "1px solid gray",

                    // maxHeight: 100,
                    // minHeight:
                    // px: 4,
                    mt: 2,
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={rows}
                    getRowId={(row) => row.LineNum}
                    columns={columns}
                    columnHeaderHeight={35}
                    hideFooter
                    // checkboxSelection
                    rowHeight={45}
                    // initialState={{
                    //   sorting: {
                    //     sortModel: [{ field: "Category", sort: "asc" }],
                    //   },
                    // }}
                    sx={{
                      height: "60vh",
                      backgroundColor:
                        theme.palette.mode === "light" ? "#fff" : "#373842",

                      // Make every cell vertically centered
                      "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0, // remove extra padding that causes misalignment
                      },

                      // Ensure content inside cell stays centered
                      "& .MuiDataGrid-cellContent": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      },

                      // Remove focus outlines
                      "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                        {
                          outline: "none",
                        },

                      // Center column headers also
                      "& .MuiDataGrid-columnHeaderTitleContainer": {
                        justifyContent: "center",
                      },
                    }}
                  />
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
                type="submit"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={!perms.IsDelete}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
