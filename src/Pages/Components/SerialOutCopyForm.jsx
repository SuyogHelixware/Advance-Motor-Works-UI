import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import RefreshIcon from "@mui/icons-material/Refresh";

import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
  Avatar,
  Box,
  Button,
  Card,
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
  useTheme,
} from "@mui/material";
import MuiPagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  GridToolbar,
  GridToolbarQuickFilter,
  useGridApiContext,
  useGridSelector,
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

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "color",
})(({ theme, color = "primary" }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${
      isDark ? theme.palette[color].dark : theme.palette[color].light
    }`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    height: "100%",

    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: theme.palette[color].main,
    },

    "&:hover": {
      borderColor: theme.palette[color].main,
      boxShadow: isDark
        ? "0 8px 24px rgba(0,0,0,0.8)"
        : `0 8px 24px ${theme.palette[color].main}40`,
      transform: "translateY(-2px)",
    },
  };
});

const RoundedTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    transition: "all 0.3s",
    // backgroundColor: theme.palette.background.paper,
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 12px rgba(25,118,210,0.2)",
    },
  },
}));

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

const SerialOutCopyForm = ({
  Title = "SERIAL NUMBER",
  openserialmodal,
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
  Status,
  Ids,
}) => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalQty, setTotalQty] = useState("");
  const theme = useTheme();
  const [generatedData, setGeneratedData] = useState([]);
  const [pageSize, setPageSize] = useState(100); // 👈 fixed 20
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
    if (openserialmodal) {
      setTotalQty(Quantity?.toString() || "");
      setGeneratedCount(0);
      setGeneratedData([]);
      setItemCache({});
    }
  }, [openserialmodal, Quantity, BinCode]);

  const handleSubmit = () => {
    if (data2.length === 0) {
      Swal.fire({
        title: "Select Series",
        text: "Please Select Series.",
        icon: "warning",
      });
      return;
    }
    const selectedData = data2.filter((row) =>
      selectedRows2.includes(row.LineNum)
    );
    if (parseFloat(Quantity) !== selectedData.length) {
      Swal.fire({
        title: "Quantity Mismatch",
        text: `Required Quantity: ${TwoFormatter(Quantity)}, Selected: ${
          selectedData.length
        }. Please select correct number of items.`,
        icon: "warning",
      });
      return;
    }
    const serialData = {
      Ids,
      generatedCount,
      oSerialLines: selectedData.map((se) => ({
        SuppSerial: se?.SuppSerial ?? "",
        IntrSerial: se?.IntrSerial ?? "",
        BatchId: se?.BatchId ?? "",
        ExpDate: dayjs(se.ExpDate).isValid()
          ? dayjs(se.ExpDate).format("YYYY-MM-DD")
          : null,
        PrdDate: dayjs(se.prdDate).isValid()
          ? dayjs(se.prdDate).format("YYYY-MM-DD")
          : null,
        InDate: dayjs(se.InDate).isValid()
          ? dayjs(se.InDate).format("YYYY-MM-DD")
          : null,
        GrntStart: dayjs(se.GrntStart).isValid()
          ? dayjs(se.GrntStart).format("YYYY-MM-DD")
          : null,
        GrntExp: dayjs(se.GrntExp).isValid()
          ? dayjs(se.GrntExp).format("YYYY-MM-DD")
          : null,
        Notes: se?.Notes ?? "",
        Quantity: "1",
        BaseEntry: se?.BaseEntry ?? "",
        BaseLinNum: se?.BaseLinNum ?? "",
        Status: "0",
        Direction: "0",
      })),
    };
    onSubmit(serialData);
    DialogClosePayto();
    setGeneratedData([]);
    setSelectedRows1([]);
    setSelectedRows2([]);
    setData2([]);
    setItemCache({});
  };

  function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const handleChange = (event, value) => {
      apiRef.current.setPage(value - 1);
    };

    return (
      <MuiPagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={handleChange}
      />
    );
  }

  const handleClearAll = () => {
    setData2([]);
    setSelectedRows1([]);
    setSelectedRows2([]);
  };
  // Toolbar with Quick Filter
  function QuickFilterToolbar() {
    return (
      <Box sx={{ p: 1, pb: 0, display: "flex", justifyContent: "flex-end" }}>
        <GridToolbarQuickFilter quickFilterProps={{ debounceMs: 500 }} />
      </Box>
    );
  }
  const SerialCol = [
    {
      field: "IntrSerial",
      headerName: "Serial No",
      width: 150,
      editable: false,
      // renderCell: (params) => (
      //   <ModelInputTextField
      //     name="IntrSerial"
      //     defaultValue={params.row.IntrSerial}
      //     onBlur={(e) => handleFieldChange(e, params.row)}
      //   />
      // ),
    },

    // {
    //   field: "lot",
    //   headerName: "LOT NO.",
    //   width: 130,
    //   renderCell: (params) => (
    //     <InputTextField
    //       name="BatchId"
    //       defaultValue={params.value || ""}
    //       onBlur={(e) =>
    //         handleFieldChange(params.id, params.field, e.target.value)
    //       }
    //     />
    //   ),
    // },
  ];

  const handleAddSelected = () => {
    if (!selectedRows1.length) return;

    const selectedData = generatedData.filter((row) =>
      selectedRows1.includes(row.LineNum)
    );
    // setData2((prev) => [...prev, ...selectedData]);

    setData2((prev) => {
      const existingIds = new Set(prev.map((row) => row.LineNum));

      const newItems = generatedData.filter(
        (row) =>
          selectedRows1.includes(row.LineNum) && !existingIds.has(row.LineNum)
      );

      return [...newItems, ...prev];
    });
    setGeneratedData((prev) =>
      prev.filter((row) => !selectedRows1.includes(row.LineNum))
    );
    setGeneratedCount(selectedData.length);
    setSelectedRows1([]);
  };
  const handleRemoveSelected = () => {
    if (!selectedRows2.length) return;

    const selectedData = data2.filter((row) =>
      selectedRows2.includes(row.LineNum)
    );

    // setGeneratedData((prev) => [...prev, ...selectedData]);
    setGeneratedData((prev) => {
      const existingIds = new Set(prev.map((row) => row.LineNum));

      const rowsToAddBack = data2.filter(
        (row) =>
          selectedRows2.includes(row.LineNum) && !existingIds.has(row.LineNum)
      );

      return [...rowsToAddBack, ...prev];
    });

    setData2((prev) =>
      prev.filter((row) => !selectedRows2.includes(row.LineNum))
    );
    let remove = generatedCount - selectedData.length;
    setGeneratedCount(remove);
    setSelectedRows2([]);
  };

  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}_${pageSize}`;
      if (itemCache[cacheKey]) {
        setData2(itemCache[cacheKey]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/SerialNumber`, {
          params: {
            BaseEntry: BaseEntry,
            BaseType: BaseType,
            ItemCode: ItemCode,
            WhsCode: WHSCode,
            Status: Status,
            Page: page, // Pass the page param correctly
            Limit: pageSize, // Must match pageSize
            Search: search,
          },
        });
        if (data.success) {
          const items = data.values || [];
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setData2(items);
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
    [itemCache, pageSize]
  );

  // Fetch items on page/search change
  useEffect(() => {
    if (openserialmodal) {
      fetchItems(currentPage, searchText);
    }
  }, [currentPage, pageSize, searchText, fetchItems, openserialmodal]);

  const handlePaginationModelChange = useCallback(
    ({ page, pageSize: newPageSize }) => {
      if (page !== currentPage) setCurrentPage(page);
      if (newPageSize !== pageSize) setPageSize(newPageSize);
    },
    [currentPage, pageSize]
  );

  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to first page
    setItemCache({}); // Clear cache for new search
  }, []);

  let TtlQuantity = generatedData[0]?.TtlQuantity ?? 0;
  const progress = 100 > 0 ? (generatedCount / 100) * 100 : 0;
  return (
    <>
      <GradientDialog
        open={openserialmodal}
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
              // gap: 1,
              cursor: "pointer",
            }}
          >
            <ExitToAppIcon color="primary" />
            Series Out
          </Typography>

          {/* <Grid container spacing={2} mt={1.5}>
            <Grid item xs={12} sm={4} lg={4}>
              <RoundedTextField
                fullWidth
                size="small"
                type="number"
                label="Quantity"
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} lg={4}>
              <RoundedTextField
                fullWidth
                size="small"
                type="number"
                label="Total Selected"
                value={data2.length}
                onChange={(e) => setTotalQty(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} lg={4}>
              <RoundedTextField
                fullWidth
                size="small"
                type="number"
                label="Available Quantity"
                value={generatedData[0]?.TtlQuantity ?? 0}
                onChange={(e) => setTotalQty(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          
          </Grid> */}

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
                    {data2.length}
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
                  {generatedCount} / {data2.length}
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
          {/* Generated Data Preview */}

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
                columns={SerialCol}
                getRowId={(row) => row.LineNum}
                rowCount={generatedData.length}
                pageSizeOptions={[5, 10, 20, 100]}
                checkboxSelection
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
                sx={{ height: 450 }}
                columnHeaderHeight={40}
                disableRowSelectionOnClick
              />
            </Box>

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
                columns={SerialCol}
                getRowId={(row) => row.LineNum}
                checkboxSelection
                loading={loading}
                pagination
                paginationMode="server"
                pageSizeOptions={[5, 10, 20, 100]}
                rowCount={rowCount}
                paginationModel={{ page: currentPage, pageSize }}
                onRowSelectionModelChange={(ids) => setSelectedRows2(ids)}
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={(model) => {
                  const quickFilterValue = (model.quickFilterValues || []).join(
                    " "
                  );
                  handleSearchChange(quickFilterValue);
                }}
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
export default SerialOutCopyForm;
