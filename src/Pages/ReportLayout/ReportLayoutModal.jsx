import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  Box,
  Button,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
export default function ReportLayoutModal({
  open,
  onClose,
  apiRows,
  loading,
  fetchReportLayouts,
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  useEffect(() => {
    const hideWarning = () => {
      const warningDiv = document.querySelector(
        'div[style*="color: rgba(130, 130, 130, 0.62)"][style*="position: absolute"]',
      );
      if (
        warningDiv &&
        warningDiv.textContent.includes("MUI X Missing license key")
      ) {
        warningDiv.style.display = "none"; // Just hide it instead of removing
      }
    };

    hideWarning();
    const observer = new MutationObserver(hideWarning);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  //   useEffect(() => {
  //   if (apiRows?.DfLayout) {
  //     setRowSelectionModel([`P-${apiRows.DfLayout}`]);
  //   }
  // }, [apiRows]);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const treeRows = useMemo(() => {
    const rows = [];
  const layoutId = apiRows?.DfLayout ?? apiRows?.DfSequence;

if (layoutId) {
  setRowSelectionModel([`P-${layoutId}`]);
}
    (apiRows.oLines || []).forEach((item) => {
      rows.push({
        id: `P-${item.ReportId}`,
        parentId: null,
        Type: item.Type,
        ReportId: item.ReportId,
        DocCode: item.DocCode,
        DocName: item.DocName,
        TypeCode: item.TypeCode,
        Status: item.Status,
      });

      if (item.Type === "SEQUENCE" && item.oLines?.length) {
        item.oLines.forEach((child) => {
          rows.push({
            id: `C-${child.LineNum}`,
            parentId: `P-${item.ReportId}`,
            Type: "SEQUENCE LINE",
            LineNum: child.LineNum,
            SeqID: child.SeqID,
            DocCode: child.DocCode,
            DocName: child.DocName,
          });
        });
      }
    });

    return rows;
  }, [apiRows]);

  /* =========================
     Columns
  ========================== */
  const columns = [
    { field: "Type", headerName: "Type", width: 200 },
    { field: "DocCode", headerName: "Doc Code", width: 200 },
    { field: "DocName", headerName: "Doc Name", width: 200 },
    // {
    //   field: "SeqID",
    //   headerName: "Sequence",
    //   width: 120,
    //   editable: true,
    // },
  ];

  const handleSubmitReport = async () => {
    const selectedRow = treeRows.find((r) => r.id === rowSelectionModel?.[0]);
    // console.log(selectedRow?.Type[0])
    const obj = {
      DocEntry: String(selectedRow?.ReportId || ""),
      Type: selectedRow?.Type[0] || "",
      TypeCode: selectedRow?.TypeCode || "",
      id: selectedRow?.id || "",
    };
    try {
      const result = await Swal.fire({
        text: `Do you want to set as default "${obj.id}"?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "NO",
        showCancelButton: true,
      });
      if (result.isConfirmed) {
        const response = await apiClient.put(
          `/ReportLeyoutV2/UpdateDefault`,
          obj,
        );
        if (response?.data?.success === true) {
          Swal.fire({
            title: "Success!",
            text: "Default set successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
          fetchReportLayouts();
        } else {
          Swal.fire({
            title: "Error!",
            text: response?.data?.message,
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      } else {
        Swal.fire({
          text: "Not Default set",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong: " + error.message,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: isFullScreen
            ? "70vw"
            : { xs: "50", sm: "70%", md: "70%", lg: "45%" },
          height: isFullScreen ? "80vh" : "70vh",
          bgcolor: "background.paper",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: 24,
          overflow: "hidden",
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#f8f9fa",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Report Layout
            <Typography
              component="span"
              sx={{ ml: 1, fontWeight: 400, color: "text.secondary" }}
            >
              ({apiRows?.TypeCode} - {apiRows?.DocName})
            </Typography>
          </Typography>

          <IconButton onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>

        {/* ================= BODY ================= */}
        <Box
          sx={{
            flex: 1, // ✅ makes grid stretch
            p: 2,
            minHeight: 0, // ✅ VERY IMPORTANT for DataGrid
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: "100%", // fill body
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            }}
          >
            <DataGridPremium
              rows={treeRows}
              columns={columns}
              treeData
              getTreeDataPath={(row) =>
                row.parentId ? [row.parentId, row.id] : [row.id]
              }
              defaultGroupingExpansionDepth={1}
              loading={loading}
              pagination
              pageSizeOptions={[20]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 20 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newSelection) =>
                setRowSelectionModel(newSelection.slice(-1))
              }
              getRowClassName={(params) =>
                params.row.parentId ? "child-row" : ""
              }
              slots={{ toolbar: GridToolbar }} // Enables search & export
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
              sx={{
                border: 0,
                height: "100%", // ✅ grid fills paper
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#f1f3f5",
                  fontWeight: 600,
                },
                "& .MuiDataGrid-row:hover": {
                  bgcolor: "#f9fbff",
                },
                "& .child-row .MuiDataGrid-cellCheckbox": {
                  visibility: "hidden",
                },
              }}
            />
          </Paper>
        </Box>

        {/* ================= FOOTER ================= */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            bgcolor: "#fafafa",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReport}
          >
            SET AS DEFAULT
          </Button>

          <Button variant="outlined" color="error" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
