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
import ListAltIcon from "@mui/icons-material/ListAlt"
import { useNavigate } from "react-router-dom";
const DataGridModal = ({
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
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
   const navigate = useNavigate();
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
    setTimeout(() => {
      const modalContainer = document.querySelector(".MuiModal-root");
      modalContainer?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleItemRedirect=()=>{
    if(title==="Item List"){
 navigate("/dashboard/Master/item-master", { replace: true })
    }
  }
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
          width: isFullScreen ? "95%" : { xs: "75%", lg: "60%" },
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
   <Box
  sx={{
    display: "flex",
    flexDirection: "row",        // 👈 INLINE
    alignItems: "center",        // 👈 vertical align
    justifyContent: "center",    // 👈 horizontal center
    gap: 1,   
    mt:1                   // 👈 space between icon & text
  }}
>
  <ListAltIcon
    sx={{ cursor: "pointer" }}

     onClick={handleItemRedirect
  }
  />

  <Typography
    sx={{
      fontWeight: "bold",
      textTransform: "uppercase",
    }}
  >
    {title}
  </Typography>
  
        <Divider />
</Box>
  

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
                        (el) => el.ItemCode === params.row.ItemCode
                      )) ||
                    (isService &&
                      (oLines || []).some(
                        (el) => el.ServCode === params.row.ServCode
                      ));
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
                // selectionModel={(oLines || []).map((row) => row.DocEntry)}
                selectionModel={
  oLines?.[0]?.DocEntry ? [oLines[0].DocEntry] : []
}
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
                  const quickFilterValue = (model.quickFilterValues).join(" ") || "";
                  onSearchChange(quickFilterValue);
                }}
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

export default DataGridModal;
