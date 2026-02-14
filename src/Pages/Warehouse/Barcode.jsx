// import React, { useState } from "react";

// import { Box, Grid, IconButton, Typography } from "@mui/material";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import { InputSearchButton } from "../Components/formComponents";

// import { DataGrid } from "@mui/x-data-grid";
// import { useTheme } from "@mui/material/styles";

// export default function Barcode() {
//   //const [phone, setPhone] = useState("");
//   const theme = useTheme();

//   // data grid Table
//   const columns = [
//     {
//       field: "SN",
//       headerName: "SN",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "ITEM CODE",
//       headerName: "ITEM CODE",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "ITEM DESCRIPTION",
//       headerName: "ITEM DESCRIPTION",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "QUANTITY",
//       headerName: "QUANTITY	",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "PRINT",
//       headerName: "PRINT	",
//       width: 200,
//       editable: true,
//     },
//   ];

//   const rows = [
//     { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
//     { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//     { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//     { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
//     { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
//   ];

//   const [drawerOpen, setDrawerOpen] = useState(false);

//   const toggleDrawer = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   // const onHandleSearch = () => {
//   //   alert();
//   // };

//   // const [age, setAge] = React.useState("");

//   // const handleChange = (event) => {
//   //   setAge(event.target.value);
//   // };

//   return (
//     <>
//       <Grid container height="calc(100vh - 110px)">
//         <Grid
//           container
//           item
//           width="100%"
//           height="100%"
//           sm={12}
//           md={12}
//           lg={12}
//           component="form"
//           position="relative"
//         >
//           {/* Hamburger Menu for smaller screens */}

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={toggleDrawer}
//             sx={{
//               display: {
//                 lg: "none",
//               },
//               position: "absolute",
//               left: "10px",
//             }}
//           ></IconButton>

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             sx={{
//               display: {},
//               position: "absolute",
//               right: "10px",
//             }}
//           >
//             <RefreshIcon />
//           </IconButton>

//           <Grid
//             item
//             width={"100%"}
//             py={0.5}
//             alignItems={"center"}
//             border={"1px solid silver"}
//             borderBottom={"none"}
//           >
//             <Typography
//               textAlign={"center"}
//               alignContent={"center"}
//               height={"100%"}
//             >
//               Barcode Print
//             </Typography>
//           </Grid>

//           <Grid
//             container
//             item
//             width={"100%"}
//             height={"100%"}
//             border={"1px silver solid"}
//           >
//             <Grid
//               container
//               item
//               padding={1}
//               md={12}
//               sm={12}
//               height="calc(100% - 40px)"
//               overflow={"scroll"}
//               sx={{ overflowX: "hidden" }}
//               position={"relative"}
//             >
//               <Box
//                 component="form"
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                   width: "100%",
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item sm={6} md={6} lg={2} xs={12} textAlign={"center"}>
//                     <InputSearchButton />
//                   </Grid>
//                 </Grid>
//                 <Grid
//                   container
//                   sx={{
//                     // px: 2,
//                     overflow: "auto",
//                     width: "100%",
//                     //backgroundColor: "#f2f2f2",
//                     height: "80%",
//                   }}
//                 >
//                   {/* Data grid table start */}
//                   <DataGrid
//                     rows={rows}
//                     columns={columns}
//                     initialState={{
//                       pagination: {
//                         paginationModel: {
//                           pageSize: 5,
//                         },
//                       },
//                     }}
//                     sx={{
//                       backgroundColor:
//                         theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//                     }}
//                     pageSizeOptions={[5]}
//                     disableRowSelectionOnClick
//                   />
//                 </Grid>
//               </Box>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PrintIcon from "@mui/icons-material/Print";
import { Divider, Grid, IconButton } from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import ReactToPrint from "react-to-print";

// Internal Components
import {
  AddClearIconButton,
  PageSubTitle,
  TableAmountField,
} from "../component/FormInputs";
import { BarcodeReportToPrint } from "../LayoutReports/BarcodePrintReport";
import Loader from "../component/Loader";

const BarcodePrint = () => {
  // --- State Hooks ---
  const [itemDetails, setItemDetails] = useState([]);
  const [itemsLoadCount, setItemsLoadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [printBarcode, setPrintBarcode] = useState([]);

  // --- Refs ---
  const componentRef = useRef();

  // --- Side Effects (componentDidMount) ---
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
          Quantity: "",
        }));

        setItemDetails(mappedData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // --- Handlers ---
  const handleOnQuantityChange = (event, id) => {
    const newValue = event.target.value;
    setItemDetails((prevItems) =>
      prevItems.map((item) =>
        item.DocEntry === id ? { ...item, Quantity: newValue } : item,
      ),
    );
  };

  const handlePrintAction = (rowData) => {
    setOpen(true);
    setPrintBarcode(rowData);

    // Mimicking your original delay for the print trigger
    setTimeout(() => {
      const printBtn = document.getElementById("hidden-print-trigger");
      if (printBtn) printBtn.click();
      setOpen(false);
    }, 3500);
  };

  const clearFormData = () => {
    // Logic for clearing form if needed
    console.log("Clear form clicked");
  };

  // --- Column Definitions ---
  const columns = [
    { field: "DocEntry", headerName: "SN" },
    { field: "ItemCode", headerName: "ITEM CODE", width: 170 },
    { field: "ItemName", headerName: "ITEM DESCRIPTION", width: 500 },
    {
      field: "Quantity",
      headerName: "QUANTITY",
      renderCell: (params) => (
        <TableAmountField
          id={`qty-${params.id}`}
          value={params.row.Quantity}
          onChange={(event) => handleOnQuantityChange(event, params.id)}
        />
      ),
    },
    {
      field: "Print",
      headerName: "PRINT",
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

  // --- Toolbar Component ---
  const SearchItemTableRecord = () => (
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
      />
    </div>
  );

  return (
    <>
      <Loader open={open} />

      <Grid
        container
        width="100%"
        height="100vh"
        sx={{ border: "1px silver solid" }}
      >
        {/* Header Section */}
        <Grid
          container
          item
          width="100%"
          height="30px"
          className="pageSubTitle-style"
        >
          <Grid item width="90%">
            <PageSubTitle title="Barcode Print" />
            <Divider color="gray" />
          </Grid>
          <Grid item width="10%">
            <AddClearIconButton onClick={clearFormData} />
            <Divider color="gray" />
          </Grid>
        </Grid>

        {/* DataGrid Section */}
        <Grid container item width="100%" height="calc(100% - 35px)">
          <DataGrid
            className="datagrid-style"
            rowHeight={40}
            rows={itemDetails}
            columns={columns}
            getRowId={(row) => row.DocEntry}
            slots={{
              toolbar: SearchItemTableRecord,
            }}
          />
        </Grid>

        {/* Hidden Print Report */}
        <div style={{ display: "none" }}>
          <BarcodeReportToPrint data={printBarcode} ref={componentRef} />
        </div>
      </Grid>
    </>
  );
};

export default BarcodePrint;
