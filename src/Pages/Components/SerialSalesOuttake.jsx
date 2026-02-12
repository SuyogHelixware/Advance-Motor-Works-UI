import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { deepPurple, green } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { InputTextField } from "./formComponents";

const SerialSalesOuttake = ({
  Title,
  openserialmodal,
  DialogClosePayto,
  ItemCode,
  Quantity,
  ItemName,
  WHSCode,
  onSubmit,
}) => {
  const { control, handleSubmit,getValues, setValue } = useForm();
  const handleFormSubmit = (data) => {
    onSubmit(data);
    DialogClosePayto();
  };
  const theme = useTheme();

  const [GetListSriealData, setGetListSriealData] = useState([]);
  const [CountLimit, setCountLimit] = useState(0);
  const [cachedPages, setCachedPages] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const prevCountLimit = useRef(0);
  const [searchText, setSearchText] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [paginationModelSecond, setPaginationModelSecond] = useState({
    page: 0,
    pageSize: 20,
  });
  const [rows2, setRows2] = useState([]);
  const [selectedRows1, setSelectedRows1] = useState([]);
  const [selectedRows2, setSelectedRows2] = useState([]);
  const columns = [{ field: "IntrSerial", headerName: "SERIAL NAME", flex: 1 }];
  const columns2 = [
    { field: "IntrSerial", headerName: "SERIAL NAME", flex: 1 },
  ];

  function QuickFilterToolbar() {
    return (
      <Box
        sx={{
          p: 1,
          pb: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <GridToolbarQuickFilter quickFilterProps={{ debounceMs: 500 }} />
      </Box>
    );
  }

//   const handleSelectSeries = (ids) => {
//   const selectedIdsSet = new Set(ids);

//   // Filter selected items
//   const selectedItems = GetListSriealData.filter((series) =>
//     selectedIdsSet.has(String(series.LineNum))
//   );

//   // Move selected to second grid (avoid duplicates)
//   setRows2((prev) => {
//     const existingIds = new Set(prev.map((r) => r.LineNum));
//     const newRows = selectedItems.filter(
//       (r) => !existingIds.has(r.LineNum)
//     );
//     return [...prev, ...newRows];
//   });

//   // Remove moved rows from first grid
//   const remainingRows = GetListSriealData.filter(
//     (r) => !selectedIdsSet.has(String(r.LineNum))
//   );
//   setGetListSriealData(remainingRows);

//   // Clear checkboxes
//   setSelectedRows([]);
// };

  const handleSelectSeries = (ids) => {

    const selectedIdsSet = new Set(ids);
    console.log("selectedIdsSet", selectedIdsSet);
    const selectedItems = GetListSriealData.filter((series) =>
      selectedIdsSet.has(String(series.LineNum))
    );
    setSelectedRows((prev) => {
      const existingItemCodes = new Set(prev.map((p) => p.LineNum));
      const newUniqueRows = selectedItems.filter(
        (row) => !existingItemCodes.has(row.LineNum)
      );
      return [...prev, ...newUniqueRows];
    });
  };
  
  console.log("====sroef", selectedRows.length === 0);
  const handleAddSelected = () => {
 const allowedQty = Number(Quantity ?? 0);
const currentCount = selectedRows.length;
if (currentCount > allowedQty) {
  Swal.fire({
    icon: "warning",
    text: `You can only add ${allowedQty} item(s). Remove some before adding new ones.`,
  });

  // Keep only the first "allowedQty" items
  // setRows2(selectedRows.slice(0, allowedQty));
  return;
}
setRows2(selectedRows);
// setSelectedRows([])
    //    const currentCount = rows2.length;
    // const remainingSlots = Number(Quantity ?? 0) - currentCount;
    // setValue("")
    // if (!selectedRows1 || selectedRows1.length === 0) return;
    // const selectedIdsSet = new Set(selectedRows1.map(String));
    // const selectedItems = GetListSriealData.filter((series) =>
    //   selectedIdsSet.has(String(series.LineNum))
    // );

    // const existingIds2 = new Set(rows2.map((r) => String(r.LineNum)));
    // const toAddNonDuplicates = selectedItems.filter(
    //   (i) => !existingIds2.has(String(i.LineNum))
    // );
    // if (toAddNonDuplicates.length === 0) {
    //   Swal.fire({ icon: "info", text: "Selected item(s) already added." });
    //   setSelectedRows1([]);
    //   return;
    // }


    // setSelectedRows1([]);
  };
  const handleRemoveSelected = () => {
    if (!selectedRows2 || selectedRows2.length === 0) return;

    const selectedIdsSet = new Set(selectedRows2.map(String));
    const selectedItems = rows2.filter((row) =>
      selectedIdsSet.has(String(row.LineNum))
    );
    const newRows2 = rows2.filter(
      (row) => !selectedIdsSet.has(String(row.LineNum))
    );

    // Add them back to first grid (avoid duplicates)
    const existingIds1 = new Set(
      GetListSriealData.map((r) => String(r.LineNum))
    );
    const toReturn = selectedItems.filter(
      (i) => !existingIds1.has(String(i.LineNum))
    );

    const newRows1 = [...GetListSriealData, ...toReturn];

    setRows2(newRows2);
    setGetListSriealData(newRows1);

//  setSelectedRows([])

    setSelectedRows2([]);
  };
//   const handleRemoveSelected = () => {
//   if (!selectedRows2 || selectedRows2.length === 0) return;

//   const selectedIdsSet = new Set(selectedRows2.map(String));

//   // Items to remove from second grid
//   const removedItems = rows2.filter((row) =>
//     selectedIdsSet.has(String(row.LineNum))
//   );

//   // Keep others in second grid
//   const newRows2 = rows2.filter(
//     (row) => !selectedIdsSet.has(String(row.LineNum))
//   );

//   // Return removed items to first grid (avoid duplicates)
//   const existingIds1 = new Set(GetListSriealData.map((r) => String(r.LineNum)));
//   const toReturn = removedItems.filter(
//     (i) => !existingIds1.has(String(i.LineNum))
//   );

//   const newRows1 = [...GetListSriealData, ...toReturn];

//   // Update both grids
//   setRows2(newRows2);
//   setGetListSriealData(newRows1);

//   // Clear selection
//   setSelectedRows([]);
//   setSelectedRows2([]);
// };


  useEffect(() => {
    setValue("SELECT", rows2.length);
  }, [rows2, setValue]);

  const handlePaginationChange = useCallback((newModel) => {
    setPaginationModel(newModel);
  }, []);

  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setPaginationModel({
      page: 0,
      pageSize: 20,
    });
    // paginationModel(0); // Reset to page 0 on search
  }, []);
  const FetchSerialData = async (
    ItemCode,
    WHSCode,
    { page, pageSize },
    searchText
  ) => {
    try {
      const response = await apiClient.get("/SerialNumber", {
        params: {
          ItemCode,
          WhsCode: WHSCode,
          Status: "1",
          Page: page,
          Limit: pageSize,
          SearchText: searchText,
        },
      });

      if (response.data.success) {
        prevCountLimit.current = CountLimit;
        const newCount = response.data.count || 0;
        setCountLimit(newCount);
        const newData = response.data.values || [];
        setGetListSriealData(newData);
        console.log("Previous count:", prevCountLimit.current);
        console.log("New count:", newCount);
      } else {
        setGetListSriealData([]);
        setCountLimit(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        text: "Failed to fetch serial number data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    if (openserialmodal) {
      // setRows2([]);
      // setSelectedRows1([]);
      // setSelectedRows2([]);
      if (openserialmodal && ItemCode && WHSCode) {
        FetchSerialData(ItemCode, WHSCode, paginationModel, searchText);
      }
    }
  }, [openserialmodal, ItemCode, WHSCode, paginationModel, searchText]);

  console.log("Rows2", rows2);
  const ClearSeries = () => {
    setRows2([]);
    setSelectedRows1([]);
    setSelectedRows([]);
  };
  const handleCreate = () => {
    if (!rows2 || rows2.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "No serial rows selected. Please add at least one.",
      });
      return;
    }

    const combinedData = rows2.map((row, index) => ({
      id: index + 1,
      SuppSerial: row.SuppSerial || "",
      IntrSerial: row.IntrSerial || "",
      ItemCode: ItemCode || "",
      ItemName: ItemName || "",
      Quantity: "1",
      WhsCode: WHSCode || "",
      Direction: "0",
    }));

    console.log("✅ COMBINED DATA:", combinedData);

    if (onSubmit) {
      onSubmit(combinedData);
    }

    //  modal close
    if (DialogClosePayto) {
      DialogClosePayto();
    }

    Swal.fire({
      toast: true,
      position: "center",
      icon: "success",
      title: "Serials Created Successfully",
      text: `${combinedData.length} serial line created.`,
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  return (
    <>
      <Dialog
        open={openserialmodal}
        scroll="paper"
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            minHeight: "60vh",
            maxHeight: "100vh",
            minWidth: "90vh",
            maxWidth: "140vh",
          },
        }}
      >
        <DialogTitle>
          <Grid item display="flex" justifyContent="center">
            <Typography textAlign="center" fontWeight="bold" fontSize="15px">
              {Title}
            </Typography>
            <IconButton
              onClick={ClearSeries}
              sx={{
                position: "absolute",
                top: 5,
                right: 20,
                // "&:hover": {
                //   bgcolor: "darkred",
                // },
              }}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              padding: 2,
              boxShadow: 2,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={2}>
                <InputTextField
                  fullWidth
                  name="ItemCode"
                  label="ITEM NO."
                  variant="outlined"
                  size="small"
                  value={ItemCode}
                  title={ItemCode}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <InputTextField
                  fullWidth
                  name="ItemCode"
                  label="ITEM NAME."
                  variant="outlined"
                  size="small"
                  value={ItemName}
                  title={ItemName}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <InputTextField
                  fullWidth
                  name="WHSCode"
                  label="WHS CODE."
                  variant="outlined"
                  size="small"
                  value={WHSCode}
                  title={WHSCode}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <InputTextField
                  fullWidth
                  name="Quantity"
                  label="QUANTITY"
                  variant="outlined"
                  size="small"
                  value={Quantity}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name="SELECT"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="TOTAL SELECT"
                      type="text"
                      readOnly={true}
                      {...field}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={2}>
                <Controller
                  defaultValue="OUT"
                  name="Direction"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="DIRECTION"
                      type="text"
                      readOnly={true}
                      value="OUT"
                      // pass PAI 1 value
                      {...field}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* First DataGrid with Add button */}
          <Box
            sx={{
              flex: 1,
              height: 530,
              border: "1px solid #ccc",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <DataGrid
                className="datagrid-style"
                rows={GetListSriealData.map((item, index) => ({
                  ...item,
                  id: index,
                }))}
                columns={columns}
                checkboxSelection
                slots={{ toolbar: GridToolbar }}
                onRowSelectionModelChange={(ids) => handleSelectSeries(ids)}
                getRowId={(row) => row.LineNum}
                paginationMode="server"
                rowCount={1000}
                paginationModel={paginationModel}
                isRowSelectable={(params) => {
                  const isItem = !!params.row.LineNum;
                  const isSelected =
                    isItem &&
                    (rows2 || []).some(
                      (el) => el.LineNum === params.row.LineNum
                    );
                  return !isSelected;
                }}
                onPaginationModelChange={handlePaginationChange}
                initialState={{
                  pagination: { paginationModel: { pageSize: 20, page: 0 } },
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: [],
                    },
                  },
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                getRowClassName={(params) => {
                  const isItem = !!params.row.LineNum;
                  const isSelected =
                    isItem &&
                    (rows2 || []).some(
                      (el) => el.LineNum === params.row.LineNum
                    );
                  return isSelected ? "selected-row" : "";
                }}
                onFilterModelChange={(model) => {
                  const quickFilterValue = model.quickFilterValues?.[0] || "";
                  handleSearchChange(quickFilterValue);
                }}
                pageSizeOptions={[10, 20, 100]}
                // onRowSelectionModelChange={(ids) => handleSelectSeries(ids)}
                //                 onRowSelectionModelChange={(newSelectedIds) => {
                //   setSelectedRows1((prevSelected) => {
                //     const combined = new Set([...prevSelected, ...newSelectedIds]);
                //     return Array.from(combined);
                //   });
                // }}
                // rowSelectionModel={selectedRows1}
                sx={{
                  height: 450,
                  "& .selected-row": (theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark" ? green[900] : green[100],
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? green[800] : green[200],
                    },
                  }),
                }}
              />
            </Box>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{
                  padding: "4px 10px",
                  backgroundColor:
                    selectedRows.length === 0 ? "#9e9e9e" : "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: selectedRows.length === 0 ? "not-allowed" : "pointer",
                  opacity: selectedRows.length === 0 ? 0.7 : 1,
                }}
                onClick={handleAddSelected}
                disabled={selectedRows.length === 0}
              >
                Add Selected →
              </Button>
            </Box>
          </Box>

          {/* Second DataGrid with Remove button */}
          <Box
            sx={{
              flex: 1,
              height: 530,
              border: "1px solid #ccc",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <DataGrid
                className="datagrid-style"
                rows={rows2}
                columns={columns2}
                rowCount={rows2.length}
                pageSize={5}
                checkboxSelection
                slots={{ toolbar: QuickFilterToolbar }}
                pageSizeOptions={[10, 20, 100]}
                paginationModel={paginationModelSecond}
                onPaginationModelChange={setPaginationModelSecond}
                getRowId={(row) => row.LineNum}
                onRowSelectionModelChange={(ids) => setSelectedRows2(ids)}
                rowSelectionModel={selectedRows2}
  //              onFilterModelChange={(model) => {
  //   const quickFilterValue = model.quickFilterValues?.[0]?.toLowerCase() || "";

  //   if (!quickFilterValue) {
  //     // If no search text, show all
  //     setRows2(rows2);
  //   } else {
  //     // Filter based on IntrSerial (case-insensitive)
  //     const filtered = rows2.filter((row) =>
  //       String(row.IntrSerial).toLowerCase().includes(quickFilterValue)
  //     );
  //     setRows2(filtered);
  //   }
  // }}

                getRowClassName={(params) => {
                  const isItem = !!params.row.LineNum;
                  const isSelected =
                    isItem &&
                    (GetListSriealData || []).some(
                      (el) => el.LineNum === params.row.LineNum
                    );
                  return isSelected ? "selected-row" : "";
                }}
                sx={{
                  height: 450,
                  "& .selected-row": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? deepPurple[900]
                        : deepPurple[100],
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? deepPurple[800]
                          : deepPurple[200],
                    },
                  },
                }}
              />
            </Box>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
              <Button
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    selectedRows2.length === 0 ? "#9e9e9e" : "#5a6ac5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    selectedRows2.length === 0 ? "not-allowed" : "pointer",
                  opacity: selectedRows2.length === 0 ? 0.7 : 1,
                }}
                onClick={handleRemoveSelected}
                disabled={selectedRows2.length === 0}
              >
                ← Remove Selected
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ---------- Actions ---------- */}

        <DialogActions>
          <Box
            px={2}
            width="100%"
            display="flex"
            justifyContent="space-between"
          >
            <Button
              variant="contained"
              color="success"
              onClick={handleCreate}
              disabled={rows2.length !== Number(Quantity)}
            >
              CREATE
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={DialogClosePayto}
            >
              CLOSE
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SerialSalesOuttake;
