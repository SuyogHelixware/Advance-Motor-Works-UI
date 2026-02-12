import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { green } from "@mui/material/colors";
import { InputTextField, SelectedDatePickerField } from "./formComponents";
import dayjs from "dayjs";

const CurrencySelectionModal = ({
  open,
  onClose,
  currencyList,
  currencyColumns,
  getRowId,
  onSubmit,
  handlePaginationModelChange,
  handleSearchChange,
  currentPage,
  limit,
  rowCount,
  searchText,
  isLoading,
  selectedRows,
  setSelectedRows,
  oLines = [],
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const toggleModalSize = () => setIsFullScreen((prev) => !prev);

  const handleSelectionChange = (ids) => {
    const selectedIDs = new Set(ids);
    const selected = currencyList
      .filter((row) => selectedIDs.has(row.CurrCode))
      .map((data) => ({
        CurrCode: data.CurrCode,
        Currency: data.CurrName || "",
        rate: "",
      }));
    setSelectedRows(selected);
    console.log("Selected_Rows", selected);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "relative",
          width: isFullScreen ? "95%" : "75%",
          maxHeight: "100vh",
          overflowY: "auto",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          mx: "auto",
          my: "5%",
        }}
      >
        {/* Fullscreen toggle */}
        <IconButton
          onClick={toggleModalSize}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>

        {/* Title */}
        <Typography variant="h6" textAlign="center" fontWeight="bold" mb={1}>
          Set Rate for Selection Criteria
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Date filters */}
      {/* Date filters */}
<Grid container spacing={2} mb={2} justifyContent="center">
  <Grid item xs={12} sm={6} md={4}>
    <SelectedDatePickerField
      label="From Date"
      name="FromDate"
      value={fromDate ? dayjs(fromDate) : undefined}
      onChange={(date) => {
        setFromDate(date);
        setToDate("");
      }}
    />
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <SelectedDatePickerField
      label="To Date"
      name="ToDate"
      value={toDate ? dayjs(toDate) : undefined}
      minDate={fromDate}
      onChange={(date) => setToDate(date)}
      disabled={!fromDate}
    />
  </Grid>
</Grid>


        {/* DataGrid */}
        <Paper sx={{ height: isFullScreen ? "75vh" : "50vh", width: "100%" }}>
          <DataGrid
            className="datagrid-style"
            rows={currencyList}
            columns={currencyColumns}
            getRowId={getRowId}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={{ page: currentPage, pageSize: limit }}
            onPaginationModelChange={handlePaginationModelChange}
            checkboxSelection
            disableRowSelectionOnClick
            keepNonExistentRowsSelected
            loading={isLoading}
            selectionModel={oLines.map((row) => row.DocEntry)}
            onRowSelectionModelChange={handleSelectionChange}
            getRowClassName={(params) => {
              const isItem = !!params.row.ItemCode;
              const isService = !!params.row.ServCode;
              const isSelected =
                (isItem &&
                  oLines.some((el) => el.ItemCode === params.row.ItemCode)) ||
                (isService &&
                  oLines.some((el) => el.ServCode === params.row.ServCode));
              return isSelected ? "selected-row" : "";
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: (theme) =>
                  theme.palette.custome?.datagridcolor ||
                  theme.palette.grey[100],
              },
              "& .MuiDataGrid-row:hover": {
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
              },
              "& .selected-row": (theme) => ({
                backgroundColor:
                  theme.palette.mode === "dark" ? green[900] : green[100],
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? green[800] : green[200],
                },
              }),
              "& .MuiCheckbox-root.Mui-checked": {
                color: "#1976d2",
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: limit } },
              filter: {
                filterModel: {
                  items: [],
                  quickFilterValues: [searchText],
                },
              },
            }}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            onFilterModelChange={(model) => {
              const quickFilterValue = model.quickFilterValues?.[0] || "";
              handleSearchChange(quickFilterValue);
            }}
          />
        </Paper>

        {/* Buttons */}
        <Grid container mt={2} justifyContent="space-between">
          <Button variant="contained" color="success" onClick={onSubmit}>
            Save
          </Button>
          <Button variant="contained" color="error" onClick={onClose}>
            Close
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
};

export default CurrencySelectionModal;
