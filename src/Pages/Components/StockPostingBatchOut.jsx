
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbar
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { TwoFormatter, ValueFormatter } from "./ValueFormatter";

const GradientDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    maxHeight: "90vh",
    boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
  },
}));

const GradientHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    background: isDark
      ? `linear-gradient(
          135deg,
          ${theme.palette.primary.dark} 0%,
          ${theme.palette.background.paper} 60%,
          ${theme.palette.background.default} 100%
        )`
      : `linear-gradient(
          135deg,
          ${theme.palette.primary.main} 0%,
          ${theme.palette.primary.dark} 50%,
          ${theme.palette.primary.light} 100%
        )`,
    padding: theme.spacing(3),
    color: theme.palette.common.white,
    position: "relative",
    overflow: "hidden",

    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: isDark
        ? "radial-gradient(circle at top right, rgba(255,255,255,0.06), transparent)"
        : "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent)",
      pointerEvents: "none",
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: "10px 28px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

const StockPostingBatchOut = ({
  Title = "",
  openBatchmodal,
  DialogClosePayto,
  onSubmit,
  ItemCode,
  Quantity,
  WHSCode,
  CardCode,
  CardName,
  BinCode,
  BaseEntry,
  BaseType,
  Ids,
}) => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalQty, setTotalQty] = useState("");
  const theme = useTheme();
  const [generatedData, setGeneratedData] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [rowCount, setRowCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data2, setData2] = useState([]); // RIGHT grid data
const [selectedRows1, setSelectedRows1] = useState([]);
const [selectedRows2, setSelectedRows2] = useState([]);

  // Initialize values when modal opens
  useEffect(() => {
    if (openBatchmodal) {
      setTotalQty(Quantity?.toString() || "");
      setGeneratedCount(0);
      setItemCache({});
      setGeneratedData([]);
      setData2([]);
    }
  }, [openBatchmodal, Quantity, BinCode]);

  const handleSubmit = () => {
    if (data2.length === 0) {
      Swal.fire({
        title: "Select Series",
        text: "Please Select Series.",
        icon: "warning",
      });
      return;
    }
    const totalSelectedQty = data2.reduce((sum, row) => sum + (parseFloat(row.Quantity) || 0), 0);
    if (parseFloat(Quantity) !== totalSelectedQty) {
      Swal.fire({
        title: "Quantity Mismatch",
        text: `Required Quantity: ${TwoFormatter(Quantity)}, Selected: ${totalSelectedQty}. Please select correct quantity.`,
        icon: "warning",
      });
      return;
    }
    const batchData = {
      Ids,
      generatedCount,
      oBatchLines: data2.map((batch) => ({
        BatchName: batch.BatchNum,
        BatchQty: batch.Quantity,
        SuppSerial: batch?.SuppSerial ?? "",
        IntrSerial: batch?.IntrSerial ?? "",
        BatchId: batch?.BatchId ?? "",
        ExpDate: dayjs(batch.ExpDate).isValid()
          ? dayjs(batch.ExpDate).format("YYYY-MM-DD")
          : null,
        PrdDate: dayjs(batch.prdDate).isValid()
          ? dayjs(batch.prdDate).format("YYYY-MM-DD")
          : null,
        InDate: dayjs(batch.InDate).isValid()
          ? dayjs(batch.InDate).format("YYYY-MM-DD")
          : null,
        GrntStart: dayjs(batch.GrntStart).isValid()
          ? dayjs(batch.GrntStart).format("YYYY-MM-DD")
          : null,
        GrntExp: dayjs(batch.GrntExp).isValid()
          ? dayjs(batch.GrntExp).format("YYYY-MM-DD")
          : null,
        Notes: batch?.Notes ?? "",
        Quantity: batch.Quantity, // Use actual quantity
        BaseEntry: batch?.BaseEntry ?? "",
        BaseLinNum: batch?.BaseLinNum ?? "",
        Status: "0",
        Direction: "0",
      })),
    };
    onSubmit(batchData);
    DialogClosePayto();
    setGeneratedData([]);
    setData2([]);
    setItemCache({});
  };

const handleExtraQtyChange = (id, value) => {
  const numValue = parseFloat(value) || 0;
  const row = generatedData.find(r => r.LineNum === id);
  if (row && numValue > row.Quantity) {
    // Clear the field if exceeds quantity
    setGeneratedData(prev => prev.map(row => row.LineNum === id ? { ...row, extraQty: "" } : row));
    // Optionally show SweetAlert
    Swal.fire("Invalid Quantity", "Move quantity cannot exceed available quantity.", "warning");
  } else {
    setGeneratedData(prev => prev.map(row => row.LineNum === id ? { ...row, extraQty: value } : row));
  }
};

const handleExtraQtyChange2 = (id, value) => {
  const numValue = parseFloat(value) || 0;
  const row = data2.find(r => r.LineNum === id);
  if (row && numValue > row.Quantity) {
    // Clear the field if exceeds quantity
    setData2(prev => prev.map(row => row.LineNum === id ? { ...row, extraQty: "" } : row));
    // Optionally show SweetAlert
    Swal.fire("Invalid Quantity", "Move quantity cannot exceed available quantity.", "warning");
  } else {
    setData2(prev => prev.map(row => row.LineNum === id ? { ...row, extraQty: value } : row));
  }
};

  const handleMoveToRight = (row) => {
    const qty = parseFloat(row.extraQty) || 0;
    if (qty <= 0 || qty > row.Quantity) {
      Swal.fire("Invalid Quantity", "Enter a valid quantity to move.", "warning");
      return;
    }
    setData2(prev => {
      const existing = prev.find(r => r.LineNum === row.LineNum);
      if (existing) {
        return prev.map(r => r.LineNum === row.LineNum ? { ...r, Quantity: (parseFloat(r.Quantity) || 0) + qty } : r);
      } else {
        return [...prev, { ...row, Quantity: qty }];
      }
    });
    setGeneratedData(prev => prev.map(r => {
      if (r.LineNum === row.LineNum) {
        const newQty = r.Quantity - qty;
        return { ...r, Quantity: newQty, extraQty: "" };
      }
      return r;
    }).filter(r => r.Quantity > 0));
    setGeneratedCount(prev => prev + qty);
  };

  const handleMoveToLeft = (row) => {
    const qty = parseFloat(row.extraQty) || 0;
    if (qty <= 0 || qty > row.Quantity) {
      Swal.fire("Invalid Quantity", "Enter a valid quantity to move.", "warning");
      return;
    }
    setGeneratedData(prev => {
      const existing = prev.find(r => r.LineNum === row.LineNum);
      if (existing) {
        return prev.map(r => r.LineNum === row.LineNum ? { ...r, Quantity: (parseFloat(r.Quantity) || 0) + qty } : r);
      } else {
        return [...prev, { ...row, Quantity: qty }];
      }
    });
    setData2(prev => prev.map(r => {
      if (r.LineNum === row.LineNum) {
        const newQty = r.Quantity - qty;
        return { ...r, Quantity: newQty, extraQty: "" };
      }
      return r;
    }).filter(r => r.Quantity > 0));
    setGeneratedCount(prev => prev - qty);
  };
// Define columns for left grid
const BatchColLeft = [
  {
    field: "BatchNum",
    headerName: "BATCH NAME",
    width: 150,
  },
  {
    field: "Quantity",
    headerName: "QUANTITY",
    width: 150,
  },
  {
    field: "extraQty",
    headerName: "MOVE QTY",
    width: 150,
    renderCell: (params) => (
      <TextField
        size="small"
        type="number"
        value={params.row.extraQty || ""}
        onChange={(e) => handleExtraQtyChange(params.id, e.target.value)}
        inputProps={{ max: params.row.Quantity, min: 0 }}
        sx={{ width: 80 }}
      />
    ),
  },
];

// Define columns for right grid
const BatchColRight = [
  {
    field: "BatchNum",
    headerName: "BATCH NAME",
    width: 150,
  },
  {
    field: "Quantity",
    headerName: "QUANTITY",
    width: 150,
  },
  {
    field: "extraQty",
    headerName: "MOVE QTY",
    width: 150,
    renderCell: (params) => (
      <TextField
        size="small"
        type="number"
        value={params.row.extraQty || ""}
        onChange={(e) => handleExtraQtyChange2(params.id, e.target.value)}
        inputProps={{ max: params.row.Quantity, min: 0 }}
        sx={{ width: 80 }}
      />
    ),
  },
];
// const BatchCol = [
//   {
//     field: "BatchNum",
//     headerName: "BATCH NAME",
//     width: 150,
//   },
//   {
//     field: "Quantity",
//     headerName: "QUANTITY",
//     width: 150,
//   },
//   {
//     field: "extraQty",
//     headerName: "MOVE QTY",
//     width: 150,
//     renderCell: (params) => (
//       <TextField
//         size="small"
//         type="number"
//         value={params.row.extraQty || ""}
//         onChange={(e) => {
//           if (params.row.fromLeft) {
//             handleExtraQtyChange(params.id, e.target.value);
//           } else {
//             handleExtraQtyChange2(params.id, e.target.value);
//           }
//         }}
//         sx={{ width: 80 }}
//       />
//     ),
//   },
// ];

// Modify handleAddSelected to move partial quantities based on extraQty
// ... existing code ...

// Modify handleAddSelected to check that each selected row has extraQty > 0, else show SweetAlert
const handleAddSelected = () => {
  if (!selectedRows1.length) return;

  const selectedData = generatedData.filter((row) =>
    selectedRows1.includes(row.LineNum)
  );

  // Check if all selected rows have extraQty > 0
  const invalidRows = selectedData.filter(row => !(parseFloat(row.extraQty) > 0));
  if (invalidRows.length > 0) {
    Swal.fire("Invalid Selection", "Each selected row must have a valid move quantity entered.", "warning");
    return;
  }

  const currentSelected = [...selectedRows1];
  setSelectedRows1([]);

  selectedData.forEach((row) => {
    const qty = parseFloat(row.extraQty) || 0;
    if (qty > 0 && qty <= row.Quantity) {
      setData2((prev) => {
        const existing = prev.find(r => r.LineNum === row.LineNum);
        if (existing) {
          return prev.map(r => r.LineNum === row.LineNum ? { ...r, Quantity: (parseFloat(r.Quantity) || 0) + qty } : r);
        } else {
          return [...prev, { ...row, Quantity: qty, extraQty: "" }];
        }
      });
      setGeneratedData((prev) => prev.map(r => {
        if (r.LineNum === row.LineNum) {
          const newQty = r.Quantity - qty;
          return { ...r, Quantity: newQty, extraQty: "" };
        }
        return r;
      }).filter(r => r.Quantity > 0));
      setGeneratedCount(prev => prev + qty);
    }
  });
};

// Modify handleRemoveSelected to check that each selected row has extraQty > 0, else show SweetAlert
const handleRemoveSelected = () => {
  if (!selectedRows2.length) return;

  const selectedData = data2.filter((row) =>
    selectedRows2.includes(row.LineNum)
  );

  // Check if all selected rows have extraQty > 0
  const invalidRows = selectedData.filter(row => !(parseFloat(row.extraQty) > 0));
  if (invalidRows.length > 0) {
    Swal.fire("Invalid Selection", "Each selected row must have a valid move quantity entered.", "warning");
    return;
  }

  const currentSelected = [...selectedRows2];
  setSelectedRows2([]);

  selectedData.forEach((row) => {
    const qty = parseFloat(row.extraQty) || 0;
    if (qty > 0 && qty <= row.Quantity) {
      setGeneratedData((prev) => {
        const existing = prev.find(r => r.LineNum === row.LineNum);
        if (existing) {
          return prev.map(r => r.LineNum === row.LineNum ? { ...r, Quantity: (parseFloat(r.Quantity) || 0) + qty } : r);
        } else {
          return [...prev, { ...row, Quantity: qty, extraQty: "" }];
        }
      });
      setData2((prev) => prev.map(r => {
        if (r.LineNum === row.LineNum) {
          const newQty = r.Quantity - qty;
          return { ...r, Quantity: newQty, extraQty: "" };
        }
        return r;
      }).filter(r => r.Quantity > 0));
      setGeneratedCount(prev => prev - qty);
    }
  });
};

// ... existing code ...

  const fetchItems = useCallback(
    async (page = 0, search = "", ItemCode, WHSCode) => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/BatchNumber`, {
          params: {
            BaseEntry: BaseEntry,
            BaseType: BaseType,
            ItemCode: ItemCode,
            WhsCode: WHSCode,
            Status: 1,
            Page: page,
            Limit: pageSize,
            Search: search,
          },
        });
        if (data.success) {
          const items = data.values || [];
          setGeneratedData(items.map(item => ({ ...item, extraQty: "", fromLeft: true })));
          const estimatedRowCount =
            page === 0 ? pageSize + 1 : page * pageSize + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (err) {
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch items on page/search change
  useEffect(() => {
    if (openBatchmodal) {
      fetchItems(currentPage, searchText, ItemCode, WHSCode);
    }
  }, [
    currentPage,
    pageSize,
    searchText,
    ItemCode,
    WHSCode,
    fetchItems,
    openBatchmodal,
  ]);

  // Handle server-side pagination
  const handlePaginationModelChange = useCallback(
    ({ page, pageSize: newPageSize }) => {
      if (page !== currentPage) setCurrentPage(page);
      if (newPageSize !== pageSize) setPageSize(newPageSize);
    },
    [currentPage, pageSize]
  );

  // Handle search/filter
  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0);
    setItemCache({});
  }, []);

  let TtlQuantity = generatedData[0]?.TtlQuantity ?? 0;
  const totalSelectedQty = data2.reduce((sum, row) => sum + (parseFloat(row.Quantity) || 0), 0);
  const progress = parseFloat(totalQty) > 0 ? (totalSelectedQty / parseFloat(totalQty)) * 100 : 0;

  const handleClearAll = () => {
    setData2([]);
    setGeneratedCount(0);
  };

  return (


<>
  <GradientDialog
    open={openBatchmodal}
    onClose={DialogClosePayto}
    maxWidth="xl"
    fullWidth
  >
    <GradientHeader>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}
          >
            <InventoryIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {Title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={ItemCode}
                size="medium"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 700,
                }}
              />
              <Chip
                label={WHSCode}
                size="medium"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 700,
                }}
              />
              {CardName && (
                <Chip
                  label={CardName}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={DialogClosePayto} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Stack>
    </GradientHeader>

    <DialogContent sx={{ p: 2, bgcolor: "background.paper" }}>
      <Typography
        variant="h6"
        fontWeight={600}
        mb={0.5}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ExitToAppIcon color="primary" />
        Batch Out
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 1,
          mb: 0.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight={400}>
            Generation Progress
          </Typography>
        </Stack>
        <Grid container spacing={1} mb={0.5}>
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                p: 0.5,
                bgcolor: "success.50",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                fontWeight={400}
                color="success.main"
              >
                {ValueFormatter(totalQty, 0)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={400}
              >
                Quantity
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                p: 0.5,
                bgcolor: "warning.50",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                fontWeight={400}
                color="warning.main"
              >
                {totalSelectedQty}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={400}
              >
                Total Selected
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                p: 0.5,
                bgcolor: "primary.50",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                fontWeight={400}
                color="primary.main"
              >
                {ValueFormatter(TtlQuantity, 0)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={400}
              >
                Available Quantity
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight={300}>
              {Math.round(progress)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalSelectedQty} / {totalQty}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 4,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background:
                  "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              },
            }}
          />
        </Box>
      </Paper>

      {/* DataGrid */}
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        {/* Left Grid */}
        <Box
          sx={{
            flex: 1,
            height: 530,
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
         <DataGrid
  rows={generatedData}
  columns={BatchColLeft}
  getRowId={(row) => row.LineNum}
  loading={loading}
  pagination
  paginationMode="server"
  filterMode="server"
  pageSizeOptions={[5, 10, 20, 100]}
  rowCount={rowCount}
  paginationModel={{ page: currentPage, pageSize }}
  onPaginationModelChange={handlePaginationModelChange}
  checkboxSelection
  rowSelectionModel={selectedRows1}  // Add this to control selection
  onRowSelectionModelChange={(ids) => setSelectedRows1(ids)}
  disableColumnFilter
  disableColumnSelector
  disableDensitySelector
  slotProps={{
    toolbar: {
      showQuickFilter: true,
      quickFilterProps: { debounceMs: 500 },
    },
  }}
  slots={{ toolbar: GridToolbar }}
  onFilterModelChange={(model) => {
    const quickFilterValue = (model.quickFilterValues || []).join(
      " "
    );
    handleSearchChange(quickFilterValue);
  }}
  sx={{ height: 450 }}
  columnHeaderHeight={40}
  disableRowSelectionOnClick
/>
        </Box>

        {/* Center Buttons */}
        <Box
          sx={{
            width: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddSelected}
            disabled={selectedRows1.length === 0}
          >
            →
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleRemoveSelected}
            disabled={selectedRows2.length === 0}
          >
            ←
          </Button>
        </Box>

        {/* Right Grid */}
        <Box
          sx={{
            flex: 1,
            height: 530,
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
        <DataGrid
  rows={data2}
  columns={BatchColRight}
  getRowId={(row) => row.LineNum}
  checkboxSelection
  loading={loading}
  pagination
  pageSizeOptions={[5, 10, 20, 100]}
  rowCount={data2.length}
  rowSelectionModel={selectedRows2}  // Add this to control selection
  onRowSelectionModelChange={(ids) => setSelectedRows2(ids)}
  disableColumnFilter
  disableColumnSelector
  disableDensitySelector
  slotProps={{
    toolbar: {
      showQuickFilter: true,
      quickFilterProps: { debounceMs: 500 },
    },
  }}
  slots={{ toolbar: GridToolbar }}
  disableRowSelectionOnClick
  columnHeaderHeight={40}
  sx={{ flex: 1 }}
/>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions
      sx={{
        px: 3,
        py: 2,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "grey.200",
        gap: 1,
      }}
    >
      <ActionButton
        variant="outlined"
        color="error"
        onClick={handleClearAll}
        startIcon={<RefreshIcon />}
      >
        Clear All
      </ActionButton>
      <Box sx={{ flex: 1 }} />
      <ActionButton variant="outlined" onClick={DialogClosePayto}>
        Close
      </ActionButton>

      <ActionButton
        variant="contained"
        onClick={handleSubmit}
        disabled={data2.length === 0}
        color="success"
        startIcon={<CheckCircleIcon />}
      >
        Submit
      </ActionButton>
    </DialogActions>
  </GradientDialog>
</>


  );
};
export default StockPostingBatchOut;