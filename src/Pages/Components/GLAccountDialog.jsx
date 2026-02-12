import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@emotion/react";

const GLAccountDialog = ({
  open,
  onClose,
  rows,
  columns,
  onRowSelection,
  title = "Account List",
  getRowId,
  height = "40vh",
  withForm = false,
  actions, // Optional: Save or custom buttons
}) => {
    const theme = useTheme();
  
  return (
    <Dialog
    open={open}
    onClose={onClose}
    scroll="paper"
    fullWidth
    maxWidth="sm" 
    PaperProps={{
      sx: {
        height: "85vh", 
        display: "flex",
        flexDirection: "column",
      },
    }}
    component={withForm ? "form" : undefined}
  >
    <DialogTitle>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography fontWeight="bold" textAlign="center" width="100%">
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8 }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
  
    <Divider />
  
    <DialogContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
      <Paper sx={{ flex: 1, overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          columnHeaderHeight={35}
          rowHeight={45}
          sx={{
            height: "100%",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#373842",
            "& .MuiDataGrid-cell": {
              border: "none",
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
            "& .MuiDataGrid-virtualScroller": {
              overflow: "auto !important",
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 8 },
            },
            filter: {
              filterModel: { items: [], quickFilterValues: [] },
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
          pageSizeOptions={[8, 15, 25]}
          onRowSelectionModelChange={onRowSelection}
        />
      </Paper>
    </DialogContent>
  </Dialog>
  
  );
};

export default GLAccountDialog;
