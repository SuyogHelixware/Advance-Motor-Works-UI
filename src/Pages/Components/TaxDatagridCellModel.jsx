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
import { useEffect, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { green } from "@mui/material/colors";
const TaxDatagridCellModel = ({
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
  oLines,
  rowCount,
  onSearchChange,
  selectedTax,
  apiRef
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };
useEffect(() => {
  if (!open || !rows.length || !apiRef?.current) return;
  const firstRowId = rows[0].DocEntry;  
  const firstField = columns[0].field; 
  requestAnimationFrame(() => {
    apiRef.current.setCellFocus(firstRowId, firstField);
  });
}, [open, rows, columns, apiRef]);
const handleCellKeyDown = (params, event) => {
  const api = apiRef.current;
  if (!api) return;
  if (document.querySelector(".swal2-container")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const { key } = event;
  if (key === "Enter") {
    event.preventDefault();

    onCellClick(params);
    return;
  }

  const NAV_KEYS = [
    "Tab",
    "ArrowRight",
    "ArrowLeft",
    "ArrowDown",
    "ArrowUp",
  ];
  if (!NAV_KEYS.includes(key)) return;

  event.preventDefault();

  const visibleColumns = api.getVisibleColumns();
  const rowIds = api.getSortedRowIds();

  const colIndex = visibleColumns.findIndex(
    (c) => c.field === params.field
  );
  const rowIndex = rowIds.indexOf(params.id);

  let nextRow = rowIndex;
  let nextCol = colIndex;

  // Stop edit mode before navigation
  if (api.getCellMode(params.id, params.field) === "edit") {
    api.stopCellEditMode({ id: params.id, field: params.field });
  }

  switch (key) {
    case "Tab":
      nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
      if (nextCol < 0) {
        nextCol = visibleColumns.length - 1;
        nextRow--;
      }
      if (nextCol >= visibleColumns.length) {
        nextCol = 0;
        nextRow++;
      }
      break;

    case "ArrowDown":
      nextRow++;
      break;

    case "ArrowUp":
      nextRow--;
      break;

    case "ArrowRight":
      nextCol++;
      break;

    case "ArrowLeft":
      nextCol--;
      break;

    default:
      return;
  }

  // ⛔ Boundary check
  if (
    nextRow < 0 ||
    nextRow >= rowIds.length ||
    nextCol < 0 ||
    nextCol >= visibleColumns.length
  ) {
    return;
  }

  const nextId = rowIds[nextRow];
  const nextField = visibleColumns[nextCol].field;

  // Scroll + focus
  api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
  api.setCellFocus(nextId, nextField);

  // Start edit mode if editable
  const nextCellParams = api.getCellParams(nextId, nextField);
  if (nextCellParams.isEditable) {
    setTimeout(() => {
      api.startCellEditMode({ id: nextId, field: nextField });
    });
  }
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
            ? "70%"
            : { xs: "60%", sm: "60%", md: "60%", lg: "60%" },
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
              height: isFullScreen ? "50vh" : "auto",
            }}
              
          >
            <Paper
              sx={{
                width: isFullScreen
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreen ? "50vh" : "50vh",
              }}
            >
              {/* <Box sx={{ flexGrow: 1, overflow: "hidden" }}> */}
              {/* <Paper sx={{ height: 350, width: "100%" }}> */}
                {" "}
                {/* or any height you prefer */}
                <DataGrid
                  className="datagrid-style"
                  apiRef={apiRef}
                     columnHeaderHeight={35}
                            rowHeight={40}
                  getRowClassName={(params) => {
                    const selectedLine = oLines[selectedRowIndex];
                    if (!selectedLine) return "";
                    return params.row.DocEntry === selectedLine.TaxCode
                      ? "selected-row"
                      : "";
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
                          theme.palette.mode === "dark"
                            ? green[800]
                            : green[200],
                      },
                    }),
                  }}
                  rows={rows}
                  columns={columns}
                  getRowId={getRowId}
                  onCellClick={(id) => onCellClick(id)}
                  loading={isLoading}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                    onCellKeyDown={handleCellKeyDown}
                  slots={{ toolbar: GridToolbarQuickFilter }}
                  slotProps={{
                    toolbar: {
                      quickFilterProps: { debounceMs: 500 },
                      
                    },
                  }}
                  onFilterModelChange={(model) => {
                    const quickFilterValue = model.quickFilterValues?.[0] || "";
                   
                    onSearchChange(quickFilterValue);
                  }}
                  hideFooter // 👈 No pagination footer
                />
              {/* </Paper> */}

              {/* </Box> */}
            </Paper>
          </Grid>

          {/* <Grid
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
            <Button
              variant="contained"
              color="success"
              type="submit"
              onClick={onSubmit}
            >
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button>
          </Grid> */}
        </Grid>
      </Box>
    </Modal>
  );
};

export default TaxDatagridCellModel;
