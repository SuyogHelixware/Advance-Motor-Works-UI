import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CardComponent from "../Components/CardComponent";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import apiClient from "../../services/apiClient";
// import usePermissions from "../Components/usePermissions";

export default function DocumentSeries() {
  const theme = useTheme();
  // const perms = usePermissions(43);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  // const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState("");
  const [IndicatorList, setIndicatorList] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isEditMode, setIsEditMode] = useState("ADD");
  const [editingRow, setEditingRow] = useState(null);
  const [defaultRowId, setDefaultRowId] = useState(null);
  const [docSeriesData, setDocSeriesData] = useState(null);

  const [loading, setLoading] = useState(false);
  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const initial = {
    DocEntry: "",
    DocSubType: "",
    ObjType: "",
    ObjectName: "",
    Status: "1",
    SeriesName: "",
    BeginStr: "",
    EndStr: "",
    NumSize: "8",
    InitialNum: "",
    Indicator: "",
    NextNumber: "",
    LastNum: "",
    Remarks: "",
    DfltSeries: "0",
    oLines: [],
  };

  // ==============useForm====================================
  const { control, setValue, reset, getValues, watch } = useForm({
    defaultValues: initial,
  });
  const oLines = watch("oLines");
  const { isDirty } = useFormState({ control });

  const clearFormData = () => {
    reset(initial);
    // setDocEntry("");
    setSelectedData("");
    setEditingRow(null);
    setSelectedRowId(null);
    setDefaultRowId(null);
    setIsEditMode("ADD");
    setDocSeriesData(null);
    setValue("Indicator", IndicatorList[0].Code);
  };

  const isExistingRow =
    !!editingRow?.LineNum ||
    (!!selectedRowId && defaultRowId === selectedRowId);

  const handleAddSeries = async () => {
    const formData = getValues();
    const existingRows = getValues("oLines") || [];

    const { ObjectName, SeriesName, InitialNum, LastNum } = formData;

    if (!ObjectName?.trim()) {
      Swal.fire({
        text: "Transaction Name is required.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    if (!SeriesName?.trim()) {
      Swal.fire({
        text: "Series Name is required.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (!InitialNum) {
      Swal.fire({
        text: "First No is required.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    // 0️⃣ Check duplicate SeriesName across all rows
    const rowsToCheck =
      isEditMode === "UPDATE"
        ? existingRows.filter(
            (row) => (row.id || row.LineNum) !== selectedRowId
          )
        : existingRows;

    const duplicateSeriesName = rowsToCheck.find(
      (row) =>
        row.SeriesName?.trim().toLowerCase() === SeriesName.trim().toLowerCase()
    );

    if (duplicateSeriesName) {
      Swal.fire({
        text: `Series Name "${SeriesName}" already exists.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    if (InitialNum < 0) {
      Swal.fire({
        text: `First No. cannot be Negative !`,
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    if (LastNum && LastNum !== "0" && Number(LastNum) < Number(InitialNum)) {
      Swal.fire({
        text: "Last Number must be greater than Initial Number.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    // 🔹 UPDATE mode

    if (isEditMode === "UPDATE" && selectedRowId) {
      // 🔹 Prepare updated row data
      const updatedRows = existingRows.map((row) =>
        (row.id || row.LineNum) === selectedRowId
          ? {
              ...row,
              ...formData,
              Indicator: formData.Indicator,
              Status: formData.Status || "1",
            }
          : row
      );

      // 🔹 Prepare payload for API (only this row)
      const rowToUpdate = updatedRows.find(
        (row) => (row.id || row.LineNum) === selectedRowId
      );

      const payload = {
        LineNum: rowToUpdate.LineNum,
        DocEntry: rowToUpdate.DocEntry || "",
        UserId: user.UserId,
        CreatedBy: rowToUpdate.CreatedBy || user.UserName,
        CreatedDate: rowToUpdate.CreatedDate || dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        ObjectCode: docSeriesData?.ObjType,
        SeriesName: rowToUpdate.SeriesName,
        InitialNum: rowToUpdate.InitialNum,
        NextNumber: rowToUpdate.NextNumber,
        LastNum: rowToUpdate.LastNum || "",
        BeginStr: rowToUpdate.BeginStr || "",
        EndStr: rowToUpdate.EndStr || "",
        NumSize: rowToUpdate.NumSize || "",
        Status: rowToUpdate.Status === "1" ? "1" : "0",
        Indicator: rowToUpdate.Indicator,
        DocSubType: rowToUpdate.DocSubType || "",
        DfltSeries:
          getValues("DfltSeries") === "1" ? rowToUpdate.SeriesName : "",

        Remarks: rowToUpdate.Remarks || "",
      };

      try {
        const result = await Swal.fire({
          text: `Do you want to update Series "${rowToUpdate.SeriesName}"?`,
          icon: "question",
          showDenyButton: true,
          confirmButtonText: "Yes",
          denyButtonText: "No",
        });

        if (result.isConfirmed) {
          setLoading(true);
          const response = await apiClient.put(
            `/DocSeriesV2/Line${rowToUpdate.LineNum}`,
            payload
          );

          const { success, message } = response.data;

          if (success) {
            setValue("oLines", updatedRows);

            Swal.fire({
              title: "Success!",
              text: "Document Series updated successfully",
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
            });

            await setDocSeriesDataList(rowToUpdate.DocEntry);
          } else {
            Swal.fire({
              title: "Error!",
              text: message || "Failed to update Document Series",
              icon: "warning",
            });
          }
        } else {
          Swal.fire({
            text: "Update cancelled!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("PUT API Error:", error);
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.message || "Failed to update row",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    // 🔹 ADD mode
    else if (isEditMode === "ADD") {
      const newId =
        existingRows.length > 0
          ? Math.max(...existingRows.map((r) => r.id || 0)) + 1
          : 1;
      const newRow = {
        id: newId,
        LineNum: "", // empty for new row
        ...formData,
        NextNumber: formData.InitialNum,
        Indicator: formData.Indicator,
        Status: formData.Status || "1",
      };

      // Prepare payload
      const payload = {
        LineNum: "",
        DocEntry: selectedData,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: newRow.Status,
        ObjectCode: docSeriesData?.ObjType,
        SeriesName: newRow.SeriesName || "",
        InitialNum: newRow.InitialNum || "",
        NextNumber: newRow.NextNumber || "",
        LastNum: newRow.LastNum || null,
        BeginStr: newRow.BeginStr || "",
        EndStr: newRow.EndStr || "",
        NumSize: newRow.NumSize || "",
        Indicator: newRow.Indicator || "0",
        DocSubType: newRow.DocSubType || "",
        DfltSeries: getValues("DfltSeries") === "1" ? newRow.SeriesName : "",
        Remarks: newRow.Remarks || "",
      };

      try {
        setLoading(true);
        const response = await apiClient.post(`/DocSeriesV2/Line`, payload);
        if (response.data.success) {
          // ✅ only add to grid if API succeeds
          setValue("oLines", [...existingRows, newRow]);
          setSelectedRowId(newId);

          Swal.fire({
            title: "Success!",
            text: "Document Series added successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });

          await setDocSeriesDataList(selectedData);
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Failed to add Document Series",
            icon: "warning",
          });
        }
      } catch (error) {
        console.error("ADD API Error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add row",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    Object.keys(initial).forEach((key) => {
      if (key !== "oLines" && key !== "ObjectName") {
        setValue(key, "");
      }
    });
    setEditingRow(null);
    setIsEditMode("ADD");
    setSelectedRowId(null);
    setValue("Indicator", IndicatorList[0].Code);
    setValue("NumSize", "8");
  };

  const handleEditRow = (row) => {
    setIsEditMode("UPDATE");
    setSelectedRowId(row.LineNum || row.id);
    setEditingRow(row);

    Object.keys(initial).forEach((key) => {
      if (key !== "oLines" && key !== "id" && key !== "ObjectName") {
        if (key === "Indicator") {
          setValue("Indicator", row.Indicator ?? "");
        } else if (key === "DfltSeries") {
          setValue(
            "DfltSeries",
            row.SeriesName === docSeriesData?.DfltSeries ? "1" : "0"
          );
        } else {
          setValue(key, row[key] ?? "");
        }
      }
    });
  };

  const handleDefaultCheckbox = (rowId) => {
    const rows = getValues("oLines") || [];
    const selectedRow = rows.find((row) => (row.id || row.LineNum) === rowId);

    if (selectedRow) {
      setDefaultRowId(rowId); // mark as default
      // handleEditRow(selectedRow);
    }
  };

  const columns = [
    {
      field: "IsDefault",
      headerName: "Default",
      width: 80,
      headerAlign: "center",
      align: "center",
      hide: true,
      renderCell: (params) => {
        const rowId = params.row.id || params.row.LineNum;
        return (
          <Checkbox
            checked={rowId === defaultRowId} // ✅ single default row
            disabled
            onChange={() => handleDefaultCheckbox(rowId)}
          />
        );
      },
    },
    {
      field: "SeriesName",
      headerName: "Series Name",
      width: 180,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "InitialNum",
      headerName: "First No",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "NextNumber",
      headerName: "Next No",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "LastNum",
      headerName: "Last No",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "BeginStr",
      headerName: "Prefix",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "EndStr",
      headerName: "Suffix",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "NumSize",
      headerName: "No of Digits",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "Indicator",
      headerName: "Period Indicator",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "Remarks",
      headerName: "Remarks",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "Status",
      headerName: "Lock",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Checkbox checked={params.row.Status === "0"} disabled />
      ),
    },

    {
      field: "Action",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          {/* <IconButton color="primary" onClick={() => handleEditRow(params.row)}>
            <EditNoteIcon />
          </IconButton> */}
          <IconButton
            color="error"
            onClick={() => handleOnDelete(params.row.LineNum)}
            // disabled={!!params.row.LineNum}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  // ===============Delete API ===================================

  const handleOnDelete = async (LineNum) => {
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
        const response = await apiClient.delete(`/DocSeriesV2/Line/${LineNum}`);
        const { success, message } = response.data;
        setLoading(false);
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "Document Series Deleted",
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
      } else {
        Swal.fire({
          text: "Document Series is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting tax:", error);

      Swal.fire({
        text: "An error occurred while deleting the DocSeries.",
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 4500,
      });
    }
  };
  // ===============API for Searching open list data====================================
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
      const isSearch = searchTerm && searchTerm.trim() !== "";

      const url = isSearch
        ? `/DocSeriesV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/DocSeriesV2/Pages/1/${pageNum}/20`;

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

  useEffect(
    () => {
      fetchOpenListData(0);
      fetchData();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  // ===============API for Setting specific  Cards data====================================

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
          setDocSeriesDataList(DocEntry);
          // setSaveUpdateName("UPDATE");
        });
      } else {
        setDocSeriesDataList(DocEntry);
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
  const setDocSeriesDataList = async (DocEntry) => {
    if (!DocEntry) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/DocSeriesV2/${DocEntry}`);
      const data = response.data.values;
      setDocSeriesData(data);
      toggleDrawer();
      // setDocEntry(DocEntry);
      setSelectedData(DocEntry);
      setSidebarOpen(false);
      setValue("ObjectName", data.ObjectName);
      // find matching row based on DfltSeries
      let rowToEdit = data?.oLines?.find(
        (row) => row.SeriesName?.toString() === data?.DfltSeries?.toString()
      );

      // fallback to first row if no DfltSeries match
      if (!rowToEdit && data?.oLines?.length > 0) {
        rowToEdit = data.oLines[0];
      }

      if (rowToEdit) {
        // populate form with that row
        reset({
          ...data,
          SeriesName: rowToEdit.SeriesName,
          BeginStr: rowToEdit.BeginStr,
          EndStr: rowToEdit.EndStr,
          NumSize: rowToEdit.NumSize,
          InitialNum: rowToEdit.InitialNum,
          NextNumber: rowToEdit.NextNumber,
          LastNum: rowToEdit.LastNum,
          Indicator: rowToEdit.Indicator ?? "",
          Remarks: rowToEdit.Remarks,
          ObjectName: data.ObjectName, // keep ObjectName
          Status: rowToEdit.Status,
        });

        // ✅ set edit mode and selected row ID
        setIsEditMode("UPDATE");
        setSelectedRowId(rowToEdit.LineNum || rowToEdit.id);
        setDefaultRowId(rowToEdit.LineNum || rowToEdit.id);
        setValue("DfltSeries", "1");

        // setSaveUpdateName("UPDATE");
      } else {
        // No row found, default to ADD
        setIsEditMode("ADD");
        setSelectedRowId(null);
        setDefaultRowId(null);
        // setSaveUpdateName("ADD");
        setValue("DfltSeries", "0");
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching Doc Series data.",
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Period Indicator Data===================================
  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/Indicators/All`);
      const response = res.data;

      if (response.success === true) {
        setIndicatorList(response.values);
        if (response.values.length > 0) {
          setValue("Indicator", response.values[0].Code);
        }
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
          Doc Series List
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
                  title={item.ObjectName}
                  subtitle={item.SeriesName}
                  description={item.NextNumber}
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
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        // onSubmit={handleSubmit(handleSubmitForm)}
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
            onClick={toggleDrawer}
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
              Document Series
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
                <Grid container textTransform={"uppercase"}>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ObjectName"
                      control={control}
                      rules={{
                        required: "Object Name is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Transaction Name"
                          type="text"
                          {...field}
                          disabled
                          error={!!error}
                          maxlength={10}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                    {/* <Controller
                      name="ObjectName"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="Transaction Name"
                          type="text"                      
                          readOnly={true}
                          disabled
                          onClick={handleInputChange}
                          onChange={(e) => {
                            setValue("ObjectName", e.target.value);
                          }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    /> */}
                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                    {/* <SearchModel
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      onCancel={handleCloseDialog}
                      title="Transation Master"
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
                            // loader={
                            //   <BeatLoader
                            //     color={
                            //       theme.palette.mode === "light"
                            //         ? "black"
                            //         : "white"
                            //     }
                            //   />
                            // }
                            scrollableTarget="getListForCreateScroll"
                            // endMessage={
                            //   <Typography textAlign={"center"}>
                            //     No More Records
                            //   </Typography>
                            // }
                          >
                            {getListData.map((item, index) => (
                              <CardComponent
                                key={index}
                                title={item.ObjectName}
                                subtitle={item.ObjType}
                                // description={item.CurrTotal}
                                searchResult={getListquery}
                                onClick={() => {
                                  onSelectRequest(item.DocEntry);
                                }}
                              />
                            ))}
                          </InfiniteScroll>
                        </>
                      }
                    /> */}
                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="SeriesName"
                      control={control}
                      rules={{
                        required: "Series Name is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Series Name"
                          type="text"
                          {...field}
                          disabled={isExistingRow}
                          error={!!error}
                          maxlength={10}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="BeginStr"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" Preffix"
                          type="text"
                          {...field}
                          disabled={isExistingRow}
                          inputProps={{ maxLength: 3 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="EndStr"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" Suffix"
                          type="text"
                          {...field}
                          disabled={isExistingRow}
                          inputProps={{ maxLength: 3 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="InitialNum"
                      control={control}
                      rules={{
                        required: "First No is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="First No"
                          type="number"
                          {...field}
                          disabled={isExistingRow}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="NextNumber"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Next No"
                          type="number"
                          readOnly
                          value={watch("InitialNum") || ""} // 👈 directly mirror InitialNum
                          InputProps={{ readOnly: true }} // keep it readonly
                          onChange={() => {}} // no-op (to avoid warnings)
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LastNum"
                      control={control}
                      // rules={{
                      //   required: "Last No Name is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Last No"
                          type="number"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Indicator"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="Period Indicator"
                          data={IndicatorList.map((item) => ({
                            key: item.Code,
                            value: item.Code,
                          }))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="NumSize"
                      control={control}
                      rules={{ required: "No of Digits is required" }} // optional validation
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="No of Digits"
                          {...field}
                          data={[
                            { key: "4", value: "4" },
                            { key: "8", value: "8" },
                            { key: "12", value: "12" },
                            { key: "16", value: "16" },
                          ]}
                          disabled={isExistingRow}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Remarks"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Status"
                      control={control}
                      defaultValue="1" // "0" unchecked by default
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value === "0"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "0" : "1")
                              }
                            />
                          }
                          label="Lock"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DfltSeries"
                      control={control}
                      defaultValue="0" // "0" unchecked by default
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value === "1"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "1" : "0")
                              }
                            />
                          }
                          label="Default"
                        />
                      )}
                    />
                  </Grid>
                  <Divider
                    sx={{ mt: 1, width: "100%", color: "gray", mb: 1 }}
                  />
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      px={13}
                      flexDirection={{ xs: "column", sm: "row" }} // stack on xs, row on sm+
                      gap={2} // spacing between buttons when stacked
                    >
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                        onClick={handleAddSeries}
                      >
                        {isEditMode} SERIES
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleReset}
                      >
                        RESET
                      </Button>
                    </Box>
                  </Grid>

                  {/* <Grid
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
                    <Button
                      variant="contained"
                      // type="submit"
                      color="success"
                      sx={{ color: "white" }}
                      onClick={handleAddSeries}
                    >
                      {isEditMode ? "UPDATE" : "ADD"}
                    </Button>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleReset}
                      >
                        RESET
                      </Button>
                    </Grid>
                  </Grid> */}
                </Grid>
              </Box>

              {/* Wrapper for Grid and Total */}
              <Grid
                item
                xs={12}
                sx={{ flexGrow: 1, overflowY: "auto", marginTop: "25px" }}
              >
                <DataGrid
                  className="datagrid-style"
                  rows={oLines}
                  columns={columns}
                  rowHeight={50}
                  getRowId={(row) => row.id || row.LineNum}
                  pageSize={5}
                  hideFooter
                  onRowClick={(params) => handleEditRow(params.row)}
                  columnVisibilityModel={{
                    IsDefault: false, // 👈 hide the column
                  }}
                  getRowClassName={(params) =>
                    (params.row.id || params.row.LineNum) === defaultRowId
                      ? "default-row"
                      : ""
                  }
                  sx={{
                    height: "50vh",
                    overflowY: "auto",
                    "& .MuiDataGrid-columnHeaders": {
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    },
                    backgroundColor:
                      theme.palette.mode === "light" ? "#fff" : "#373842",
                    "& .MuiDataGrid-cell": {
                      border: "none",
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                    "& .default-row": {
                      bgcolor: "#c5c4c4ff", // light gray
                    },
                  }}
                />
              </Grid>
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
              {/* <Button
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
              </Button> */}

              {/* <Grid item>
                <Button
                  variant="contained"
                  disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                  color="error"
                  onClick={handleOnDelete}
                >
                  DELETE
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
