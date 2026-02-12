import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Chip,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import {
  InputSelectTextField,
  InputTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
// import ContactNumberSelector from "../Components/FuelConsumptionSelector";
import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../services/apiClient";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";

export default function FuelConsumption() {
  const theme = useTheme();
  const perms = usePermissions(150);
  const [clearCache, setClearCache] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [FuelTrackingRows, setFuelTrackingRows] = useState([]);

  //=========================================Vehicle State================================================================
  const [VehiclegetListData, setVehicleGetListData] = useState([]);
  const [VehiclegetListPage, setVehicleGetListPage] = useState(0);
  const [VehiclehasMoreGetList, setVehicleHasMoreGetList] = useState(true);
  const [VehiclegetListquery, setVehicleGetListQuery] = useState("");
  const [VehiclegetListSearching, setVehicleGetListSearching] = useState(false);
  const [openVehicleList, setVehicleOpen] = useState(false);
  const OpenVehicleModel = () => {
    setVehicleOpen(true);
  };
  const CloseVehicleModel = () => setVehicleOpen(false);

  //================================================Driver modal state======================================================
  //=========================================Vehicle State================================================================
  const [DrivergetListData, setDriverGetListData] = useState([]);
  const [DrivergetListPage, setDriverGetListPage] = useState(0);
  const [DriverhasMoreGetList, setDriverHasMoreGetList] = useState(true);
  const [DrivergetListquery, setDriverGetListQuery] = useState("");
  const [DrivergetListSearching, setDriverGetListSearching] = useState(false);
  const [openDriverList, setDriverOpen] = useState(false);
  const OpenDriverModel = () => {
    setDriverOpen(true);
  };
  const CloseDriverModel = () => setDriverOpen(false);

  const initial = {
    FuelDate: dayjs(undefined).format("YYYY-MM-DD"),
    Remarks: "",
    Series: "",
    DocNum: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  // const removeEmojis = (str) =>
  //   str.replace(
  //     /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
  //     ""
  //   );

  const validationRules = [
    {
      field: "VehicleName",
      message: "Please select Vehicle Name for all rows.",
    },
    { field: "FuelType", message: "Please select Fuel Type for all rows." },
    {
      field: "FuelQuantity",
      message: "Fuel Quantity is required for all rows.",
    },
    { field: "KMReading", message: "KM Reading is required for all rows." },
  ];

  const findValidationError = () => {
    for (const { field, message } of validationRules) {
      const isValid = FuelTrackingRows.every((row) => {
        let value = row[field];

        // 🚫 HARD BLOCK
        if (value === "undefined") return false;

        if (field === "Price") {
          return (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "" &&
            !isNaN(value) &&
            Number(value) > 0
          );
        }

        return (
          value !== null && value !== undefined && String(value).trim() !== ""
        );
      });

      if (!isValid) return message;
    }
    return null;
  };

  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setFuelTrackingRows([]);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
  };



  //====================================Vehicle modal=============================================
const fetchVehicleGetListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true);

    const url = searchTerm
      ? `/VehicleMan?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
      : `/VehicleMan?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values;

      setVehicleHasMoreGetList(newData.length === 20);

      setVehicleGetListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // If API returns success: false, show API message
      Swal.fire({
        title: "Warning",
        text: response.data.message || "No data found",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Vehicle data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  const handleVehicleGetListSearch = (res) => {
    setVehicleGetListQuery(res);
    setVehicleGetListSearching(true);
    setVehicleGetListPage(0);
    setVehicleGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchVehicleGetListData(0, res);
    }, 600);
  };

  const handleVehicleGetListClear = () => {
    setVehicleGetListQuery("");
    setVehicleGetListSearching(true);
    setVehicleGetListPage(0); // Reset page to 0
    setVehicleGetListData([]); // Clear current data
    fetchVehicleGetListData(0); // Fetch first page without search
  };

  const fetchVehicleMoreGetListData = () => {
    fetchVehicleGetListData(
      VehiclegetListPage + 1,
      VehiclegetListSearching ? VehiclegetListquery : ""
    );
    setVehicleGetListPage((prev) => prev + 1);
  };
  const onSelectVehicle = (VehicleNumber, DName, DriverId, Vehicle) => {
    const selectedId = getValues("selectedRowIndex");
    if (selectedId) {
      handleCellChange(selectedId, "VehicleName", VehicleNumber);
      // 🟦 Set Vehicle (DocEntry)
      handleCellChange(selectedId, "Vehicle", Vehicle);

      // 🟦 Set DriverID
      handleCellChange(selectedId, "DriverID", DriverId);

      const matchedDriver = DrivergetListData.find(
        (driver) => driver.FirstName?.toLowerCase() === DName.toLowerCase()
      );

      if (matchedDriver) {
        handleCellChange(selectedId, "DriverName", matchedDriver.FirstName);
        setValue("DriverName", matchedDriver.FirstName);
      } else {
        handleCellChange(selectedId, "DriverName", "");
        setValue("DriverName", "");
      }
    }
  };

  //====================================Vehicle modal=============================================

const fetchDriverGetListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true);

    const url = searchTerm
      ? `/DriverMaster?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
      : `/DriverMaster?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values;

      setDriverHasMoreGetList(newData.length === 20);

      setDriverGetListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // API returned success: false
      Swal.fire({
        title: "Warning",
        text: response.data.message || "No data found",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Driver data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  const handleDriverGetListSearch = (res) => {
    setDriverGetListQuery(res);
    setDriverGetListSearching(true);
    setDriverGetListPage(0);
    setDriverGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchDriverGetListData(0, res);
    }, 600);
  };

  const handleDriverGetListClear = () => {
    setDriverGetListQuery("");
    setDriverGetListSearching(true);
    setDriverGetListPage(0); // Reset page to 0
    setDriverGetListData([]); // Clear current data
    fetchDriverGetListData(0); // Fetch first page without search
  };

  const fetchDriverMoreGetListData = () => {
    fetchDriverGetListData(
      DrivergetListPage + 1,
      DrivergetListSearching ? DrivergetListquery : ""
    );
    setDriverGetListPage((prev) => prev + 1);
  };
  const onSelectDriver = (FirstName) => {
    const selectedId = getValues("selectedRowIndex"); // retrieve it from form state
    if (selectedId) {
      handleCellChange(selectedId, "DriverName", FirstName); // update row
    }
  };

  // ===============Get initial list data====================================

  useEffect(
    () => {
      fetchOpenListData(0);
      fetchVehicleGetListData(0);
      fetchDriverGetListData(0);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  //==================================================================================
  const addRow = () => {
    setFuelTrackingRows((prev) =>
      reindexRows([
        ...prev,
        {
          id: Date.now(),
          VehicleName: "",
          FuelType: "",
          FuelQuantity: "",
          KMReading: "",
          Remark: "",
          Fuel: "",
          LineRemarks: "",
           Receipts: null,
        },
      ])
    );
  };
  const reindexRows = (rows) =>
    rows.map((row, index) => ({
      ...row,
      SrNo: index + 1,
    }));
  const RemarkCell = React.memo(({ params, onCommit }) => {
    const [localValue, setLocalValue] = React.useState(
      params.row.LineRemarks || ""
    );

    React.useEffect(() => {
      setLocalValue(params.row.LineRemarks || "");
    }, [params.row.LineRemarks]);

    return (
      <InputTextField
        value={localValue}
        fullWidth
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onCommit(params.row.id, "LineRemarks", localValue)}
        onKeyDown={(e) => {
          e.stopPropagation(); // ✅ THIS IS THE KEY FIX
        }}
      />
    );
  });
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const modalcolumnsTab0 = [
    {
      field: "SrNo",
      headerName: "Sr No.",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "VehicleName",
      headerName: "Vehicle Name",
      width: 200,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        return (
          <Controller
            name={`VehicleName_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputTextField
                {...field}
                sx={{ width: 170 }}
                name={`VehicleName_${params.row.id}`}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e); // Update form state
                  // handleChange(e, params.row);
                  setVehicleOpen(true);
                }}
                error={!!error}
                helperText={error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setValue("selectedRowIndex", params.row.id);
                          setVehicleOpen(true);
                          OpenVehicleModel();
                        }}
                        disabled={params.row.Status === "0"}
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
        );
      },
    },

    {
      field: "FuelType",
      headerName: "Fuel Type",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <Controller
          name={`FuelType_${params.row.id}`}
          control={control}
          // rules={{ required: "This field is required" }}
          render={({ field, fieldState: { error } }) => (
            <InputSelectTextField
              {...field}
              error={!!error}
              helperText={error ? error.message : null}
              data={[
                { key: "1", value: "Diesel" },
                { key: "2", value: "Petrol" },
                { key: "3", value: "CNG" },
                { key: "4", value: "LPG" },
                { key: "5", value: "Electric" },
              ]}
              sx={{ width: 180 }}
              value={field.value || params.value || ""}
              onChange={(e) => {
                field.onChange(e); // update form state
                handleCellChange(params.row.id, "FuelType", e.target.value); // update row state
              }}
              fullWidth
            />
          )}
        />
      ),
    },
    {
      field: "FuelQuantity",
      headerName: "Fuel Quantity",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          name="FuelQuantity"
          value={params.row.FuelQuantity}
          sx={{ width: 120 }}
          onChange={(e) =>
            handleCellChange(params.row.id, "FuelQuantity", e.target.value)
          }
        />
      ),
    },
    {
      field: "Price",
      headerName: "Price",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          name="Price"
          value={params.row.Price}
          sx={{ width: 120 }}
          onChange={(e) =>
            handleCellChange(params.row.id, "Price", e.target.value)
          }
        />
      ),
    },
    {
      field: "KMReading",
      headerName: "KM Reading",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          name="KMReading"
          value={params.row.KMReading}
          sx={{ width: 180 }}
          onChange={(e) =>
            handleCellChange(params.row.id, "KMReading", e.target.value)
          }
        />
      ),
    },
    {
      field: "DriverName",
      headerName: "Driver Name",
      width: 200,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        return (
          <Controller
            name={`DriverName_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputTextField
                {...field}
                name={`DriverName_${params.row.id}`}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e); // Update form state
                  // handleChange(e, params.row);
                  setDriverOpen(true);
                }}
                sx={{ width: 180 }}
                error={!!error}
                helperText={error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setValue("selectedRowIndex", params.row.id);
                          setDriverOpen(true);
                          OpenDriverModel();
                        }}
                        disabled={params.row.Status === "0"}
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
        );
      },
    },
  {
  field: "Receipts",
  headerName: "Receipts",
  width: 320,
  sortable: false,
  renderCell: (params) => {
    const receipt = params.row.Receipts;

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const base64 = await fileToBase64(file);

      handleCellChange(params.row.id, "Receipts", {
        name: file.name,
        type: file.type,
        base64,
      });
    };

    const handleOpen = () => {
      if (!receipt) return;

      if (receipt.type.startsWith("image/")) {
        const win = window.open();
        win.document.write(
          `<img src="${receipt.base64}" style="max-width:100%" />`
        );
      } else {
        const link = document.createElement("a");
        link.href = receipt.base64;
        link.download = receipt.name;
        link.click();
      }
    };

    const handleRemove = () => {
      handleCellChange(params.row.id, "Receipts", null);
    };

    return (
      <Box display="flex" alignItems="center" gap={1}>
        {/* File input */}
        <input
          type="file"
          hidden
          id={`receipt-${params.row.id}`}
          onChange={handleFileChange}
        />

        {/* Add / Change Button */}
        <label htmlFor={`receipt-${params.row.id}`}>
          <Button
            component="span"
            color="success"
            size="small"
            variant={receipt ? "outlined" : "contained"}
            startIcon={<AttachFileIcon />}
          >
            {receipt ? "Change" : "Add Receipt"}
          </Button>
        </label>

        {/* File Chip */}
        {receipt && (
          <Chip
            label={receipt.name}
            onClick={handleOpen}
            onDelete={handleRemove}
            deleteIcon={<CloseIcon />}
            variant="outlined"
            clickable
            sx={{
              maxWidth: 180,
              ".MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        )}
      </Box>
    );
  },
}
,

    {
      field: "LineRemarks",
      headerName: "Remark",
      width: 300,
      renderCell: (params) => (
        <RemarkCell params={params} onCommit={handleCellChange} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleAccDeleteRow(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  const handleCellChange = (id, field, value) => {
    setFuelTrackingRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };
  const handleAccDeleteRow = (id) => {
    setFuelTrackingRows((prev) =>
      reindexRows(prev.filter((row) => row.id !== id))
    );
  };

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setbusinessPartner(CardCode, CntctCode);
      if ((isDirty && getValues("FuelDate")) || "UPDATE" === ok) {
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
          setFuelConsumptionDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setFuelConsumptionDataList(DocEntry);
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
 const setFuelConsumptionDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true);

    const response = await apiClient.get(`/FuelTracking/${DocEntry}`);

    // Check if API returned success false
    if (response.data.success === false) {
      Swal.fire({
        title: "Warning!",
        text: response.data.message || "Failed to fetch Fuel Tracking data",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const data = response.data.values;

    toggleDrawer();
    reset(data);

    const enrichedRows = (data.oLines || []).map((row, index) => ({
      ...row,
      id: `${row.DocEntry}-${row.LineNum}`,
      SrNo: index + 1,
    }));

    setFuelTrackingRows(enrichedRows);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching Fuel Tracking data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching the data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  // ===============API for Pagination ==================================
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
    setLoading(true);

    const url = searchTerm
      ? `/FuelTracking/Search/${searchTerm}/1/${pageNum}/20`
      : `/FuelTracking/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // Handle API returning success: false
      Swal.fire({
        title: "Warning!",
        text: response.data.message || "Failed to fetch Fuel Tracking list.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Fuel Tracking data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching the data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ==============useForm====================================
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: initial,
  });

  const { DocSeries } = useDocumentSeries(
    "297",
    dayjs(undefined).format("YYYY-MM-DD"),
    setValue,
    clearCache,
    SaveUpdateName
  );

  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
    if (!FuelTrackingRows || FuelTrackingRows.length === 0) {
      Swal.fire({
        text: "Please add at least one line before submitting.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    if (!FuelTrackingRows || FuelTrackingRows.length === 0) {
      Swal.fire({
        text: "Please add at least one line before submitting.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const hasInvalidPrice = FuelTrackingRows.some((row) => {
      const price = row.Price;
      return (
        price === null ||
        price === undefined ||
        String(price).trim() === "" ||
        isNaN(price) ||
        Number(price) <= 0
      );
    });

    if (hasInvalidPrice) {
      Swal.fire({
        text: "Please enter a valid Price for all rows.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    const getPureBase64 = (base64) =>
  base64?.split(",")[1] || "";

    const obj = {
      DocEntry: String(data.DocEntry || 0),
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().toISOString(),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().toISOString(),
      Status: "1",
      FuelDate: String(data.FuelDate || ""),
      Series: String(data.Series || ""),
      DocNum: String(data.DocNum || ""),
      Remarks: String(data.Remarks),
      oLines: FuelTrackingRows.map((line) => ({
        DocEntry: String(data.DocEntry || 0),
        LineNum: String(line.LineNum || 0),
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().toISOString(),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().toISOString(),
        Status: "1",
        Vehicle: String(line.Vehicle || ""),
        VehicleName: String(line.VehicleName || ""),
        FuelType: String(line.FuelType || ""),
        FuelQuantity: String(line.FuelQuantity || ""),
        KMReading: String(line.KMReading || "0"),
        DriverID: String(line.DriverID || "0"),
        DriverName: String(line.DriverName || ""),
        LineRemarks: String(line.LineRemarks || ""),
        Price: String(line.Price),
    Receipts: getPureBase64(line.Receipts?.base64),
     })),
    };

    try {
      setLoading(true);

      const errorMessage = findValidationError();
      if (errorMessage) {
        Swal.fire({
          text: errorMessage,
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: "OK",
        });
        return;
      }
      console.log("obj", obj);
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/FuelTracking`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          setClearCache(true);
          Swal.fire({
            title: "Success!",
            text: "Record Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.DocNum}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/FuelTracking/Update/${data.DocEntry}`,
            obj
          );

          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setClearCache(true);

            Swal.fire({
              title: "Success!",
              text: "Record Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "Record is not Updated!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);

      let errorMessage = "Something went wrong. Please try again later.";

      if (error?.response?.data) {
        const apiError = error.response.data;

        if (apiError.errors) {
          // Extract all error messages and join them
          const validationMessages = Object.values(apiError.errors)
            .flat()
            .join("\n");
          errorMessage = validationMessages;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        // icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // ===============Delete API ===================================
  const handleOnDelete = async (data) => {
    try {
      const result = await Swal.fire({
        text: "Do You Want to Delete?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await apiClient.delete(`/FuelTracking/${DocEntry}`);

        const { success, message } = response.data;
        setLoading(false);
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "Record Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error",
            text: message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          text: "FuelConsumption is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting tax:", error);
      setLoading(false);

      // SweetAlert for error in the catch block
      Swal.fire({
        title: "Error!",
        text: "An error occurred while deleting the FuelConsumption.",
        icon: "error",
        confirmButtonText: "Ok",
      });
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
          FUEL TRACKING LIST
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
                    title={item.DocNum}
                    // subtitle={item.Description}
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
      <SearchModel
        open={openVehicleList}
        onClose={CloseVehicleModel}
        onCancel={CloseVehicleModel}
        title="Select Vehicle"
        onChange={(e) => handleVehicleGetListSearch(e.target.value)}
        value={VehiclegetListquery}
        onClickClear={handleVehicleGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={VehiclegetListData.length}
            next={fetchVehicleMoreGetListData}
            hasMore={VehiclehasMoreGetList}
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
            {VehiclegetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.VehicleNumber}
                subtitle={item.DriverName}
                width="350px"
                // description={item.DriverName}
                searchResult={VehiclegetListquery}
                onClick={() => {
                  onSelectVehicle(
                    item.VehicleNumber,
                    item.DriverName,
                    item.DriverID,
                    item.DocEntry
                  );
                  CloseVehicleModel();
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openDriverList}
        onClose={CloseDriverModel}
        onCancel={CloseDriverModel}
        title="Select Driver"
        onChange={(e) => handleDriverGetListSearch(e.target.value)}
        value={DrivergetListquery}
        onClickClear={handleDriverGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={DrivergetListData.length}
            next={fetchDriverMoreGetListData}
            hasMore={DriverhasMoreGetList}
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
            {DrivergetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.FirstName}
                // subtitle={item.DriverName}
                width="350px"
                description={item.DriverName}
                searchResult={DrivergetListquery}
                onClick={() => {
                  onSelectDriver(item.FirstName);
                  CloseDriverModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      {loading && <Loader open={loading} />}
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
              FUEL TRACKING
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
                <Grid container>
                  {/* <Grid item xs={12} textAlign={"center"}>
                    <input
                      type="file"
                      id="file-upload"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
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
                        sx={{
                          fontSize: "20px",
                          marginRight: "5px",
                          // color: "#fff",
                        }}
                      />
                      Upload File
                    </label>

                    <TableContainer
                      sx={{
                        margin: "7px",
                        maxHeight: { xs: 150, sm: 200 },
                        width: { xs: "100%", sm: "80%" },
                        overflowY: "auto",
                        ml: "10%",
                      }}
                    >
                      {fileData.length > 0 && (
                        <Table
                          sx={{ minWidth: 500 }}
                          aria-label="file data table"
                          stickyHeader
                        >
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
                                  component="th"
                                  scope="row"
                                  onClick={() => openFileinNewTab(data)}
                                >
                                  {data.file.name}
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
                  </Grid> */}
                  {/* <Divider sx={{ width: "100%", mb: 3 }} /> */}

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

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FuelDate"
                      control={control}
                      rules={{ required: "Fuel Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            field.onChange(date ? date.toISOString : undefined);
                            setValue("FuelDate", date);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    border: "1px solid gray",
                    p: 1,
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden", // Ensures internal components don't overflow
                  }}
                >
                  {/* Add Icon */}
                  <Box sx={{ pb: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "green",
                        borderRadius: "20%",
                        color: "white",
                      }}
                      onClick={addRow}
                    >
                      <AddOutlinedIcon />
                    </IconButton>
                  </Box>

                  {/* Wrapper for Grid and Total */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    {/* Scrollable DataGrid */}
                    <Box
                      sx={{
                        overflow: "auto",
                        width: "100%",
                      }}
                    >
                      <DataGrid
                        className="datagrid-style"
                        hideFooter
                        columns={modalcolumnsTab0}
                        rows={FuelTrackingRows}
                        getRowId={(row) => row.id || row.LineNum}
                        autoHeight={false}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 100 },
                          },
                        }}
                        pageSizeOptions={[10]}
                        sx={{
                          height: "60vh",
                          minWidth: 600, // triggers horizontal scroll if columns are wide
                          backgroundColor:
                            theme.palette.mode === "light" ? "#fff" : "#373842",
                          "& .MuiDataGrid-cell": {
                            border: "none",
                            display: "flex", // <-- key
                            alignItems: "center", // <-- vertical center
                            paddingTop: "0px !important",
                            paddingBottom: "0px !important",
                          },
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            backgroundColor: "red",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    </Box>

                    {/* Total Field */}
                  </Box>
                </Box>
                <Grid container>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          {...field}
                          size="small"
                          label="REMARK"
                          sx={{ width: 300 }}
                          inputProps={{ maxLength: 254 }}
                          rows={3}
                          multiline
                          fullWidth
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
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
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
