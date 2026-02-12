import { useCallback, useRef, useState, useEffect } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
export default function PrintMenu({ disabled,type, DocEntry, PrintData }) {
  const previewCache = useRef({});
  const [anchorEl, setAnchorEl] = useState(null);
  useEffect(() => {
    previewCache.current = {};
    console.log("Print cache cleared due to new data");
  }, [PrintData,type, DocEntry]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handlePreview = async (DoctypeP) => {
    try {
      const cacheKey = `${DocEntry}_${type}`;
      // Open from cache if exists
      if (previewCache.current[cacheKey]) {
        window.open(previewCache.current[cacheKey], "_blank");
        handleClose();
        return;
      }
      // Find report info
      const reportRow = PrintData.find((row) => row.DocType === type);
      if (!reportRow) {
        Swal.fire({ text: `Report not found for ${DoctypeP}`, icon: "warning" });
        return;
      }
      const ReportId = reportRow.LineNum;
      // Fetch report as blob
        Swal.fire({
         title: "Preparing Download",
       text: "We are generating your report. This may take a few seconds.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      
      const { request } = await apiClient.get(
        `/ReportLayout/GetReport?ReportId=${ReportId}&TransDocEntry=${DocEntry}&ReportFormat=${DoctypeP}`,
        { responseType: "blob" }
      );
      // Create blob URL and cache it
      const blobURL = URL.createObjectURL(request.response);
      previewCache.current[cacheKey] = blobURL;
      // Open in new tab
      // req.responseURL
      window.open(blobURL, "_blank");
       Swal.close();
    } catch (error) {
      console.error(error);
      Swal.fire({ text: "Something went wrong", icon: "error",    confirmButtonText: "YES", });
    }
     
    handleClose();
  };

  return (
    <>
      <Button variant="contained" color="info" disabled={disabled} onClick={handleOpen}>
        PRINT
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: "2px", borderRadius: "8px" } }}
      >
        <MenuItem onClick={() => handlePreview("PDF")}>
          <ListItemIcon><PictureAsPdfIcon sx={{ color: "red" }} /></ListItemIcon>
          <ListItemText primary="PDF" />
        </MenuItem>

        <MenuItem onClick={() => handlePreview("EXCEL")}>
          <ListItemIcon><GridOnIcon sx={{ color: "green" }} /></ListItemIcon>
          <ListItemText primary="Excel" />
        </MenuItem>
      </Menu>
    </>
  );
}
