import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";

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
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import {
  InputFields,
  InputSearchableSelect,
  InputSelectTextField,
  InputTextField,
  InputTextFieldLarge
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
// import MaintenanceCheckListSelector from "../Components/MaintenanceCheckListSelector";
import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../services/apiClient";
import usePermissions from "../Components/usePermissions";

export default function MaintenanceCheckList() {
  const theme = useTheme();
  const perms = usePermissions(149);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const [originalCheckTabRows, setOriginalCheckTabRows] = useState([]);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [openCategory, setopenCategory] = useState(false);
  const [selectedCategoryRowId, setSelectedCategoryRowId] = useState(null);
  const [CategoryList, setCategoryList] = useState([]);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkTabRows, setcheckTabRows] = useState([]);

  const [openVehicleType, setopenVehicleType] = useState(false);
  const [selectedVehicleTypeRowId, setSelectedVehicleTypeRowId] =
    useState(null);
  const [VehicleTypeList, setVehicleTypeList] = useState([]);

  const initial = {
    VehicleType: "",
    Remarks: "",
    AttcEntry: "",
    Country: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const isCheckTabDirty = useMemo(() => {
    return (
      JSON.stringify(checkTabRows) !== JSON.stringify(originalCheckTabRows)
    );
  }, [checkTabRows, originalCheckTabRows]);

  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setcheckTabRows([]);
  };

  // ===============Get initial list data====================================

  useEffect(
    () => {
      fetchOpenListData(0);
      fetchData();
      fetchDataVehicleType();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  //==================================================================================
  const addRow = () => {
    setcheckTabRows((prev) =>
      reindexRows([
        ...prev,
        {
          id: Date.now(),
          Category: "",
          MaintChkpoint: "",
          ChkpointRemarks: "",
          Status: true,
        },
      ])
    );
  };

  // const vehicleTooltips = {
  //   1: "6-Tire HYVA, 10-Tire HYVA, 12-Tire HYVA",
  //   2: "2WD Tractor, 4WD Tractor",
  //   3: "Trailer Truck, Tipper Trailer",
  //   4: "JCB, Pokeland Dumper, Excavator",
  //   5: "Mini Truck, Pickup",
  // };

  // const rawData = [
  //   { key: "1", value: "TIPPER TRUCKS" },
  //   { key: "2", value: "TRACTORS" },
  //   { key: "3", value: "TRAILERS" },
  //   { key: "4", value: "CONSTRUCTION MACHINERY" },
  //   { key: "5", value: "LIGHT COMMERICAL" },
  // ];

  const usedVehicleTypes =
    openListData?.map(
      (item) => String(item.VehicleType) // convert to string
    ) || [];

  // const dataWithTooltip = rawData.map((item) => ({
  //   key: item.key,
  //   value: (
  //     <Tooltip title={vehicleTooltips[item.key] || ""} arrow placement="right">
  //       <span>{item.value}</span>
  //     </Tooltip>
  //   ),
  //   disabled: usedVehicleTypes.includes(item.key),
  // }));

  // const vehicleTypeLabels = rawData.reduce((acc, item) => {
  //   acc[item.key] = item.value;
  //   return acc;
  // }, {});

  const reindexRows = (rows) =>
    rows.map((row, index) => ({
      ...row,
      SrNo: index + 1,
    }));
  // const CATEGORY_OPTIONS = [
  //   {
  //     key: "A",
  //     value: "Mechanical",
  //     tooltip:
  //       "Engine, Transmission, Suspension, Chassis, PTO System, Load Body / Bucket",
  //   },
  //   {
  //     key: "B",
  //     value: "Hydraulics",
  //     tooltip: "Hydraulic System",
  //   },
  //   {
  //     key: "C",
  //     value: "Tyre & Wheel",
  //     tooltip: "Tyre, Alignment & Balancing",
  //   },
  //   {
  //     key: "D",
  //     value: "Battery",
  //     tooltip: "Battery",
  //   },
  //   {
  //     key: "E",
  //     value: "Other Electrical",
  //     tooltip: "Electrical System, Software/Electronics Check",
  //   },
  //   {
  //     key: "F",
  //     value: "Brakes",
  //     tooltip: "Brakes",
  //   },
  //   {
  //     key: "G",
  //     value: "Cooling, Lubrication & Emission",
  //     tooltip:
  //       "Cooling System, Cabin Equipment, Lubrication Service, Emission Control",
  //   },
  //   {
  //     key: "H",
  //     value: "Body & Structure",
  //     tooltip: "Trailer Coupling System, General Body Maintenance",
  //   },
  //   {
  //     key: "I",
  //     value: "Safety & Inspection",
  //     tooltip: "Safety Equipment, Preventive Maintenance Inspections",
  //   },
  // ];
  const handleCellChange = useCallback((id, field, value) => {
    setcheckTabRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const isCategoryValid = useMemo(() => {
    return checkTabRows.every((row) => !!row.Category);
  }, [checkTabRows]);

  const isCheckpointValid = useMemo(() => {
    return checkTabRows.every((row) => !!row.MaintChkpoint);
  }, [checkTabRows]);

  const renderMaintChkpointCell = useCallback(
    (params) => (
      <Tooltip
        title={params.row.MaintChkpoint || ""}
        arrow
        placement="top"
        disableInteractive
      >
        <div tabIndex={-1}>
          <InputTextFieldLarge
            sx={{ width: 480, m: 0 }}
            name="MaintChkpoint"
            value={params.row.MaintChkpoint}
            onChange={(e) =>
              handleCellChange(params.row.id, "MaintChkpoint", e.target.value)
            }
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </Tooltip>
    ),
    [handleCellChange]
  );

  const modalcolumnsTab0 = useMemo(
    () => [
      {
        field: "SrNo",
        headerName: "Sr No.",
        width: 100,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "Category",
        headerName: "Category",
        width: 300,
        editable: false,
        renderCell: (params) => {
          const selectedValue = params.row.Category;

          const handleClick = (e) => {
            if (CategoryList.length === 0) {
              e.stopPropagation(); // Stop row click
              Swal.fire({
                icon: "warning",
                title: "No Categories Available",
                text: "Please add a Category first.",
              });
            }
          };

          return (
            <div onMouseDown={handleClick} style={{ width: "100%" }}>
              <InputSelectTextField
                value={selectedValue}
                onChange={(e) =>
                  handleCellChange(params.row.id, "Category", e.target.value)
                }
                sx={{ maxWidth: 400, mt:1 }}
                data={CategoryList.map((item) => ({
                  key: item.DocEntry,
                  value: (
                    <Tooltip title={item.Description} placement="right">
                      <span>{item.Type}</span>
                    </Tooltip>
                  ),
                }))}
                fullWidth
              />
            </div>
          );
        },
      },
      {
        field: "MaintChkpoint",
        headerName: "Check Point",
        width: 500,
        headerAlign: "center",
        align: "center",
        renderCell: renderMaintChkpointCell,
      },
      {
        field: "Status",
        headerName: "Active",
        width: 80,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Checkbox
            defaultValue={true}
            checked={!!params.row.Status}
            onChange={(e) =>
              handleCellChange(params.row.id, "Status", e.target.checked)
            }
          />
        ),
      },
      {
        field: "ChkpointRemarks",
        headerName: "Remark",
        width: 300,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <InputTextField
            sx={{ width: 280 }}
            name="ChkpointRemarks"
            value={params.row.ChkpointRemarks}
            onChange={(e) =>
              handleCellChange(params.row.id, "ChkpointRemarks", e.target.value)
            }
            onKeyDown={(e) => e.stopPropagation()}
          />
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
    ],
    [renderMaintChkpointCell, CategoryList]
  );

  const handleAccDeleteRow = (id) => {
    setcheckTabRows((prev) => reindexRows(prev.filter((row) => row.id !== id)));
  };

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      if (isDirty || isCheckTabDirty || ok === "UPDATE") {
        const result = await Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          return;
        }
      }

      // Proceed
      setSelectedData(DocEntry);
      setMaintenanceCheckListDataList(DocEntry);
      setSaveUpdateName("UPDATE");
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
  if (!DocEntry) return;

  try {
    setLoading(true); // start loader

    const response = await apiClient.get(`/MaintCheckPoint/${DocEntry}`);
    const { success, message, values } = response.data;

    if (success) {
      const data = values;

      toggleDrawer();
      reset(data);

      const enrichedRows = (data.oLines || []).map((row, index) => ({
        ...row,
        id: `${row.DocEntry}-${row.LineNum}`,
        SrNo: index + 1,
        Status: row.Status === "1",
      }));

      setcheckTabRows(enrichedRows);
      setOriginalCheckTabRows(enrichedRows);

      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch Maintenance Check List data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
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
    setLoading(false); // stop loader
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
    setLoading(true); // Start loader

    const url = searchTerm
      ? `/MaintCheckPoint/Search/${searchTerm}/1/${pageNum}/20`
      : `/MaintCheckPoint/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);
    const { success, message, values } = response.data;

    if (success) {
      const newData = values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch Maintenance Check List data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching the Maintenance Check List.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ==============useForm====================================
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });

  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
    if (checkTabRows.length === 0) {
      Swal.fire({
        text: "Please add at least one Maintenance Checkpoint Row.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    const vehicleTypeMap = VehicleTypeList.reduce((acc, item) => {
      acc[item.DocEntry] = item.Name;
      return acc;
    }, {});

    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().toISOString(),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().toISOString(),
      Status: "1",
      VehicleType: String(data.VehicleType),
      VehicleTypeName: vehicleTypeMap[data.VehicleType] || "",

      Remarks: String(data.Remarks),
      AttcEntry: String(data.AttcEntry || ""),
      oLines: checkTabRows.map((line) => {
        return {
          LineNum: String(line.LineNum || ""),
          DocEntry: String(data.DocEntry || ""),
          UserId: user.UserId,
          CreatedBy: user.UserName || "",
          CreatedDate: dayjs().toISOString(),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().toISOString(),

          // ⬇⬇ THIS IS THE IMPORTANT FIX
          MaintChkpoint: String(line.MaintChkpoint || ""),

          ChkpointRemarks: String(line.ChkpointRemarks || ""),
          Status: String(line.Status ? 1 : 0),
          Category: String(line.Category || ""),
        };
      }),
    };
    console.log("obj", obj);
    try {
              setLoading(true);

      if (SaveUpdateName === "SAVE") {
        if (!isCategoryValid) {
          Swal.fire({
            text: "Please select a Category for all rows.",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
          return;
        }
        if (!isCheckpointValid) {
          Swal.fire({
            text: "Please enter Checkpoint for all rows.",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
          return;
        }

        const response = await apiClient.post(`/MaintCheckPoint`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
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
          text: "Do You Want to Update ?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/MaintCheckPoint/${data.DocEntry}`,
            obj
          );

          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
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
        const response = await apiClient.delete(`/MaintCheckPoint/${DocEntry}`);

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
          text: "MaintenanceCheckList is Not Deleted",
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
        text: "An error occurred while deleting the MaintenanceCheckList.",
        icon: "error",
        confirmButtonText: "Ok",
      });
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
      setLoading(true);
      const res = await apiClient.get(
        `/VehicleMaintCateg?Status=1&Page=0&Limit=100`
      );
      const response = res.data;
      console.log("dsfdsfdfdfdf", response);

      if (response.success === true) {
        setCategoryList(response.values);
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
    } finally {
      setLoading(false);
    }
  };
  const handleAddOrUpdate = async (data) => {
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

  const isUpdateMode = selectedCategoryRowId !== null && selectedCategoryRowId !== "";

  const apiUrl = isUpdateMode
    ? `/VehicleMaintCateg/${selectedCategoryRowId}` // PUT API for Update
    : `/VehicleMaintCateg`; // POST API for Add

  // const method = isUpdateMode ? "put" : "post";

  try {
    setLoading(true); // Start loader

    if (!isUpdateMode) {
      // Add new category
      const response = await apiClient.post(apiUrl, obj);
      const { success, message } = response.data;

      if (success) {
        await fetchData();
        setSelectedCategoryRowId(null);

        Swal.fire({
          title: "Success!",
          text: "Category added successfully!",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1500,
        });
      } else {
        Swal.fire("Error!", message || "Failed to add category!", "error");
      }
    } else {
      // Confirm before updating existing category
      const result = await Swal.fire({
        text: `Do you want to update "${data.Type}"?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const response = await apiClient.put(apiUrl, obj);
        const { success, message } = response.data;

        if (success) {
          await fetchData();
          setSelectedCategoryRowId(null);

          Swal.fire({
            title: "Success!",
            text: "Category updated successfully!",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire("Error!", message || "Update failed!", "error");
        }
      } else {
        Swal.fire({
          text: "Category is not updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error);

    let errorMessage = "Something went wrong. Please try again.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  const columns = [
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
  console.log("DATADELETED", data.DocEntry);

  try {
    const result = await Swal.fire({
      text: `Do You Want to Delete "${data.Type}"?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Category Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true); // Start loader

    const response = await apiClient.delete(`/VehicleMaintCateg/${data.DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      await fetchData(); // Refresh data after deletion

      Swal.fire({
        title: "Success!",
        text: "Category Deleted",
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
      text: error?.response?.data?.message || "Something went wrong while deleting the category",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  const handleEdit = async (row) => {
  try {
    setLoading(true); // optional: show loader

    const res = await apiClient.get(`/VehicleMaintCateg?DocEntry=${row.DocEntry}`);
    const response = res.data;

    if (response.success) {
      const { DocEntry, Type, Description } = response.values;

      // Set the form fields
      setValueIndic("Type", Type);
      setValueIndic("Description", Description);

      // Save DocEntry for updating later
      setSelectedCategoryRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message || "Failed to fetch category data",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching category data:", error);

    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // optional: hide loader
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
    setLoading(true); // Optional: show loader
    const res = await apiClient.get(`/VehicleType?Status=1&Page=0&Limit=100`);
    const response = res.data;

    console.log("Vehicle Type Response:", response);

    if (response.success === true) {
      setVehicleTypeList(response.values || []);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message || "Failed to fetch vehicle types",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Optional: hide loader
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
    Name: data.Name || "",
    Description: data.Description || "",
  };

  const isUpdate = !!selectedVehicleTypeRowId; // true if updating
  const apiUrl = isUpdate
    ? `/VehicleType/${selectedVehicleTypeRowId}` // PUT API for Update
    : `/VehicleType`; // POST API for Add
  const method = isUpdate ? "put" : "post";

  try {
    setLoading(true);

    // 🔹 Direct Save (Add or Update)
    const response = await apiClient[method](apiUrl, obj);
    const { success, message } = response.data;

    if (success) {
      await fetchDataVehicleType();
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
      Swal.fire({
        title: "Error!",
        text: message || "Failed to save Vehicle Type",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error submitting Vehicle Type:", error);

    let errorMessage = "Something went wrong. Please try again later.";

    if (error?.response?.data) {
      const apiError = error.response.data;
      if (apiError.errors) {
        errorMessage = Object.values(apiError.errors).flat().join("\n");
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
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
      text: `Do You Want to Delete "${data.Name}"?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Vehicle Type Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    const response = await apiClient.delete(`/VehicleType/${data.DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      await fetchDataVehicleType(); // Refresh the list
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
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while deleting the Vehicle Type.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

 const handleVehicleTypeEdit = async (row) => {
  try {
    setLoading(true); // Optional: show loader while fetching
    const res = await apiClient.get(`/VehicleType?DocEntry=${row.DocEntry}`);
    const response = res.data;

    if (response.success) {
      const { DocEntry, Name, Description } = response.values;

      // Set values in the form
      setValueVehicleType("Name", Name);
      setValueVehicleType("Description", Description);

      // Store DocEntry for update
      setSelectedVehicleTypeRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message || "Failed to fetch Vehicle Type details.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Vehicle Type details:", error);
    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Hide loader
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
          MAINTENANCE CHECKLIST
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
                {openListData.map((item, i) => {
                  // const vehicleLabel =
                  //   vehicleTypeLabels[item.VehicleType] || "Unknown Vehicle";

                  return (
                    <CardComponent
                      key={i}
                      // title={`${item.MakeName}. ${item.MakeDesc}. ${item.SubMakeDesc || ""}`}
                      title={item.VehicleTypeName}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  );
                })}
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
              columns={columns}
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
              MAINTENANCE CHECKLIST
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
                <Grid container mb={2} mt={2}>
                  {/* <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="VehicleType"
                      control={control}
                      rules={{ required: "Vehicle Type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextFieldLarge
                          label="VEHICLE TYPE"
                          data={dataWithTooltip}
                          {...field}
                          error={!!error}
                          sx={{ width: 300 }}
                          disabled={SaveUpdateName === "UPDATE"}
                          helperText={error ? error.message : null}
                          usedLevels={
                            SaveUpdateName === "SAVE"
                              ? openListData.map((item) => item.VehicleType)
                              : []
                          }
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
                          <InputSearchableSelect
                            {...field}
                            label="VEHICLE TYPE"
                            error={!!error}
                            helperText={error?.message}
                            data={VehicleTypeList.map((item) => ({
                              key: item.DocEntry,
                              value: item.Name,
                              disabled: usedVehicleTypes.includes(
                                String(item.DocEntry)
                              ), // 👈 preserve disable
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
                          {/* OUTSIDE ICON */}
                          <IconButton
                            onClick={HandlePVehicleTypeOpen}
                            size="small"
                            sx={{
                              ml:1,
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
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {/* Add Category Button */}
                    <Button
                      onClick={HandlePCategoryOpen}
                      variant="contained"
                      color="info"
                      size="small"
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
                        // height: 480,
                        overflow: "auto",
                        // overflowY: "auto",
                        width: "100%",
                      }}
                    >
                      <DataGrid
                        className="datagrid-style"
                        hideFooter
                        columns={modalcolumnsTab0}
                        rows={checkTabRows}
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
                            display: "flex",
                            alignItems: "center", // vertical alignment
                            justifyContent: "center", // horizontal alignment
                            padding: "0 !important",
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
