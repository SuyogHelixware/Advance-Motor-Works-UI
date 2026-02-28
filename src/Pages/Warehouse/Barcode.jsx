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
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { Loader } from "../Components/Loader";

export default function Barcode() {
  const [itemDetails, setItemDetails] = useState([]);
  const [open, setOpen] = useState(false);
  const [printBarcode, setPrintBarcode] = useState([]);
  const componentRef = useRef();
  const theme = useTheme();
  const apiRef = useGridApiRef();

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/items/All`,
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        const mappedData = response.data.values.map((item) => ({
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          DocEntry: item.DocEntry,
        }));

        setItemDetails(mappedData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handlePrintAction = (rowData) => {
    setOpen(true);
    setPrintBarcode(rowData);
    setTimeout(() => {
      const printBtn = document.getElementById("hidden-print-trigger");
      if (printBtn) printBtn.click();
      setOpen(false);
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
      headerName: "SN",
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
    <div className="col-3" style={{ padding: "10px" }}>
      <GridToolbarQuickFilter
        variant="outlined"
        size="small"
        quickFilterParser={(searchInput) =>
          searchInput
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== "")
        }
        onChange={(e) => {
          apiRef.current.setQuickFilterValues([e.target.value]);
        }}
      />
    </div>
  );
  return (
    <>
      <Loader open={open} />

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
                overflow: "auto",
                width: "100%",
                height: 800,
                padding: 3,
              }}
            >
              <DataGrid
                className="datagrid-style"
                rowHeight={40}
                rows={itemDetails}
                apiRef={apiRef}
                columns={columns}
                getRowId={(row) => row.DocEntry}
                // slots={{
                //   toolbar: SearchItemTableRecord,
                // }}
                slots={{
                  toolbar: () => <SearchItemTableRecord apiRef={apiRef} />,
                }}
                autoHeight="false"
                sx={gridSx}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
