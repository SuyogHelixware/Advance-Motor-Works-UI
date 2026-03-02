import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import PrintIcon from "@mui/icons-material/Print";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { Loader } from "../Components/Loader";

export default function Barcode() {
  const [itemDetails, setItemDetails] = useState([]);
  const [printBarcode, setPrintBarcode] = useState([]);
  const componentRef = useRef();
  const theme = useTheme();
  const apiRef = useGridApiRef();
  const [loading, setLoading] = useState(false);

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/DynamicSearch/all`, {
          headers: { "Content-Type": "application/json" },
        });

        const mappedData = response.data.values.map((item) => ({
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          DocEntry: item.DocEntry,
        }));

        setItemDetails(mappedData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handlePrintAction = (rowData) => {
    setPrintBarcode(rowData);
    setTimeout(() => {
      const printBtn = document.getElementById("hidden-print-trigger");
      if (printBtn) printBtn.click();
    }, 3500);
  };

  const clearFormData = () => {
    if (apiRef.current) {
      apiRef.current.setQuickFilterValues([]);
    }
  };

  const columns = [
    {
      field: "DocEntry",
      headerName: "SR NO",
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    { field: "ItemCode", headerName: "ITEM CODE", width: 200 },
    { field: "ItemName", headerName: "ITEM DESCRIPTION", width: 1200 },
    {
      field: "Print",
      headerName: "PRINT",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handlePrintAction(params.row)}
            size="small"
            color="info"
          >
            <PrintIcon />
          </IconButton>

          <ReactToPrint
            trigger={() => (
              <IconButton
                size="small"
                color="info"
                style={{ display: "none" }}
                id="hidden-print-trigger"
              >
                <PrintIcon />
              </IconButton>
            )}
            content={() => componentRef.current}
          />
        </>
      ),
    },
  ];

  const SearchItemTableRecord = ({ apiRef }) => (
    <div
      style={{
        padding: "10px",
        position: "sticky",
        top: 0,
        zIndex: 2,
        borderBottom: "1px solid #ccc"
      }}
    >
      <GridToolbarQuickFilter
        variant="outlined"
        size="small"
        onChange={(e) => {
          apiRef.current.setQuickFilterValues([e.target.value]);
        }}
      />
    </div>
  );

  return (
    <>
      <Loader open={loading} />

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              display: {
                lg: "none",
              },
              position: "absolute",
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearFormData}
            sx={{
              display: {},
              position: "absolute",
              right: "10px",
            }}
          >
            <AddIcon />
          </IconButton>

          <Grid
            item
            width={"100%"}
            py={0.5}
            alignItems={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              Barcode Print
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
          >
            <Grid
              container
              component={Paper}
              item
              sx={{
                width: "100%",
                height: "100%",
                padding: 3,
              }}
            >
              <DataGrid
                className="datagrid-style"
                rows={itemDetails}
                columns={columns}
                apiRef={apiRef}
                getRowId={(row) => row.DocEntry}
                slots={{
                  toolbar: () => <SearchItemTableRecord apiRef={apiRef} />,
                }}
                sx={{
                  ...gridSx,
                  height: "100%",
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
