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
} from "@mui/material";
import { green } from "@mui/material/colors";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useState } from "react";

const ProductionDataGrid = ({
  open,
  closeModel,
  onSubmit,
  isLoading,
  title,
  getRowId,
  columns,
  rows,
  currentPage,
  limit,
  onPaginationModelChange,
  onRowSelectionModelChange,
  onSearchChange,
  rowCount,
  oLines,
  ItemCodeH = 0,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
    setTimeout(() => {
      const modalContainer = document.querySelector(".MuiModal-root");
      modalContainer?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <Modal
      open={open}
      onClose={closeModel}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: isFullScreen ? "95%" : { xs: "75%", lg: "70%" },
          maxHeight: "100vh",
          overflowY: "auto",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
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

        <Grid container>
          <Grid
            container
            item
            mt={2}
            sx={{
              ml: 2,
              width: "100%",
              height: isFullScreen ? "75vh" : "auto",
            }}
          >
            <Paper
              sx={{
                width: "100%",
                height: isFullScreen ? "75vh" : "50vh",
              }}
            >
              <DataGrid
                className="datagrid-style"
                getRowClassName={(params) => {
                  const isItem = !!params.row.ItemCode;
                  const isService = !!params.row.ServCode;
                  const isSelected =
                    (isItem &&
                      (oLines || []).some(
                        (el) => el.ItemCode === params.row.ItemCode,
                      )) ||
                    (isService &&
                      (oLines || []).some(
                        (el) => el.ServCode === params.row.ServCode,
                      ));
                  const isDisabled = params.row.ItemCode === ItemCodeH; // ✅ header row

                  if (isDisabled) return "disabled-row";
                  return isSelected ? "selected-row" : "";
                }}
                sx={{
                  height: "100%",
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
                  "& .disabled-row": (theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
                    color: theme.palette.mode === "dark" ? "#888" : "#aaa",
                    pointerEvents: "none", // prevent hover/interaction
                  }),
                  "& .MuiCheckbox-root.Mui-checked": {
                    color: "#1976d2",
                  },
                }}
                rows={rows}
                columns={columns}
                pagination
                paginationMode="server"
                getRowId={getRowId}
                rowCount={rowCount}
                paginationModel={{ page: currentPage, pageSize: limit }}
                onPaginationModelChange={onPaginationModelChange}
                checkboxSelection
                keepNonExistentRowsSelected
                disableRowSelectionOnClick
                selectionModel={(oLines || []).map((row) => row.DocEntry)}
                onRowSelectionModelChange={(ids) =>
                  onRowSelectionModelChange(ids)
                }
                loading={isLoading}
                initialState={{
                  pagination: { paginationModel: { pageSize: limit } },
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: [],
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
                  const quickFilterValue =
                    model.quickFilterValues.join(" ") || "";
                  onSearchChange(quickFilterValue);
                }}
                // isRowSelectable={(params) => params.row.ItemCode !== ItemCodeH}
              />
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            mt={1}
            px={1}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              bottom: 0,
              backgroundColor: "background.paper",
              zIndex: 10,
              py: 1,
              borderTop: "1px solid #ccc",
            }}
          >
            <Button variant="contained" color="success" onClick={onSubmit}>
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ProductionDataGrid;
