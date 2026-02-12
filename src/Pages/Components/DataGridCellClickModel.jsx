import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { green } from "@mui/material/colors";
const DataGridCellClickModel = ({
  open,
  limit,
  columns,
  getRowId,
  title,
  rows,
  onCellClick,
  taxCurrentPage,
  searchText,
  closeModel,
  isLoading,
  onPaginationModelChange,
  selectedRowIndex,
  oLines=[],
  rowCount,
  onSearchChange,
  selectedTax,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
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
          width: isFullScreen
            ? "95%"
            : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
          maxHeight: "100vh",
          overflowY: "auto",
          padding: 2,
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
            right: 50,
            // "&:hover": {
            //   bgcolor: "darkred",
            // },
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
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={closeModel}
          sx={{
            position: "absolute",
            right: "12px",
            top: "0px",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Grid
          container
          // component={"form"}
          // onSubmit={handleSubmit("onSubmitDownPayment ")}
        >
          <Grid
            container
            item
            mt={2}
            sx={{
              ml: 2,
              overflow: "auto",
              width: isFullScreen
                ? "100%"
                : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
              height: isFullScreen ? "75vh" : "auto",
            }}
          >
            <Paper
              sx={{
                width: isFullScreen
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreen ? "75vh" : "50vh",
              }}
            >
              {/* <Box sx={{ flexGrow: 1, overflow: "hidden" }}> */}
              <Paper sx={{ height: "100%", width: "100%" }}>
                <DataGrid
                  className="datagrid-style"
                  // getRowClassName={(params) => {
                  //   console.log("Row ID:", params.id, "SelectedTax:", selectedTax);
                  //   return params.id === selectedTax ? 'selected-row' : '';
                  // }}
                  getRowClassName={(params) => {
                    const selectedLine = oLines[selectedRowIndex]; // get the row being edited
                    if (!selectedLine) return "";
                    return params.row.DocEntry === selectedLine.TaxCode
                      ? "selected-row"
                      : "";
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
                          theme.palette.mode === "dark"
                            ? green[800]
                            : green[200],
                      },
                    }),
                  }}
                  rows={rows}
                  columns={columns}
                  pagination
                  paginationMode="server"
                  getRowId={getRowId}
                  rowCount={rowCount}
                  paginationModel={{ page: taxCurrentPage, pageSize: limit }}
                  onPaginationModelChange={onPaginationModelChange}
                  // checkboxSelection
                  // keepNonExistentRowsSelected
                  onCellClick={(id) => {
                    onCellClick(id);
                  }}
                  loading={isLoading}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 8 } },
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
                  slots={{ toolbar: GridToolbarQuickFilter }}
                  slotProps={{
                    toolbar: {
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  onFilterModelChange={(model) => {
                       const quickFilterValue = (model.quickFilterValues).join(" ") || "";
                    onSearchChange(quickFilterValue);
                  }}
                />
              </Paper>
              {/* </Box> */}
            </Paper>
          </Grid>

          <Grid
            item
            mt={1}
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
              color="success"
              type="submit"
              onClick={onSubmit}
            >
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button> */}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default DataGridCellClickModel;
