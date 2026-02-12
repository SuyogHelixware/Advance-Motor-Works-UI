import DeleteIcon from "@mui/icons-material/Delete";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import BinLocationDataGridList from "./BinLocationDataGridList";
import {
  InputSelectTextField,
  InputTextField,
  ModelInputText,
} from "./formComponents";

const Column = [
  {
    field: "BinCode",
    headerName: "BINLOCATION",
    width: 500,
    align: "center", // ✅ center align
    headerAlign: "center",
  },
];
const BinLocation = ({
  open,
  closeModel,
  onSubmit,
  getRowId,
  title,
  DocNum,
  oLines = [],
  data = {},
  onRowSelectionModelChange,
  DisbledUpdate,
}) => {
  const theme = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openBinLocation, setBinLocationOpen] = useState(false);
  const [BinLocationList, setBinLocationList] = useState([]);
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [selectedBins, setSelectedBins] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const BinColumn = [
    {
      field: "BinCode",
      headerName: "BINLOCATION",
      width: 500,
      align: "center", // ✅ center align
      headerAlign: "center",
    },
    // {
    //   field: "Quantity",
    //   headerName: "Allocated Quantity",
    //   width: 500,
    //   align: "center", // ✅ center align
    //   headerAlign: "center",
    //   editable: true,
    // },
    {
      field: "Quantity",
      headerName: "Allocated Quantity",
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ModelInputText
          name="Quantity"
          type="number"
          value={params.row.Quantity ?? ""}
          disabled={DisbledUpdate === "UPDATE"}
          onChange={(e) =>
            handleChangeBin(
              { ...params.row, Quantity: e.target.value },
              params.row
            )
          }
        />
      ),
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            // disabled={params.row.BaseTyp}
            disabled={DisbledUpdate === "UPDATE"}
            onClick={() => handleDeleteBin(params.row.DocEntry)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };

  console.log("oLines", oLines);
  const { control, setValue, handleSubmit, getValues, watch } = useForm({
    defaultValues: {
      DocNum: "",
      Lineno: "",
      WHSCode: "",
      ItemCode: "",
      Quantity: "",
      totalalewd: "",
      Riming: "",
      BinType: "",
    },
  });

  const onSubmitBinLoc = () => {
    if (getValues("Riming") !== 0) {
      Swal.fire({
        text: "You can’t continue because the remaining quantity is not zero",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    const updatedQty = rows.filter((item) => Number(item.Quantity) > 0);
    console.log("updatedQty", updatedQty);
    onSubmit(updatedQty);
    Swal.fire({
      toast: true,
      position: "center",
      icon: "success",
      title: "Quantity successfully allocated to bin location.",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
    setValue("BinType", "");
    // onSubmit(rows);
  };

  const closeModelBin = () => {
    setValue("BinType", "");
    closeModel();
  };
  setValue("DocNum", DocNum);
  setValue("Lineno", data.id + 1);
  setValue("WHSCode", data.WHSCode || data.FromWHSCode);
  setValue("ItemCode", data.ItemCode);
  setValue("Quantity", data.Quantity);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open && data && typeof data === "object") {
      setRows(
        Array.isArray(data.oDocBinLocationLines) &&
          data.oDocBinLocationLines.length > 0
          ? data.oDocBinLocationLines.map((item) => ({
              ...item,
              DocEntry: item.BinAbs,
            }))
          : [
              {
                DocEntry: data.DftBinAbs,
                BinCode: data.BinCode || "",
                Quantity: data.Quantity || 0,
                Status: data.Status ?? "1",
              },
            ]
      );

      console.log(data.oDocBinLocationLines);
    }
  }, [data, open]);

  console.log("fsdfds", rows);
  // Only depend on 'open'
  const binType = watch("BinType"); // watch BinType field
  useEffect(() => {
    if (binType === "2" && data && typeof data === "object") {
      setRows([
        {
          DocEntry: data.DftBinAbs,
          BinCode: data.BinCode || "",
          Quantity: data.Quantity || 0,
          Status: data.Status ?? "1",
        },
      ]);
    } else if (binType === "1") {
      const Remining = getValues("Riming");
      if (binType === "1" || data.oDocBinLocationLines?.length > 0) {
        setRows((prevRows) =>
          prevRows.map((row, index) =>
            index === 0
              ? {
                  ...row,
                  Quantity:
                    parseFloat(row.Quantity) + parseFloat(Remining || 0),
                }
              : row
          )
        );
      } else {
        const Remining = getValues("Riming");
        setRows((prevRows) =>
          prevRows.map((row, index) =>
            index === 0
              ? {
                  ...row,
                  Quantity:
                    parseFloat(row.Quantity) + parseFloat(Remining || 0),
                }
              : row
          )
        );
      }
    }
  }, [binType, data]);

  const handleChangeBin = (newRow, oldRow) => {
    // Reset the BinType field whenever a change happens
    setValue("BinType", "");

    const maxQty = Number(getValues("Quantity")) || 0;
    let updatedQuantity = Number(newRow.Quantity) || 0;
    if (updatedQuantity < 0) updatedQuantity = 0;
    if (updatedQuantity > maxQty) updatedQuantity = maxQty;
    const updatedRow = {
      ...oldRow,
      ...newRow,
      Quantity: updatedQuantity,
    };
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.DocEntry === updatedRow.DocEntry ? updatedRow : row
      )
    );

    return updatedRow;
  };
  setValue(
    "totalalewd",
    rows.reduce((sum, row) => sum + (Number(row.Quantity) || 0), 0)
  );
  setValue("Riming", data.Quantity - getValues("totalalewd"));

  console.log("rows", rows);
  const handleSelectBin = (ids) => {
    const selectedIDs = new Set(ids);
    const newSelectedRows = BinLocationList.filter((row) =>
      selectedIDs.has(row.DocEntry)
    ) // keep only selected
      .map((bin, index) => ({
        DocEntry: bin.DocEntry, // fallback id
        BinCode: bin.BinCode,
        Quantity: 0,
        Status: bin.Status ?? "1",
      }));

    setSelectedBins(newSelectedRows);
  };
  const fetchBinLocation = useCallback(
    async (page = 0, search = "") => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(`/BinLocationV2/GetByWHSCode/`, {
          params: {
            // ItemCode: getValues("ItemCode"),
            WHSCode: getValues("WHSCode"),
            Status: 1,

            SearchText: search,
            Page: page,
            Limit: LIMIT,
          },
        });

        if (data.success) {
          const items = data.values || [];

          setBinLocationList(items);
          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [itemCache]
  );
  useEffect(() => {
    if (open) {
      fetchBinLocation(currentPage, searchText, getValues("WHSCode"));
    }
  }, [open, currentPage, searchText, fetchBinLocation]);
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage]
  );
  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to page 0 on search
    setItemCache({}); // Clear cache on new search
  }, []);

  const closeModelBinLocation = () => {
    setBinLocationOpen(false);
  };
  const handleDeleteBin = (id) => {
    const updated = rows.filter((row) => row.DocEntry !== id); // filter out the row with matching id
    setRows(updated);
  };
  const ClearAllocation = () => {
    // const ClearRows = rows.map((Quantity) => ({
    //   ...Quantity,
    //   Quantity: "0",
    // }));
    // setRows(ClearRows);
    setValue("BinType", "");

    setRows(
      Array.isArray(data.oDocBinLocationLines) &&
        data.oDocBinLocationLines.length > 0
        ? data.oDocBinLocationLines.map((item) => ({
            ...item,
            DocEntry: item.BinAbs,
            Quantity: "0",
          }))
        : rows.map((row) => ({
            ...row,
            Quantity: "0",
          }))
    );
  };
  const onsubmitBin = () => {
    setRows((prev) => [...prev, ...selectedBins]);
    setSelectedBins([]);
    closeModelBinLocation();
  };
  return (
    <>
      <BinLocationDataGridList
        open={openBinLocation}
        closeModel={() => setBinLocationOpen(false)}
        onSubmit={onsubmitBin}
        isLoading={isLoading}
        title="Bin Location List"
        getRowId={(row) => row.DocEntry}
        columns={Column}
        rows={BinLocationList}
        currentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleSelectBin}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={rows}
      />

      <Modal
        open={open}
        onClose={closeModelBin}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: isFullScreen
              ? "95%"
              : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
            maxHeight: "80%",
            // overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
          component={"form"}
          onSubmit={handleSubmit(onSubmitBinLoc)}
        >
          <IconButton
            onClick={toggleModalSize}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <Typography
            textAlign="center"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Divider />

          <Grid container textAlign={"center"} gap={1} mt={1}>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="DocNum"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="DOCUMENT NO"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="Lineno"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ROW NO"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="WHSCode"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="WAREHOUSE CODE"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="ItemCode"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ITEM CODE"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="Quantity"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="QUANTITY"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="totalalewd"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ALLOCATED QUANTITY"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"}>
              <Controller
                name="Riming"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="REMAINING"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={11} sm={5} md={5} lg={3} textAlign={"center"} mt={1}>
              <Button
                variant="contained"
                color="info"
                disabled={DisbledUpdate === "UPDATE"}
                onClick={() => setBinLocationOpen(true)}
              >
                BIN LOCATION
                {/* Search Item */}
              </Button>
            </Grid>

            <Paper
              sx={{
                width: "100%",
                height: 350,
                display: "flex",
                
                flexDirection: "column",
              }}
            >
              <DataGrid
                className="datagrid-style"
                columnHeaderHeight={35}
                rowHeight={45}
                rows={rows}
                columns={BinColumn}
                getRowId={(row) => row.DocEntry}
                onRowSelectionModelChange={onRowSelectionModelChange}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                hideFooter
                isRowSelectable={(params) => params.row.Status === "0"}
                getRowClassName={(params) =>
                  params.row.Status === "0" || params.row.Status === "3"
                    ? "disabled-row"
                    : ""
                }
                sx={{
                  // flex: 1,
                  backgroundColor:
                    theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  "& .MuiDataGrid-cell": { border: "none" },
                  "& .MuiDataGrid-cell:focus": { outline: "none" },
                  "& .disabled-row .MuiDataGrid-cell": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "#f0f0f0 !important"
                        : "#080D2B",
                    opacity: 0.6,
                    pointerEvents: "none",
                  },
                  "& .MuiDataGrid-cell[data-field='Quantity']": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.action.hover // light blue-grey in dark mode
                        : "#E3F2FD", // light blue in light mode
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    textAlign: "center",
                  },
                  "& .MuiDataGrid-columnHeaders [data-field='Quantity']": {
                    textAlign: "center",
                  },
                  "& .MuiDataGrid-cell[data-field='BinCode']": {
                    backgroundColor: "#d0f0c0",
                    fontWeight: 500,
                    color: "#06470c",
                    textAlign: "center",
                  },
                  "& .MuiDataGrid-columnHeaders [data-field='BinCode']": {
                    textAlign: "center",
                  },
                }}
              />

              {/* ✅ Total Quantity under Quantity column */}
              <Box
                sx={{
                  display: "flex",
                  borderTop: "1px solid #ddd",
                  backgroundColor:
                    theme.palette.mode === "light" ? "#fff" : "#0A1238",
                  height: "45px", // same as rowHeight for alignment
                }}
              >
                {/* Empty space to align with first column */}
                <Box sx={{ width: BinColumn[0].width }} />

                {/* Total Quantity cell */}
                <Box
                  sx={{
                    width: BinColumn[1].width,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // or "flex-end" if you want right-aligned text
                    fontWeight: "bold",
                    backgroundColor: "#E3F2FD",
                    color: "#0D47A1",
                  }}
                >
                  Total Quantity:{" "}
                  {rows.reduce(
                    (sum, row) => sum + (Number(row.Quantity) || 0),
                    0
                  )}
                </Box>

                {/* Empty space for action column */}
                <Box sx={{ flex: 1 }} />
              </Box>
            </Paper>

            <Grid mt={1} item xs={12} textAlign={"center"}>
              <Controller
                name="BinType"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputSelectTextField
                    label="AUTOMATIC ALLOCATION"
                    data={[
                      { key: "1", value: "REMAINING" },
                      { key: "2", value: "DEFUALT BIN LOCATION" },
                    ]}
                    {...field}
                    disabled={DisbledUpdate === "UPDATE"}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />

              <Button
                sx={{ mt: 1 }}
                variant="contained"
                disabled={DisbledUpdate === "UPDATE"}
                onClick={ClearAllocation}
              >
                CLEAR ALLOCATION
              </Button>
            </Grid>
          </Grid>

          <Grid
            item
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // py: 1,
              px: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              color="success"
              type="submit"
              disabled={DisbledUpdate === "UPDATE"}
            >
              Save
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={closeModel}
            >
              Close
            </Button>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(BinLocation);
