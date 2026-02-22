export const dataGridSx = (theme) => ({
  // ========== HEADER ==========
  "& .MuiDataGrid-columnHeaders": {
    // backgroundColor:
    //   theme.palette.custome?.datagridcolor ||
    //   theme.palette.grey[10],
    // minHeight: "45px !important",
    // maxHeight: "45px !important",
    // lineHeight: "50px !important",
    borderBottom: "2px solid",
    borderColor: theme.palette.divider,
  },

  "& .MuiDataGrid-columnHeader": {
    padding: "0 8px",
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    "&:focus, &:focus-within": {
      outline: "none",
    },
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
  },
  "& .disabled-cell": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[900],
    color: theme.palette.text.disabled,
    cursor: "not-allowed",
  },
    "& .disabled-row .MuiDataGrid-cell[data-field='taxCategory']":
                                {
                                  pointerEvents: "auto", 
                                  backgroundColor:
                                    theme.palette.mode === "light"
                                      ? "#F5F6FA"
                                      : "#101840",
                                },
                                   /* ===== Readonly row (NO blur) ===== */
  "& .readOnly-row": {
    pointerEvents: "none",          // prevent editing
    opacity: 1,                     // 🔑 keep normal look
    filter: "none",
  },

  "& .readOnly-row .MuiDataGrid-cell[data-field='taxCategory']": {
    pointerEvents: "auto",          // allow interaction
    opacity: 1,
    filter: "none",
    backgroundColor:
      theme.palette.mode === "light"
        ? "#F5F6FA"
        : "#dcdde3",
  },
  "& .MuiDataGrid-columnSeparator": {
    visibility: "visible",
    color: theme.palette.divider,
  },

  // ========== CELL ==========
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid",
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    "&:focus, &:focus-within": {
      outline: "2px solid",
      outlineColor: theme.palette.primary.main,
      outlineOffset: "-2px",
    },
  },

  // ========== ROW ==========
  "& .MuiDataGrid-row:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(0,0,0,0.04)"
        : "rgba(255,255,255,0.08)",
  },

  "& .MuiDataGrid-row:nth-of-type(even)": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(0,0,0,0.02)"
        : "rgba(255,255,255,0.02)",
  },

  // ========== FOOTER ==========
  "& .MuiDataGrid-footerContainer": {
    borderTop: "2px solid",
    borderColor: theme.palette.divider,
    minHeight: "62px",
  },
  // "& .error-row": {
  //   backgroundColor: "rgba(255, 0, 0, 0.08)",
  // },
  // "& .error-row:hover": {
  //   backgroundColor: "rgba(255, 0, 0, 0.15)",
  // },
  // ========== OUTER ==========
  border: "1px solid",
  borderColor: theme.palette.divider,
  borderRadius: "4px",
  overflow: "hidden",
});
