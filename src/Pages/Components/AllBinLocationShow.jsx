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
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import {
  InputSelectTextField,
  InputTextField
} from "./formComponents";
import { TwoFormatter } from "./ValueFormatter";
const AllBinLocationShow = ({
  open,
  closeModel,
  onSubmit,
  getRowId,
  title,
  DocNum,
  data = {},
  SaveUpdateName,
}) => {
  const theme = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [BinLocationList, setBinLocationList] = useState([]);
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const BinColumn = [
    {
      field: "BinCode",
      headerName: "BINLOCATION",
      width: 400,
      align: "center", 
      headerAlign: "center",
      editable: false,
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 200,
      align: "center", 
      headerAlign: "center",
      editable: false,
   valueFormatter: (value, row) =>
        ` ${TwoFormatter(Number(row.OnHand / data.NumPerMsr ?? ""))}`,
  
    },
    {
      field: "Available",
      headerName: "AVAILABLE",
      width: 200,
      align: "center", 
      headerAlign: "center",
      editable: false,
        renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
      //  valueFormatter: (value, row) =>
      //   ` ${(Number(row.Available - row.allocated))}`,

    },
    {
      field: "allocated",
      headerName: "ALLOCATED",
      width: 200,
      align: "center", 
      headerAlign: "center",
      Sort:false,
      editable: true,
        renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    
    },
    // {
    //   field: "ACTION",
    //   headerName: "ACTION",
    //   width: 100,
    //   sortable: false,
    //   renderCell: (params) => {
    //     return (
    //       <IconButton
    //         color="error"
    //         disabled={params.row.BaseTyp}
    //         onClick={() => handleDeleteBin(params.row.DocEntry)}
    //       >
    //         <DeleteIcon />
    //       </IconButton>
    //     );
    //   },
    // },
  ];
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };

  console.log("data ===== ",data)
  const { control, setValue, handleSubmit, getValues, watch } = useForm({
    defaultValues: {
      DocNum: "",
      Lineno: "",
      WHSCode: "",
      ItemCode: "",
      Quantity: "",
      totalalewd: "",
      Riming: "",
      BinType: "",
    },
  });
  
  const onSubmitBinLoc = (data) => {
    console.log("Child submitting bins:", BinLocationList);
        if (getValues("Riming")!== 0 ) {
          Swal.fire({
            text: "You can’t continue because the remaining quantity is not zero",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
          return;
        }

         const invalidRow = BinLocationList.find(
    (row) =>
      Number(row.allocated) > Number(row.OnHand)
  );

  if (invalidRow) {
    Swal.fire({
      icon: "error",
      title: "Invalid Allocation",
      text: `Allocated quantity cannot be greater than in-stock quantity "${invalidRow.BinCode}".`,
      confirmButtonText: "OK",
    });
    return;
  }
    const updatedQty = BinLocationList.filter(
      (item) => Number(item.allocated) > 0
    );



    onSubmit(updatedQty);
       Swal.fire({
                        toast: true,
                        position: "center",
                        icon: "success",
                        title: "Quantity successfully allocated to bin location.",
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true,
                      });
    setValue("BinType", "");
                      
  };
  setValue("DocNum", DocNum);
  setValue("Lineno", data.id + 1);
  setValue("WHSCode", data.WHSCode || data.ToWHSCode);
  setValue("ItemCode", data.ItemCode);
  setValue("Quantity", data.Quantity);

const binType = watch("BinType"); // watch BinType field
useEffect(() => {
  if (binType === "1") {
    const remaining = parseFloat(getValues("Riming")) || 0;

    setBinLocationList((prevRows) =>
      prevRows.map((row, index) => {
        if (index === 0) {
          const prevAllocated = parseFloat(row.allocated) || 0;
          // const onHand = parseFloat(row.OnHand) || 0;
             const onHand=TwoFormatter(Number(row.OnHand / data.NumPerMsr ?? ""))
          const newAllocated = prevAllocated + remaining;
          return {
            ...row,
            allocated: newAllocated,
            Available: onHand - newAllocated,
          };
        }
        return row;
      })
    );
  }
}, [binType]);
  // remove data dependency

 setValue(
    "totalalewd",
    BinLocationList.reduce((sum, row) => sum + (Number(row.allocated) || 0), 0)
  );
  setValue("Riming", data.Quantity - getValues("totalalewd"));

  // const handleChangeBin = (newRow, oldRow) => {
  //   setValue("BinType", "");
  //   const maxQty = parseFloat(getValues("Quantity")) || 0;
  //     const onHand = Number(newRow.OnHand) || 0;
  //   let updatedQuantity = Number(newRow.allocated) || 0;

  //   if (updatedQuantity < 0) updatedQuantity = 0;
  //   if (updatedQuantity > maxQty) updatedQuantity = maxQty;
  //   if (updatedQuantity > onHand) updatedQuantity = 0;

  //   const updatedRow = {
  //     ...oldRow,
  //     ...newRow,
  //     allocated: updatedQuantity,
  //     Available:newRow.OnHand-updatedQuantity
  //   };
  //   setBinLocationList((prevRows) =>
  //     prevRows.map((row) =>
  //       row.DocEntry === updatedRow.DocEntry ? updatedRow : row
  //     )
  //   );
  //   return updatedRow;
  // };

 const handleChangeBin = (newRow, oldRow) => {
  setValue("BinType", "");

  const maxQty = parseFloat(getValues("Quantity")) || 0;
  const onHand = TwoFormatter(Number(newRow.OnHand / data.NumPerMsr ?? ""))

  let allocated = parseFloat(newRow.allocated) || 0;

  if (allocated < 0) allocated = 0;
  if (allocated > maxQty) allocated = maxQty;
  if (allocated > onHand) allocated = onHand;

  const updatedRow = {
    ...oldRow,
    ...newRow,
    allocated,
    Available: onHand - allocated,
  };

  setBinLocationList((prevRows) =>
    prevRows.map((row) =>
      row.DocEntry === updatedRow.DocEntry ? updatedRow : row
    )
  );

  return updatedRow;
};


  const fetchBinLocation = useCallback(async (page = 0, search = "") => {
    setIsLoading(true);
    try {
      const { data: binData } = await apiClient.get(`/BinLocationV2/GetByWHSCode/`, {
        params: {
          ItemCode: getValues("ItemCode"),
          WHSCode: getValues("WHSCode"),
          OnHand: 0,
          Status: 1,
          SearchText: search,
          Page: page,
          Limit: LIMIT,
        },
      });

      if (binData.success) {
        
          const items = binData.values || [];
          const updatedList = items.map((item) => {
          const matched = (data.oDocBinLocationLines || []).find(
            (binItem) => Number(binItem.BinAbs) === Number(item.DocEntry)
          );
            const allocated = matched
    ? Number(matched.Quantity) || 0
    : 0;

    const onHand=TwoFormatter(Number(item.OnHand / data.NumPerMsr ?? ""))
  // const onHand = Number(item.OnHand) || 0; 
  return {
            ...item,
            allocated,
    DocEntry: matched ? matched.BinAbs ?? item.DocEntry : item.DocEntry,
    Available: onHand - allocated,
          }
        
        });
        setBinLocationList(updatedList);
        const estimatedRowCount =
          page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
        setRowCount(estimatedRowCount);
      } else {
        Swal.fire("Error!", data.message, "warning");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [data]);

    const closeModelBin=()=>{
     setValue("BinType","")
 
    closeModel()
  }
  useEffect(() => {
    if (!open) return; // exit early if modal not open
        // fetchBinLocation(currentPage, searchText);

    // if (SaveUpdateName === "UPDATE") {
    //   setIsLoading(false);
    //   // Case 1: Update existing bin locations
    //   const updatedList = (data?.oDocBinLocationLines ?? []).map((item) => ({
    //     ...item,
    //     allocated: item?.Quantity ?? "0",
    //     DocEntry: item?.BinAbs ?? item?.DocEntry ?? "",
    //   }));

    //   setBinLocationList(updatedList);
    // }
    //  else {
  //     if (
  //       Array.isArray(data?.oDocBinLocationLines) &&
  //       data.oDocBinLocationLines.length > 0
  //     ) {
  //       const updatedList = BinLocationList.map((item) => {
  //         const matched = data.oDocBinLocationLines.find(
  //           (binItem) => Number(binItem.BinAbs) === Number(item.DocEntry)
  //         );
  // return {
  //           ...item,
  //           allocated: matched ? matched.Quantity ?? "0" : "0",
  //           DocEntry: matched ? matched.BinAbs ?? item.DocEntry : item.DocEntry,
  //         }
        
  //       });
  //       setBinLocationList(updatedList);
  //     }
      //  else {
        fetchBinLocation(currentPage, searchText);
      // }
    // }
  }, [open, currentPage, searchText, fetchBinLocation, SaveUpdateName]);

  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage]
  );
  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to page 0 on search
  }, []);

  // const handleDeleteBin = (id) => {
  //   const updated = BinLocationList.filter((row) => row.DocEntry !== id); // filter out the row with matching id
  //   setBinLocationList(updated);
  // };
  const ClearAllocation = () => {
    const ClearRows = BinLocationList.map((allocated) => ({
      ...allocated,
      allocated: "0",
      Available:TwoFormatter(Number(allocated.OnHand / data.NumPerMsr ?? ""))
    }));
     setValue("BinType","")
    
    setBinLocationList(ClearRows);
  };
    const instock= BinLocationList.reduce(
                      (sum, row) => sum + (Number(row.OnHand / data.NumPerMsr ?? "") || 0),
                      0
                    )

                    let Availeble=BinLocationList.reduce(
                      (sum, row) => sum + (Number(row.Available) || 0),
                      0
                    )
  return (
    <>
      <Modal
        open={open}
        onClose={closeModelBin}
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
              ? "95%"
              : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
          component={"form"}
          onSubmit={handleSubmit(onSubmitBinLoc)}
        >
          <IconButton
            onClick={toggleModalSize}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
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

          <Grid container gap={1} mt={1} >
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="DocNum"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="DOCUMENT NO"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="Lineno"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ROW NO"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="WHSCode"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="WAREHOUSE CODE"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="ItemCode"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ITEM CODE"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="Quantity"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="QUANTITY"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="totalalewd"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="ALLOCATED QUANTITY"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
              <Controller
                name="Riming"
                rules={{ required: "this field is required" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="REMAINING"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                  />
                )}
              />
            </Grid>

            <Grid
              container
              item
              mt={1}
              sx={{
                px: 6,
                overflow: "auto",
                overflowY:"hidden",
                width: isFullScreen
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreen ? "60vh" : "auto",
              }}
            >
              <Paper
                sx={{
                  width: "100%",
                  height: isFullScreen ? "60vh" : "50vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <DataGrid
                            className="datagrid-style"

                  columnHeaderHeight={35}
                  rowHeight={45}
                  rows={BinLocationList}
                  columns={BinColumn}
                  getRowId={(row) => row.DocEntry}
                    editMode="cell"
                    processRowUpdate={handleChangeBin}
             onProcessRowUpdateError={(error) => console.error(error)}
                  rowCount={rowCount}
                  paginationModel={{ page: currentPage, pageSize: LIMIT }}
                  onPaginationModelChange={handlePaginationModelChange}
                  keepNonExistentRowsSelected
                  disableRowSelectionOnClick
                  // onRowSelectionModelChange={(ids) => handleSelectBin(ids)}
                  paginationMode="server" // This tells DataGrid you're handling pagination server-side
                  pageSizeOptions={[LIMIT]}
                  loading={isLoading}
                  initialState={{
                    pagination: { paginationModel: { pageSize: LIMIT } },
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
                  hideFooter={false}
                  // slots={{ toolbar: GridToolbarQuickFilter }}
                    slots={{
    toolbar: GridToolbarQuickFilter,
    noResultsOverlay: () => (
      <Grid
        style={{
          padding: "100px",
          color: "#555",
          fontSize: "16px",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        🛈 Stock Not Found
      </Grid>
    ),
    noRowsOverlay: () => (
      <Grid
        style={{
          padding: "100px",
          color: "#555",
          fontSize: "16px",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        🗂️ No Data Available
      </Grid>
    ),
  }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  onFilterModelChange={(model) => {
                    const quickFilterValue = model.quickFilterValues?.[0] || "";
                    handleSearchChange(quickFilterValue);
                  }}
                  getRowClassName={(params) =>
                    params.row.Status === "0" || params.row.Status === "3"
                      ? "disabled-row"
                      : ""
                  }
                  
                  // sx={{
                  //   flex: 1,
                  //   backgroundColor:
                  //     theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  //   "& .MuiDataGrid-cell": { border: "none" },
                  //   "& .MuiDataGrid-cell:focus": { outline: "none" },
                  //   "& .disabled-row .MuiDataGrid-cell": {
                  //     backgroundColor:
                  //       theme.palette.mode === "light"
                  //         ? "#f0f0f0 !important"
                  //         : "#080D2B",
                  //     opacity: 0.6,
                  //     pointerEvents: "none",
                  //   },
                    
                  //   // "& .MuiDataGrid-cell[data-field='allocated']": {
                  //   //   backgroundColor: "#E3F2FD",
                  //   //   fontWeight: 600,
                  //   //   color: "#0D47A1",
                  //   //   textAlign: "center",
                  //   // },
                  //   "& .MuiDataGrid-columnHeaders [data-field='allocated']": {
                  //     textAlign: "center",
                  //   },
                  //   "& .MuiDataGrid-cell[data-field='BinCode'], & .MuiDataGrid-cell[data-field='OnHand'],& .MuiDataGrid-cell[data-field='Available']":
                  //     {
                  //       backgroundColor: "#d0f0c0",
                  //       fontWeight: 500,
                  //       color: "#06470c",
                  //       textAlign: "center",
                  //     },
                  //   "& .MuiDataGrid-columnHeaders [data-field='BinCode'],& .MuiDataGrid-columnHeaders [data-field='OnHand'],& .MuiDataGrid-columnHeaders [data-field='Available']":
                  //     {
                  //       textAlign: "center",
                  //     },
                  // }}
                />

                {/* ✅ Total Allocated under allocated column */}
                <Box
                  sx={{
                    display: "flex",
                    borderTop: "1px solid #ddd",
                    backgroundColor:
                      theme.palette.mode === "light" ? "#fff" : "#0A1238",
                    height: "45px", // same as rowHeight for alignment
                  }}
                >
                  {/* Empty space to align with first column (checkbox) */}
                  <Box sx={{ width: BinColumn[0].width, ml: 3 }} />

                  <Box
                    sx={{
                      width: BinColumn[1].width, // adjust to OnHand column index

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      backgroundColor: "#d0f0c0",
                      color: "#06470c",
                    }}
                  >
                    Total In Stock:{" "}
                    {
                
                    TwoFormatter(instock)
                    }
                  </Box>

                  {/* Total Availeble cell */}
                  <Box
                    sx={{
                      width: BinColumn[2].width, // adjust to availeble column index
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      backgroundColor: "#d0f0c0",
                      color: "#06470c",
                    }}
                  >
                    Total Available:{" "}
                    {TwoFormatter(Availeble)}
                  </Box>
                  <Box
                    sx={{
                      width: BinColumn[3].width, // adjust according to allocated column index
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      backgroundColor: "#E3F2FD",
                      color: "#0D47A1",
                    }}
                  >
                    Total Allocated:{" "}
                    {BinLocationList.reduce(
                      (sum, row) => sum + (Number(row.allocated) || 0),
                      0
                    )}
                  </Box>
                  {/* Empty space for action column */}
                  <Box sx={{ flex: 1 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid mt={1} item xs={12} textAlign={"center"}>
              <Controller
                name="BinType"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputSelectTextField
                    label="AUTOMATIC ALLOCATION"
                    data={[{ key: "1", value: "REMAINING" }]}
                    {...field}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                    disabled={SaveUpdateName === "UPDATE"}

                  />
                )}
              />

              <Button
                sx={{ mt: 1 }}
                variant="contained"
                onClick={ClearAllocation}
              disabled={SaveUpdateName === "UPDATE"}

              >
                CLEAR ALLOCATION
              </Button>
            </Grid>
          </Grid>

          <Grid
            item
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // py: 1,
              px: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              color="success"
              type="submit"
              disabled={SaveUpdateName==="UPDATE"}
            >
              Save
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={closeModel}
            >
              Close
            </Button>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(AllBinLocationShow);
