import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Box,
  Grid,
  Button,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { green } from "@mui/material/colors";
import {
  DataGridPremium,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from "@mui/x-data-grid-premium";
const GroupDataGrid = ({
  open,
  limit,
  columns,
  getRowId,
  title,
  invoiceData,
  rows,
  currentPage,
  closeModel,
  isLoading,
  onSubmit,
  rowCount,
  onSearchChange,
  groupingField, // 👈 ADD THIS
}) => {
  const theme = useTheme();
  const [modalSize, setModalSize] = useState({
    width: "60vw",
    height: "60vh",
  });
  const apiRef = useGridApiRef();

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const modalRef = useRef(null);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const dx = e.clientX - initialMousePos.current.x;
      const dy = e.clientY - initialMousePos.current.y;

      let newWidth = initialSize.current.width;
      let newHeight = initialSize.current.height;

      // Calculate new size based on resize direction
      switch (resizeDirection) {
        case "right":
          newWidth = Math.max(
            300,
            Math.min(initialSize.current.width + dx, window.innerWidth * 0.95)
          );
          break;
        case "bottom":
          newHeight = Math.max(
            300,
            Math.min(initialSize.current.height + dy, window.innerHeight * 0.95)
          );
          break;
        case "bottomRight":
          newWidth = Math.max(
            300,
            Math.min(initialSize.current.width + dx, window.innerWidth * 0.95)
          );
          newHeight = Math.max(
            300,
            Math.min(initialSize.current.height + dy, window.innerHeight * 0.95)
          );
          break;
        case "left":
          newWidth = Math.max(
            300,
            Math.min(initialSize.current.width - dx, window.innerWidth * 0.95)
          );
          break;
        case "top":
          newHeight = Math.max(
            300,
            Math.min(initialSize.current.height - dy, window.innerHeight * 0.95)
          );
          break;
      }

      setModalSize({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    // Add event listeners when resizing
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeDirection]);

  const handleResizeStart = (direction, e) => {
    e.preventDefault();
    const modalRect = modalRef.current.getBoundingClientRect();

    initialMousePos.current = {
      x: e.clientX,
      y: e.clientY,
    };
    initialSize.current = {
      width: modalRect.width,
      height: modalRect.height,
    };

    setIsResizing(true);
    setResizeDirection(direction);
  };

  useEffect(() => {
    const hideWarning = () => {
      const warningDiv = document.querySelector(
        'div[style*="color: rgba(130, 130, 130, 0.62)"][style*="position: absolute"]'
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
  // Resize handles
  const ResizeHandle = ({ direction, style }) => (
    <div
      onMouseDown={(e) => handleResizeStart(direction, e)}
      style={{
        position: "absolute",
        ...style,
        cursor:
          direction === "right" || direction === "left"
            ? "ew-resize"
            : direction === "top" || direction === "bottom"
            ? "ns-resize"
            : "nwse-resize",
        zIndex: 1000,
        backgroundColor: "transparent",
      }}
    />
  );

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
        ref={modalRef}
        sx={{
          width: modalSize.width,
          height: modalSize.height,
          overflowY: "auto",
          padding: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Resize handles */}
        <ResizeHandle
          direction="top"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
          }}
        />
        <ResizeHandle
          direction="bottom"
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
          }}
        />
        <ResizeHandle
          direction="left"
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            width: "10px",
          }}
        />
        <ResizeHandle
          direction="right"
          style={{
            right: 0,
            top: 0,
            bottom: 0,
            width: "10px",
          }}
        />
        <ResizeHandle
          direction="bottomRight"
          style={{
            right: 0,
            bottom: 0,
            width: "15px",
            height: "15px",
          }}
        />

        {/* Modal Content Structure */}
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              width: "100%",
              padding: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              // mb: 1,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              align="center"
              sx={{ textAlign: "center" }}
            >
              {title}
            </Typography>
          </Box>

          {/* DataGrid Body */}
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            {/* <Paper sx={{ height: "100%", width: "100%" }}> */}
               <DataGridPremium
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          loading={false}
          disableRowSelectionOnClick
          groupingColDef={{
            headerName: 'Grouped By DocEntry',
          }}
          checkboxSelection
          getRowId={(row) => row.id} // Use DocEntry for row key
          initialState={{
            rowGrouping: {
              model: ['id', ],
            },
          }}
  
          // getTreeData={(row) => row.parentId === invoiceData.DocEntry} // Group lines under the document
          rowGroupingColumnMode="multiple" 
          isGroup={ (row) => row.group === invoiceData.DocEntry }
          slots={{ toolbar: GridToolbar }}
        />
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 4,
              mt: 2,
              pt: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
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
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default GroupDataGrid;
