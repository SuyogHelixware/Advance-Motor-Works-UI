import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

const DatagridComponent = ({
  rows = [],
  columns = [],
  pageSize = 3,
  rowHeight = 45,
  headerHeight = 35,
  hideFooter = true,
  sx = {},
}) => {
  const theme = useTheme();

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowHeight={rowHeight}
      columnHeaderHeight={headerHeight}
      hideFooter={hideFooter}
      disableRowSelectionOnClick
      pageSizeOptions={[pageSize]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: pageSize,
          },
        },
      }}
      className="datagrid-style"
      sx={{
        backgroundColor:
          theme.palette.mode === "light" ? "#fff" : "#373842",
        "& .MuiDataGrid-cell": {
          border: "none",
        },
        "& .MuiDataGrid-cell:focus": {
          outline: "none",
        },
        ...sx,
      }}
    />
  );
};

export default DatagridComponent;
