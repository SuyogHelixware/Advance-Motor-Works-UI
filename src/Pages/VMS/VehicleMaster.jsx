import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,

  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import { InputTextField } from "../Components/FormComponentMaster";
import {
  InputDatePickermodelFields,
  InputFields,
  InputSearchableSelect,
  InputSelectTextField,
  ModelInputTextField,
  SelectedDatePickerField,
  SelectedYearPickerField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import useAuth from "../../Routing/AuthContext";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
const initialState = {
  MaintainCondition: false,
  Battery: false,
  Brake: false,
  Tyres: false,
};
function reducer(state, action) {
  switch (action.type) {
    case "Maintenance":
      return { ...state, MaintainCondition: !state.MaintainCondition };
    case "Battery":
      return { ...state, Battery: !state.Battery };
    case "Brake":
      return { ...state, Brake: !state.Brake };
    case "Tyres":
      return { ...state, Tyres: !state.Tyres };
    default:
      return state;
  }
}
export default function VahicleMaster() {
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(151);

  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("sdad", state.MaintainCondition);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const timeoutRef = useRef(null);
  const [vahicleMakeData, setVehicleMake] = useState([]);
  const [vahicleModelData, setVehicleModel] = useState([]);
  const [vehicleFilterModel, setFilterModel] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [fileUrl, setFileUrl] = useState(null); // State to store the file URL
  console.log(fileUrl);

  let [ok, setok] = useState("OK");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=========================================================================
  const [openVehicleType, setopenVehicleType] = useState(false);
  const [selectedVehicleTypeRowId, setSelectedVehicleTypeRowId] =
    useState(null);
  const [VehicleTypeList, setVehicleTypeList] = useState([]);
  // ===============================Get Driver List======================================================
  const [OpenDrivar, setOpenDrivar] = useState(false);

  const [DriverListData, setDriverListData] = useState([]);
  const [DriverListPage, setDriverListPage] = useState(0);
  const [DriverListquery, setDriverListQuery] = useState("");
  const [DriverListSearching, setDriverListSearching] = useState(false);
  const [hasMoreDriverGetList, setHasMoreDriverGetList] = useState(true);
  // =======================================================
  const [tabvalue, settabvalue] = useState(0);
  const [rows, setRows] = useState([]);
  const [openmodel, setopenmodel] = useState(false);
  const [openBattery, setopenBattery] = useState(false);
  const handleOpenBattery = () => setopenBattery(true);
  const handleCloseBattery = () => setopenBattery(false);
  const handleOpen = () => setopenmodel(true);
  const handleClose = () => setopenmodel(false);
  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: "",
    Status: "",
    VehicleType: "",
    VehicleNumber: "",
    Make: "",
    MakeName: "",
    Model: "",
    ModelName: "",
    ChassisNumber: "",
    EngineNumber: "",
    YearOfManufacture: "",
    FleetID: "",
    DriverID: "",
    DriverName: "",
    LicenseNumber: "",
    LicenseExpiryDate: "",
    LastServiceDate: "",
    NextServiceDue: dayjs(undefined).format("YYYY-MM-DD"),
    TotalService: "",
    NextServiceReminder: "",
    BatteryBrand: "",
    BatteryType: "",
    BatteryCapacityAh: "0",
    BatteryVoltage: "0",
    NumberOfBatteries: "0",
    BatteryInstallDate: dayjs(undefined).format("YYYY-MM-DD"),
    BatteryWarrantyMonths: "0",
    BatteryLastService: "",
    BatteryNextService: dayjs(undefined).format("YYYY-MM-DD"),
    BrakeLastInspectionDate: dayjs(undefined).format("YYYY-MM-DD"),
    BrakeNextInspectionDate: dayjs(undefined).format("YYYY-MM-DD"),
    BrakeCondition: "",
    TireType: "",
    TireSize: "",
    FrontLeftDepthMM: "0",
    FrontRightDepthMM: "0",
    RearLeftDepthMM: "0",
    RearRightDepthMM: "0",
    TireTreadCheckDate: "",
    TireNextCheckDate: dayjs(undefined).format("YYYY-MM-DD"),
    TireReplacementDue: dayjs(undefined).format("YYYY-MM-DD"),
    AdditionalAxles: "",
    Axle3LeftDepthMM: "0",
    Axle3RightDepthMM: "0",
    Axle4LeftDepthMM: "0",
    Axle4RightDepthMM: "0",
    AttcEntry: "",
    FuelTracking: "0",
    FuelType: "0",
    AvgMile: "0",
    Comments: "",
    oLines: [],
  };
  const column = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      editable: false,
    },
    {
      field: "DocumentName",
      headerName: "Document Name",
      width: 130,
      sortable: false,
      editable: false,
      renderCell: (params) => (
        <ModelInputTextField
          name="DocumentName"
          value={params.value}
          onChange={(e) => handleChange(e, params.row)} // Handle change for dynamic updates
        />
      ),
    },
    {
      field: "RenewalDate",
      headerName: "Renewal Date",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <InputDatePickermodelFields
          name="RenewalDate"
          value={params.value ? dayjs(params.value) : undefined}
          onChange={(date) =>
            handleChange(
              {
                target: {
                  name: "RenewalDate",
                  value: dayjs(date),
                },
              },
              params.row
            )
          }
        />
      ),
    },

    {
      field: "ReminderDaysBefore",
      headerName: "Reminder Days",
      width: 120,
      editable: false, // Disable default editable behavior
      renderCell: (params) => (
        <Controller
          name="ReminderDaysBefore"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ModelInputTextField
              {...field}
              onChange={(e) => handleChange(e, params.row)} // Handle changes dynamically
              value={params.value}
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
      ),
    },
    {
      field: "FileUrl",
      headerName: "Upload File",
      width: 300,
      editable: false,
      renderCell: (params) => {
        const fileName = params.row.FileUrl || "";

        const handleOpenFile = () => {
          // Open the file in a new tab if fileUrl exists
          if (fileUrl) {
            window.open(fileUrl, "_blank");
          }
        };
        const handleRemoveFile = () => {
          handleChange(
            {
              target: {
                name: "FileUrl",
                value: "", // Reset file name (or URL)
              },
            },
            params.row
          );
          setFileUrl(null); // Reset file URL state
        };
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              component="label"
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <input
                type="file"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const newFileURL = URL.createObjectURL(file); // Create a URL for the file
                    handleChange(
                      {
                        target: {
                          name: "FileUrl",
                          value: file.name, // Store only the file name
                        },
                      },
                      params.row
                    );
                    setFileUrl(newFileURL); // Store the file URL in the state
                  }
                }}
              />
            </Button>

            {fileName && (
              <Box display="flex" alignItems="center" gap={1}>
                {/* Display the file name (only) */}
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 180,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={handleOpenFile} // Open file URL when clicked
                >
                  {fileName}
                </Typography>

                {/* Remove icon to reset the file */}
                <RemoveCircleOutlineIcon
                  onClick={handleRemoveFile} // Remove file when clicked
                  sx={{ color: "red", cursor: "pointer" }}
                />
              </Box>
            )}
          </Box>
        );
      },
    },

    {
      field: "Status",
      headerName: "Alert",
      width: 100,
      editable: false,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Checkbox
              sx={{
                textAlign: "center",
                width: 100,
                // mr: 1,
              }}
              checked={params.value || false} // Ensure boolean value
              onChange={(e) =>
                handleChange(
                  { target: { name: "Status", value: e.target.checked } },
                  params.row
                )
              }
            />
          }
        />
      ),
    },
  ];

  // ==============useForm====================================
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: initial,
  });

  const AllData = getValues();
  const InitialTyre = {
    TireType: "",
    TireSize: "",
    FrontLeftDepthMM: "",
    FrontRightDepthMM: "",
    RearLeftDepthMM: "",
    RearRightDepthMM: "",
    AdditionalAxles: "Y",
    Axle3LeftDepthMM: "",
    Axle3RightDepthMM: "",
    Axle4LeftDepthMM: "",
    Axle4RightDepthMM: "",
  };
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    watch: watch1,
    reset: reset1,
  } = useForm({
    defaultValues: InitialTyre,
  });
  const onSubmit1 = (data) => {
    console.log(data);
    setValue("TireType", data.TireType);
    setValue("TireSize", data.TireSize);
    setValue("FrontLeftDepthMM", data.FrontLeftDepthMM);
    setValue("FrontRightDepthMM", data.FrontRightDepthMM);
    setValue("RearLeftDepthMM", data.RearLeftDepthMM);
    setValue("RearRightDepthMM", data.RearRightDepthMM);
    setValue("AdditionalAxles", data.AdditionalAxles);
    setValue("Axle3LeftDepthMM", data.Axle3LeftDepthMM);
    setValue("Axle3RightDepthMM", data.Axle3RightDepthMM);
    setValue("Axle4LeftDepthMM", data.Axle4LeftDepthMM);
    setValue("Axle4RightDepthMM", data.Axle4RightDepthMM);

    handleClose();
    dispatch({ type: "Tyres" });
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const initialBettery = {
    BatteryBrand: "",
    BatteryType: "",
    BatteryCapacityAh: "",
    BatteryVoltage: "",
    NumberOfBatteries: "",
    BatteryWarrantyMonths: "",
  };
  const {
    control: controlBattery,
    handleSubmit: handleSubmitBattery,
    setValue: setValueBattery,
    reset: resetBattery,
    watch: watchBattery,
  } = useForm({
    defaultValues: initialBettery,
  });
  const onSubmitBattery = (data) => {
    console.log(data);
    setValue("BatteryBrand", data.BatteryBrand);
    setValue("BatteryType", data.BatteryType);
    setValue("BatteryCapacityAh", data.BatteryCapacityAh);
    setValue("BatteryVoltage", data.BatteryVoltage);
    setValue("NumberOfBatteries", data.NumberOfBatteries);
    setValue("BatteryWarrantyMonths", data.BatteryWarrantyMonths);
    handleCloseBattery();
    dispatch({ type: "Battery" });
  };
  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    reset1(InitialTyre);
    resetBattery(initialBettery);
    setSaveUpdateName("SAVE");
    setRows([]);
    setSelectedData([]);
  };
  //===============================All other API=================================
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  useEffect(
    () => {
      fetchOpenListData(0);
      fetchDataVehicleType();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
    value: (
      <Tooltip title={vehicleTooltips[item.key] || ""} arrow placement="right">
        <span>{item.value}</span>
      </Tooltip>
    ),
  }));
  //==================================================================================
  const addRow = () => {
    setRows((prevRows) => {
      const newRow = {
        id: prevRows.length
          ? Math.max(...prevRows.map((row) => row.id)) + 1
          : 1,
        LineNum: "",
        DocEntry: "",
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: "",
        Status: "1",
        DocumentName: "",
        FileUrl: "",
        RenewalDate: "",
        ReminderDaysBefore: "",
      };
      return [...prevRows, newRow];
    });
  };

  const handleChange = (e, row) => {
    const { name, value } = e.target;
    console.log(name, value);
    setRows((prevRows) =>
      prevRows.map((r) => (r.id === row.id ? { ...r, [name]: value } : r))
    );
    setok("OK");
  };

  console.table("row", rows);
  const fetchDriverListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/DriverMaster?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
        : `/DriverMaster?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreDriverGetList(newData.length === 20);
        setDriverListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const selectDriver = (
    FirstName,
    LastName,
    LicenseNumber,
    LicenseExpiryDate,
    DriverID
  ) => {
    setValue("DriverName", `${FirstName} ${LastName}`);
    setValue("LicenseNumber", LicenseNumber);
    setValue("LicenseExpiryDate", LicenseExpiryDate);
    setValue("DriverID", DriverID);
    setOpenDrivar(false);
    clearErrors("DriverName");
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
      const url = searchTerm
        ? `/VehicleMan?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
        : `/VehicleMan?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const VahicleMakeApi = async () => {
    try {
      const res = await apiClient.get(`/VehicleMakeV2/Pages/1/0/500`);
      const response = res.data;
      if (response.success === true) {
        setVehicleMake(response.values);
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

  const VahicleModelApi = async () => {
    try {
      const res = await apiClient.get(`/VehicleModelV2/Pages/1/0/500`);
      const response = res.data;
      if (response.success === true) {
        setVehicleModel(response.values);
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

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    VahicleMakeApi();
    VahicleModelApi();
  }, []);

  useMemo(() => {
    const Vehicleamake = watch("Make");
    const FilterMake = vahicleModelData.filter(
      (vehicle) => vehicle.MakeID === String(Vehicleamake)
    );
    console.log(FilterMake);
    setFilterModel(FilterMake);
  }, [watch("Make")]);
  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
    console.log(data);
    const obj = {
      DocEntry: "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      Status: "1",
      VehicleType: String(data.VehicleType),
      VehicleNumber: data.VehicleNumber,
      Make: data.Make,
      MakeName: data.MakeName,
      Model: data.Model,
      ModelName: data.ModelName,
      ChassisNumber: data.ChassisNumber,
      EngineNumber: data.EngineNumber,
      YearOfManufacture: data.YearOfManufacture,
      FleetID: data.FleetID,
      DriverID: data.DriverID,
      DriverName: data.DriverName,
      LicenseNumber: data.LicenseNumber,
      LicenseExpiryDate: dayjs(data.LicenseExpiryDate).format("YYYY-MM-DD"),
      LastServiceDate: dayjs(data.LastServiceDate).format("YYYY-MM-DD"),
      NextServiceDue: dayjs(data.NextServiceDue).format("YYYY-MM-DD"),
      TotalService: data.TotalService,
      NextServiceReminder: data.NextServiceReminder,
      BatteryBrand: data.BatteryBrand,
      BatteryType: data.BatteryType,
      BatteryCapacityAh: data.BatteryCapacityAh,
      BatteryVoltage: data.BatteryVoltage,
      NumberOfBatteries: data.NumberOfBatteries,
      BatteryInstallDate: dayjs(data.BatteryInstallDate).format("YYYY-MM-DD"),
      BatteryWarrantyMonths: data.BatteryWarrantyMonths,
      BatteryLastService: dayjs(data.BatteryLastService).format("YYYY-MM-DD"),
      BatteryNextService: dayjs(data.BatteryNextService).format("YYYY-MM-DD"),
      BrakeLastInspectionDate: dayjs(data.BrakeLastInspectionDate).format(
        "YYYY-MM-DD"
      ),
      BrakeNextInspectionDate: dayjs(data.BrakeNextInspectionDate).format(
        "YYYY-MM-DD"
      ),
      BrakeCondition: data.BrakeCondition,
      TireType: data.TireType,
      TireSize: data.TireSize,
      FrontLeftDepthMM: data.FrontLeftDepthMM,
      FrontRightDepthMM: data.FrontRightDepthMM,
      RearLeftDepthMM: data.RearLeftDepthMM,
      RearRightDepthMM: data.RearRightDepthMM,
      TireTreadCheckDate: dayjs(data.TireTreadCheckDate).format("YYYY-MM-DD"),
      TireNextCheckDate: dayjs(data.TireNextCheckDate).format("YYYY-MM-DD"),
      TireReplacementDue: dayjs(data.TireReplacementDue).format("YYYY-MM-DD"),
      AdditionalAxles: data.AdditionalAxles,
      Axle3LeftDepthMM: data.Axle3LeftDepthMM,
      Axle3RightDepthMM: data.Axle3RightDepthMM,
      Axle4LeftDepthMM: data.Axle4LeftDepthMM,
      Axle4RightDepthMM: data.Axle4RightDepthMM,
      AvgMile: data.AvgMile || "",
      Comments: data.Comments || "",
      FuelType: data.FuelType || "",
      FuelTracking: data.FuelTracking || "",
      AttcEntry: data.AttcEntry,
      oLines: rows.map((item) => ({
        LineNum: "",
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        Status: item.Status === "1" ? "1" : "0",
        DocumentName: item.DocumentName,
        FileUrl: item.FileUrl,
        RenewalDate: dayjs(item.RenewalDate).format("YYYY-MM-DD"),
        ReminderDaysBefore: item.ReminderDaysBefore,
      })),
    };
    console.log("post obj", obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/VehicleMan`, obj)

        .then((res) => {
          if (res.data.success) {
            clearFormData();
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Vehicle Master saved Successfully",
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
    } else {
      Swal.fire({
        text: `Do You Want to Update "${obj.VehicleNumber}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/VehicleMan/${data.DocEntry}`, obj)

            .then((response) => {
              if (response.data.success) {
                clearFormData();

                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                Swal.fire({
                  title: "Success!",
                  text: "Vehicle Master Updated",
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
            text: "Vehicle Master Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const { isDirty } = useFormState({ control });

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
          setVehicleMakeDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setVehicleMakeDataList(DocEntry);
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
  const setVehicleMakeDataList = async (DocEntry) => {
    if (!DocEntry) {
      return;
    }
    try {
      const response = await apiClient.get(`/VehicleMan?DocEntry=${DocEntry}`);
      const data = response.data.values;
      reset(data);
      reset1(data);
      resetBattery(data);
      setRows(
        data.oLines.map((item, index) => ({
          id: index + 1, // Ensure unique IDs
          ...item,
        }))
      );
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("Error fetching data:", error);

      // SweetAlert for error in the catch block
      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching the data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleDelete = () => {
    Swal.fire({
      text: `Do you want to Delete" ${AllData.VehicleNumber}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/VehicleMan/${AllData.DocEntry}`)

          .then((response) => {
            if (response.data.success) {
              clearFormData();
              setOpenListData([]);
              fetchOpenListData(0);
              // Swal.fire({
              //   title: "Success!",
              //   text: "Vehicle Master Deleted",
              //   icon: "success",
              //   confirmButtonText: "Ok",
              //   timer: 1000,
              // });
              Swal.fire({
                text: "Vehicle Master Deleted",
                icon: "success",
                toast: true,
                showConfirmButton: false,
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
          text: "Vehicle Masters Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
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
  const usedVehicleTypes =
    openListData?.map(
      (item) => String(item.VehicleType) // convert to string
    ) || [];

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
      const res = await apiClient.get(`/VehicleType?Status=1&Page=0&Limit=100`);
      const response = res.data;
      console.log("dsfdsfdfdfdf", response);

      if (response.success === true) {
        setVehicleTypeList(response.values);
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
  const handleAddOrUpdateVehicleType = async (data) => {
    console.log("DATA", data);

    const obj = {
      DocEntry: data.DocEntry || "0",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: "1",
      Name: data.Name || "0",
      Description: data.Description || "",
    };

    const apiUrl = selectedVehicleTypeRowId
      ? `/VehicleType/${selectedVehicleTypeRowId}` // PUT API for Update
      : `/VehicleType`; // POST API for Add

    const method = selectedVehicleTypeRowId ? "put" : "post";

    try {
      if (
        selectedVehicleTypeRowId !== null ||
        selectedVehicleTypeRowId !== ""
      ) {
        // 🔹 Direct Save (Add or Update)
        const response = await apiClient[method](apiUrl, obj);

        if (response.data?.success) {
          await fetchDataVehicleType();
          resetVehicleType(initialVehicleTypeData);
          setSelectedVehicleTypeRowId(null);

          Swal.fire({
            title: "Success!",
            text: `VehicleType ${
              selectedVehicleTypeRowId ? "updated" : "added"
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
            `/VehicleTypes/${selectedVehicleTypeRowId}`,
            obj
          );

          if (response.data?.success) {
            await fetchDataVehicleType();
            setSelectedVehicleTypeRowId(null);

            Swal.fire({
              title: "Success!",
              text: "VehicleType Updated Successfully!",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire(
              "Error!",
              response.data?.message || "Update failed!",
              "error"
            );
          }
        } else {
          Swal.fire({
            text: "VehicleType is Not Updated",
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
    console.log("DATADELETED", data.DocEntry);

    Swal.fire({
      text: `Do You Want to Delete "${data.Name}" ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/VehicleType/${data.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              fetchDataVehicleType();

              Swal.fire({
                title: "Success!",
                text: "Vehicle Type Deleted",
                icon: "success",
                confirmButtonText: "Ok",
                timer: 1500,
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
          text: "Vehicle Type Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  const handleVehicleTypeEdit = async (row) => {
    try {
      const res = await apiClient.get(`/VehicleType?DocEntry=${row.DocEntry}`);
      const response = res.data;

      if (response.success) {
        const { DocEntry, Name, Description } = response.values;

        // Set the Code into the form field
        setValueVehicleType("Name", Name);
        setValueVehicleType("Description", Description);

        // Store DocEntry for later update
        setSelectedVehicleTypeRowId(DocEntry);
      } else {
        Swal.fire("Error!", response.message, "warning");
      }
    } catch (error) {
      Swal.fire("Error!", error.message || error, "error");
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
          VEHICLE MASTER LIST
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
                    title={item.VehicleNumber}
                    subtitle={item.DriverName}
                    description={item.ChassisNumber}
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
      <Grid container>
        <Dialog
          // style={{ margin: "auto" }}
          open={openmodel}
          onClose={handleClose}
          scroll="paper"
          component={"form"}
          onSubmit={handleSubmit1(onSubmit1)}
        >
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              {/* <PersonAddAlt1OutlinedIcon /> */}
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp; &nbsp;TYRES
              </Typography>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container justifyContent={"space-between"} spacing={2}>
              <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="TireType"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="TYRE TYPE"
                      type="text"
                      inputProps={{ maxLength: 100 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="TireSize"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="TYRE SIZE"
                      type="text"
                      inputProps={{ maxLength: 100 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="FrontLeftDepthMM"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FRONT LEFT DEPTH"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="RearLeftDepthMM"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FRONT LEFT DEPTH"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="FrontRightDepthMM"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FRONT RIGHT DEPTH"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="RearRightDepthMM"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="REAR  RIGHT DEPTH"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="AdditionalAxles"
                  control={control1}
                  defaultValue="Y"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          textAlign={"center"}
                          {...field}
                          checked={field.value === "Y"}
                          onChange={(e) => {
                            const newValueStatus = e.target.checked ? "Y" : "N";
                            field.onChange(newValueStatus);
                            setValue1("AdditionalAxles", newValueStatus);
                          }}
                        />
                      }
                      label="Additional Axles "
                    />
                  )}
                />
              </Grid>
              {watch1("AdditionalAxles") === "Y" && (
                <>
                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="Axle3LeftDepthMM"
                      control={control1}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="AXLE 3 LEFT"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="Axle3RightDepthMM"
                      control={control1}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="AXLE 3 RIGHT"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="Axle4LeftDepthMM"
                      control={control1}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="AXLE 4 LEFT"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="Axle4RightDepthMM"
                      control={control1}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="AXLE 4 RIGHT"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
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
                  // onClick={onSubmit}
                >
                  Save
                  {/* {saveUpdateButtonCP} */}
                </Button>
              </Grid>
              <Grid>
                <Button variant="contained" color="error" onClick={handleClose}>
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Grid>
      <Grid container>
        <Dialog
          // style={{ margin: "auto" }}
          open={openBattery}
          onClose={handleCloseBattery}
          scroll="paper"
          component={"form"}
          onSubmit={handleSubmitBattery(onSubmitBattery)}
        >
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              {/* <PersonAddAlt1OutlinedIcon /> */}
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp; &nbsp;BATTERY
              </Typography>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container justifyContent={"space-between"} spacing={2}>
              <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BatteryBrand"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Battery Brand"
                      type="text"
                      inputProps={{ maxLength: 100 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BatteryType"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Battery Type"
                      type="text"
                      inputProps={{ maxLength: 100 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BatteryCapacityAh"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Battery Capacity"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BatteryVoltage"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Battery Voltage"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="NumberOfBatteries"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Number of Batteries"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BatteryWarrantyMonths"
                  control={controlBattery}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Warranty (months)"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
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
                  // onClick={onSubmit}
                >
                  Save
                  {/* {saveUpdateButtonCP} */}
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCloseBattery}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Grid>

      <SearchModel
        open={OpenDrivar}
        onClose={() => setOpenDrivar(false)}
        onCancel={() => setOpenDrivar(false)}
        title="Driver"
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
                title={item.DocNum}
                subtitle={`${item.FirstName} ${item.LastName}`}
                description={item.ContactNumber}
                searchResult={DriverListquery}
                onClick={() => {
                  selectDriver(
                    item.FirstName,
                    item.LastName,
                    item.LicenseNumber,
                    item.LicenseExpiryDate,
                    item.DocEntry
                  );
                  //  CloseVendorModel(); // Close after selection if needed
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
              VEHICLE MASTER
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
                    //   "& .MuiTextField-root": { mt: 0.5 },
                  }
                }
                noValidate
                autoComplete="off"
              >
                <Grid
                  container
                  sx={{
                    "& .MuiTextField-root": { mt: 1 },
                  }}
                >
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="VehicleNumber"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="VEHICLE NUMBER"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="VehicleType"
                      control={control}
                      rules={{ required: "Vehicle Type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
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
                  </Grid> */}
                  <Grid
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
                          <Controller
                            name="VehicleType"
                            control={control}
                            // rules={{ required: "Vehicle Type is required" }}
                            render={({ field, fieldState: { error } }) => (
                              <InputSearchableSelect
                                {...field}
                                label="VEHICLE TYPE"
                                error={!!error}
                                helperText={error?.message}
                                data={VehicleTypeList.map((item) => ({
                                  key: item.DocEntry,
                                  value: item.Name,
                                }))}
                                onOpen={() => {
                                  if (VehicleTypeList.length === 0) {
                                    Swal.fire({
                                      icon: "warning",
                                      title: "No Vehicle Types Available",
                                      text: "Click the + icon to add a new Vehicle Type.",
                                    });
                                  }
                                }}
                              />
                            )}
                          />

                          {/* OUTSIDE ICON */}
                          <IconButton
                            onClick={HandlePVehicleTypeOpen}
                            size="small"
                            sx={{
                              mt:1,
                              backgroundColor: "success.main",
                              color: "white",
                              borderRadius: "5px",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </>
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Make"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="VEHICLE MAKE"
                          data={vahicleMakeData.map((vehicle) => ({
                            key: vehicle.DocEntry,
                            value: vehicle.MakeName,
                          }))}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Model"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="VEHICLE MODEL"
                          data={vehicleFilterModel.map((vehicle) => ({
                            key: vehicle.DocEntry,
                            value: vehicle.ModelName,
                          }))}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ChassisNumber"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CHASIS NUMBER"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="EngineNumber"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ENGINE NUMBER"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="YearOfManufacture"
                      control={control}
                      // rules={{ required: "Model Year is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedYearPickerField
                          label="YEARS OF MANUFACTURE"
                          name={field.name}
                          value={field.value} // `field.value` will be a string like "2009"
                          onChange={(date) => {
                            // Ensure the selected year is correctly passed back as ISO string
                            field.onChange(
                              date ? dayjs(date).toISOString() : undefined
                            );
                            setValue(
                              "YearOfManufacture",
                              date ? dayjs(date).year().toString() : "" // Save only the year as a string
                            );
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FleetID"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="FLEET ID"
                          {...field}
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
                    mt: 1,
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <Tabs
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    value={tabvalue}
                    onChange={handleTabChange}
                    aria-label="responsive tabs example"
                    sx={{ width: "100%" }}
                  >
                    <Tab value={0} label="Driver Assign" />
                    <Tab value={1} label="Fuel Tracking" />
                    <Tab value={2} label="Vehicle Document" />
                    <Tab value={3} label="Vehicle Maintenance" />
                    <Tab value={4} label="Remark" />

                    {/* Add more tabs if needed */}
                  </Tabs>

                  <Divider />
                  {tabvalue === 0 && (
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        "& .MuiTextField-root": { mt: 1 },
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={4}
                        textAlign="center"
                      >
                        <Controller
                          name="DriverName"
                          rules={{ required: "This field is required" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              {...field}
                              label="DRIVER"
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
                      <Grid
                        item
                        sm={6}
                        xs={12}
                        md={4}
                        lg={4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="LicenseNumber"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="DRIVER LICENCE NUMBER"
                              {...field}
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
                      >
                        <Controller
                          name="LicenseExpiryDate"
                          control={control}
                          // rules={{ required: "Date is Required" }}
                          render={({ field, fieldState: { error } }) => (
                            <SelectedDatePickerField
                              label="LICENSES EXPIRY DATE"
                              name={field.name}
                              value={
                                field.value ? dayjs(field.value) : undefined
                              }
                              onChange={(newValue) => {
                                setValue("LicenseExpiryDate", newValue, {
                                  shouldDirty: true,
                                });
                              }}
                              error={!!error}
                              helperText={error ? error.message : null}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {tabvalue === 1 && (
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        "& .MuiTextField-root": { mt: 1 },
                      }}
                    >
                      <Grid
                        item
                        sm={6}
                        xs={12}
                        md={4}
                        lg={4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="FuelTracking"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="FUEL TRACKING"
                              {...field}
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
                      >
                        <Controller
                          name="FuelType"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              label="FUEL TYPE"
                              data={[
                                { key: "1", value: "Diesel" },
                                { key: "2", value: "Petrol" },
                                { key: "3", value: "CNG" },
                                { key: "4", value: "LPG " },
                                { key: "5", value: "Electric" },
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
                        sm={6}
                        xs={12}
                        md={4}
                        lg={4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="AvgMile"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="AVG MILEAGE"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {tabvalue === 2 && (
                    <Grid container spacing={2}>
                      <Grid
                        item
                        sx={{
                          overflow: "auto",
                          width: "100%",
                          //  height: 250,
                          mr: "5px",
                          py: "10px",
                        }}
                      >
                        <IconButton
                          size="small"
                          style={{
                            backgroundColor: "green",
                            borderRadius: "20%",
                            color: "white",
                          }}
                          onClick={addRow} // Call the addRow function on click
                        >
                          <AddOutlinedIcon />
                        </IconButton>

                        {/* <Paper sx={{ width: "100%" }}> */}

                        <Grid
                          container
                          item
                          sx={{
                            overflow: "auto",
                            width: "100%",
                            height: 300,
                            //   mt: "5px",
                            py: 3,
                          }}
                        >
                          <DataGrid
                            columnHeaderHeight={35}
                            rowHeight={45}
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
                            rows={rows} // Dynamically updated rows
                            columns={column}
                            getRowId={(row) => row.id || row.DocEntry}
                            initialState={{
                              pagination: {
                                paginationModel: {
                                  pageSize: 8,
                                },
                              },
                            }}
                            // pageSizeOptions={[3]}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  {tabvalue === 3 && (
                    <>
                      <Button
                        sx={{ width: "110px", mt: 1 }}
                        color="info"
                        variant="outlined"
                        onClick={() => dispatch({ type: "Maintenance" })}
                      >
                        MAINTENANCE
                      </Button>
                      {!state.MaintainCondition && (
                        <Grid
                          container
                          spacing={2}
                          sx={{
                            "& .MuiTextField-root": { mt: 1 },
                          }}
                        >
                          <Grid
                            item
                            sm={6}
                            xs={12}
                            md={4}
                            lg={4}
                            textAlign={"center"}
                          >
                            <Controller
                              name="LastServiceDate"
                              control={control}
                              // rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="LAST SERVICES DATE"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue("LastServiceDate", newValue, {
                                      shouldDirty: true,
                                    });
                                    setValue("NextServiceDue", "", {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="NextServiceDue"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="NEXT SERVICE DUE DATE"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  minDate={getValues("LastServiceDate")}
                                  onChange={(newValue) => {
                                    setValue("NextServiceDue", newValue, {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="NextServiceReminder"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="Next Service Reminder "
                                  {...field}
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
                            mb={1}
                          >
                            <Controller
                              name="TotalService"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="Total Servicing"
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}

                      <Divider />

                      <Button
                        sx={{ width: "110px", mt: 1 }}
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          handleOpenBattery();
                          dispatch({ type: "Battery" });
                        }}
                      >
                        BATTERY
                      </Button>
                      {!state.Battery && (
                        <Grid
                          container
                          // sx={{
                          //   "& .MuiTextField-root": { mt: 1 },
                          // }}
                        >
                          <Grid
                            item
                            sm={6}
                            xs={12}
                            md={4}
                            lg={4}
                            textAlign={"center"}
                          >
                            <Controller
                              name="BatteryInstallDate"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Install Date"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue("BatteryInstallDate", newValue, {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="BatteryLastService"
                              control={control}
                              // rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Last Maintenance Date"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue("BatteryLastService", newValue, {
                                      shouldDirty: true,
                                    });
                                    setValue("BatteryNextService", "", {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="BatteryNextService"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Next Maintenance Due"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  minDate={getValues("BatteryLastService")}
                                  onChange={(newValue) => {
                                    setValue("BatteryNextService", newValue, {
                                      shouldDirty: true,
                                    });
                                  }}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}

                      <Divider />

                      <Button
                        sx={{ width: "110px", mt: 1 }}
                        color="info"
                        variant="outlined"
                        onClick={() => dispatch({ type: "Brake" })}
                      >
                        BRAKE
                      </Button>
                      {!state.Brake && (
                        <Grid
                          container
                          // sx={{
                          //   "& .MuiTextField-root": { mt: 1 },
                          // }}
                        >
                          <Grid
                            item
                            sm={6}
                            xs={12}
                            md={4}
                            lg={4}
                            textAlign={"center"}
                          >
                            <Controller
                              name="BrakeLastInspectionDate"
                              control={control}
                              // rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Last Brake Inspection Date"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue(
                                      "BrakeLastInspectionDate",
                                      newValue,
                                      {
                                        shouldDirty: true,
                                      }
                                    );
                                    setValue("BrakeNextInspectionDate", "", {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="BrakeNextInspectionDate"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Next Inspection Due"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  minDate={getValues("BrakeLastInspectionDate")}
                                  onChange={(newValue) => {
                                    setValue(
                                      "BrakeNextInspectionDate",
                                      newValue,
                                      {
                                        shouldDirty: true,
                                      }
                                    );
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
                          >
                            <Controller
                              name="BrakeCondition"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="Brake Condition"
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}

                      <Divider />

                      <Button
                        sx={{ width: "110px", mt: 1 }}
                        onClick={() => {
                          handleOpen();
                          dispatch({ type: "Tyres" });
                        }}
                        color="info"
                        variant="outlined"
                      >
                        TYRES
                      </Button>
                      {!state.Tyres && (
                        <Grid
                          container
                          // sx={{
                          //   "& .MuiTextField-root": { mt: 1 },
                          // }}
                        >
                          <Grid
                            item
                            sm={6}
                            xs={12}
                            md={4}
                            lg={4}
                            textAlign={"center"}
                          >
                            <Controller
                              name="TireTreadCheckDate"
                              control={control}
                              // rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Tread Check Date"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue("TireTreadCheckDate", newValue, {
                                      shouldDirty: true,
                                    });
                                    setValue("TireNextCheckDate", "", {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="TireNextCheckDate"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Next Check Date"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  minDate={getValues("TireTreadCheckDate")}
                                  onChange={(newValue) => {
                                    setValue("TireNextCheckDate", newValue, {
                                      shouldDirty: true,
                                    });
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
                          >
                            <Controller
                              name="TireReplacementDue"
                              control={control}
                              rules={{ required: "Date is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <SelectedDatePickerField
                                  label="Tyre Replacement Due"
                                  name={field.name}
                                  value={
                                    field.value ? dayjs(field.value) : undefined
                                  }
                                  onChange={(newValue) => {
                                    setValue("TireReplacementDue", newValue, {
                                      shouldDirty: true,
                                    });
                                  }}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )}
                  {tabvalue === 4 && (
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        "& .MuiTextField-root": { mt: 1 },
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        //   md={6}
                        //   sm={6}
                        lg={6}
                        mt={1}
                        textAlign={"center"}
                        //   textAlign={"end"}
                      >
                        <Controller
                          name="Comments"
                          // rules={{ required: "this field is required" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="REMARKS"
                              type="text"
                              rows={2}
                              multiline
                              {...field}
                              error={!!error}
                              sx={{
                                maxWidth: 400,
                                width: "100%", // Ensures it scales on smaller screens
                              }}
                              helperText={error ? error.message : null}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
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
                onClick={handleDelete}
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
