import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import QrCodeIcon from "@mui/icons-material/QrCode";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid, GridExpandMoreIcon } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import { useParameterApiCalling } from "../../Hooks/useParameterApiCalling";
import CardComponent from "./CardComponent";
import { InputDatePickerFields, InputTextField } from "./formComponents";
import SearchModel from "./SearchModel";
import Swal from "sweetalert2";
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
      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 60%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    padding: theme.spacing(3),
    color: theme.palette.common.white,
    position: "relative",
    overflow: "hidden",
  };
});

const StyledCard = styled(Card)(({ theme, color = "primary" }) => ({
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette[color].light}`,
  transition: "all 0.3s",
  position: "relative",
  overflow: "hidden",
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
    boxShadow: `0 8px 24px ${theme.palette[color].main}40`,
    transform: "translateY(-2px)",
  },
}));

const RoundedTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    transition: "all 0.3s",
    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    "&.Mui-focused": { boxShadow: "0 4px 12px rgba(25,118,210,0.2)" },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: "10px 28px",
  textTransform: "none",
  fontWeight: 600,
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

const BatchIntake = ({
  Title = "BATCH NUMBER",
  Quantity,
  ItemName,
  ItemCode,
  CardName,
  WHSCode,
  BinCode,
  openBatchmodal,
  DialogClosePayto,
  onSubmit,
  Ids,
  oBatchLines=[],
}) => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [BatchNum, setBatchNum] = useState("1");
  const [EnteredQty, setEnteredQty] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [remainingQty, setRemainingQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [inDate, setInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [prdDate, setPrdDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [grntStart, setGrntStart] = useState("");
  const [grntExp, setGrntExp] = useState("");
  const [binCode, setBinCode] = useState("");
  const [openDates, setOpenDates] = useState(true);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [openSBL, setOpenSBL] = useState(true);
  const [openWhsc, setWhscOpen] = useState(false);
  const [openBinLine, setBinLineOpen] = useState(false);
  const [BatchRows, setBatchRows] = useState([
    { type: "N", serial: "", sequence: "I" },
    { type: "T", serial: "", sequence: "N" },
  ]);

  useEffect(() => {
    if (openBatchmodal) {
      setBatchRows([
        { type: "N", serial: "", sequence: "I" },
        { type: "T", serial: "", sequence: "N" },
      ]);
      setPrdDate("");
      setInDate(dayjs().format("YYYY-MM-DD"));
      setExpDate("");
      setGrntStart("");
      setGrntExp("");
      setNotes("");
      setRows(oBatchLines);

      setBatchNum("1");
      setEnteredQty(Quantity?.toString() || "");
      setBinCode(BinCode || "");
      setGeneratedCount(0);
      setRemainingQty(Quantity || 0);
    }
  }, [openBatchmodal, Quantity, oBatchLines, BinCode]);

  useEffect(() => {
    const totalBatchQty = rows.reduce(
      (sum, r) => sum + Number(r.BatchQty || 0),
      0
    );
    const remaining = (Quantity || 0) - totalBatchQty;
    setRemainingQty(remaining > 0 ? remaining : 0);
    setGeneratedCount(totalBatchQty);
    setEnteredQty(remaining > 0 ? remaining : 0);
  }, [rows, Quantity]);

  const progress = Quantity > 0 ? (generatedCount / Quantity) * 100 : 0;

  const handleBatchTypeChange = (index, value) => {
    const newRows = [...BatchRows];
    newRows[index].type = value;
    const currentBatch = newRows[index].serial;
    if (value === "N" && /[^0-9]/.test(currentBatch))
      newRows[index].serial = "";
      newRows[index].sequence = "I";
    if (value === "T" && /[^a-zA-Z]/.test(currentBatch))
      newRows[index].serial = "";
    if (value === "T") newRows[index].sequence = "N";
    setBatchRows(newRows);
  };

  const handleBatchValueChange = (index, value) => {
    const newRows = [...BatchRows];
    if (newRows[index].type === "N") {
      newRows[index].serial = value.replace(/[^0-9]/g, "");
    } else if (newRows[index].type === "T") {
      newRows[index].serial = value.replace(/[^a-zA-Z]/g, "");
    } else {
      newRows[index].serial = value;
    }
    setBatchRows(newRows);
  };

  const handleBatchSeqChange = (index, value) => {
    const newRows = [...BatchRows];
    newRows[index].sequence = value;
    setBatchRows(newRows);
  };

  const handleEnteredQtyChange = (e) => {
    const value = Number(e.target.value) || 0;
    if (value > remainingQty) return;
    setEnteredQty(value);
  };

  const handleSaveBatches = () => {
    const numBatches = Number(BatchNum);
    const createQty = Number(EnteredQty);
    if (!createQty || createQty <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Quantity",
        text: "Enter a valid quantity",
        toast: true,
        position: "center",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (createQty > remainingQty) {
      Swal.fire({
        icon: "error",
        title: "Quantity Exceeded",
        text: "Entered quantity exceeds remaining",
        toast: true,
        position: "center",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!numBatches || numBatches <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Batch Number",
        text: "Enter valid number of batches",
        toast: true,
        position: "center",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    const hasSerialValue = BatchRows.some(
      (row) => row.serial && row.serial.trim() !== ""
    );
    if (!hasSerialValue) {
      Swal.fire({
        icon: "warning",
        title: "No Batch Pattern",
        text: "Enter at least one pattern",
        toast: true,
        position: "center",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    const baseQty = Math.floor(createQty / numBatches);
    const remainder = createQty % numBatches;
    const newBatches = [];
    for (let i = 0; i < numBatches; i++) {
      let BatchNum = "";
      BatchRows.forEach((row) => {
        if (row.type === "N") {
          const baseNum = parseInt(row.serial) || 0;
          if (row.sequence === "I") BatchNum += (baseNum + i).toString();
          else if (row.sequence === "D") BatchNum += (baseNum - i).toString();
          else BatchNum += baseNum.toString();
        } else if (row.type === "T") {
          BatchNum += row.serial;
        }
      });

      const qtyForBatch = i === numBatches - 1 ? baseQty + remainder : baseQty;
      newBatches.push({
        id: Date.now() + i,
        BatchNum: BatchNum,
        BatchQty: qtyForBatch,
        BinCode: binCode || "",
        PrdDate: prdDate || null,
        ExpDate: expDate || null,
        InDate: inDate || dayjs().format("YYYY-MM-DD"),
        GrntStart: grntStart || null,
        GrntExp: grntExp || null,
        Notes: notes || "",
      });
    }

    console.log("newBatches", newBatches);

    setRows((prevRows) => [...prevRows, ...newBatches]);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${numBatches} batch(es) created`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleRemoveRow = (id) => {
    setRows((prevRows) => prevRows.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    Swal.fire({
      title: "Clear All Batches?",
      text: "This removes all generated batches",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear",
    }).then((result) => {
      if (result.isConfirmed) {
        setRows([]);
        setGeneratedCount(0);
        setRemainingQty(Quantity);
        setEnteredQty(Quantity);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Cleared",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleFieldChange = (id, field, value) => {

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDateChange = (field, date, row) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, [field]: date ? dayjs(date).toISOString() : null }
          : r
      )
    );
  };
  const handleSubmit = () => {
    if (rows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Batches",
        text: "Generate at least one batch",
        toast: true,
        position: "center",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    const batchData = {
      Ids,
      generatedCount,
      oBatchLines: rows.map((batch) => ({
        id: batch.id,
        BatchNum: batch.BatchNum,
        BatchQty: batch.BatchQty,
        BinCode: batch.BinCode || binCode || "",
        ExpDate: batch.ExpDate
          ? dayjs(batch.ExpDate).format("YYYY-MM-DD")
          : null,
        PrdDate: batch.PrdDate
          ? dayjs(batch.PrdDate).format("YYYY-MM-DD")
          : null,
        InDate: batch.InDate
          ? dayjs(batch.InDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        GrntStart: batch.GrntStart
          ? dayjs(batch.GrntStart).format("YYYY-MM-DD")
          : null,
        GrntExp: batch.GrntExp
          ? dayjs(batch.GrntExp).format("YYYY-MM-DD")
          : null,
        Notes: batch.Notes || notes || "",
        Status: "1",
        Direction: "1",
        ItemCode,
        ItemName,
        WHSCode,
        CardName,
      })),
    };
    onSubmit(batchData);
    DialogClosePayto();
  };

  const columns = [
    {
      field: "BatchNum",
      headerName: "BATCH NAME",
      flex: 1,
      width: 150,
      renderCell: (params) => (
        <InputTextField
          name="BatchNum"
          defaultValue={params.value || ""}
          onBlur={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
    {
      field: "BatchQty",
      headerName: "QTY",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "BinCode",
      headerName: "BIN",
      flex: 1,
      width: 130,
      renderCell: (params) => (
        <TextField
          size="small"
          fullWidth
          value={params.value || ""}
          onChange={(e) =>
            handleFieldChange(params.id, "BinCode", e.target.value)
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedRowId(params.id);
                    setBinLineOpen(true);
                  }}
                  sx={{ bgcolor: "success.main", color: "white", p: 0.5 }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ),
    },
    {
      field: "PrdDate",
      headerName: "MFG DATE",
      width: 150,
      flex: 1,
      editable: false,
      renderCell: (params) => (
        <InputDatePickerFields
          name="PrdDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("PrdDate", date, params.row)}
        />
      ),
    },
    {
      field: "ExpDate",
      headerName: "EXPIRY DATE",
      width: 150,
      editable: false,
      flex: 1,
      renderCell: (params) => (
        <InputDatePickerFields
          name="ExpDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("ExpDate", date, params.row)}
          minDate={params.row.PrdDate ? dayjs(params.row.PrdDate) : null}
        />
      ),
    },
    {
      field: "GrntStart",
      headerName: "MFG WTY START DATE",
      width: 150,
      editable: false,
      flex: 1,
      renderCell: (params) => (
        <InputDatePickerFields
          name="GrntStart"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("GrntStart", date, params.row)}
        />
      ),
    },
    {
      field: "GrntExp",
      headerName: "MFG WTY END DATE",
      width: 150,
      editable: false,
      flex: 1,
      renderCell: (params) => (
        <InputDatePickerFields
          name="GrntExp"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("GrntExp", date, params.row)}
          minDate={params.row.GrntStart ? dayjs(params.row.GrntStart) : null}
        />
      ),
    },
    {
      field: "Notes",
      headerName: "REMARKS",
      flex: 1,
      width: 130,
      renderCell: (params) => (
        <InputTextField
          name="Notes"
          defaultValue={params.value || ""}
          onBlur={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
    {
      field: "action",
      headerName: "ACTION",
      flex: 0.4,
      minWidth: 70,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => handleRemoveRow(params.id)}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const SeriesRowInput = ({
    row,
    index,
    onChange,
    onTypeChange,
    onSeqChange,
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        // "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={index === 0 ? "Pre" : "Suf"}
          size="small"
          sx={{
            fontWeight: 500,
            fontSize: "0.75rem",
            bgcolor: index === 0 ? "primary.50" : "secondary.50",
            color: index === 0 ? "primary.main" : "secondary.main",
          }}
        />
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={row.type}
            onChange={(e) => onTypeChange(index, e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="N">Num</MenuItem>
            <MenuItem value="T">Text</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          fullWidth
          defaultValue={row.serial}
          onBlur={(e) => onChange(index, e.target.value)}
          placeholder={row.type === "N" ? "100" : "BATCH"}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={row.sequence}
            onChange={(e) => onSeqChange(index, e.target.value)}
            disabled={row.type === "T"}
            sx={{ borderRadius: 2 }}
          >
            {/* <MenuItem value="N">None</MenuItem> */}
            <MenuItem value="I">Inc</MenuItem>
            <MenuItem value="D">Dec</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );

  const SectionCard = ({ title, icon, children, color = "primary" }) => (
    <StyledCard elevation={0} color={color}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 40, height: 40 }}>
            {icon}
          </Avatar>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color={`${color}.main`}
          >
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </StyledCard>
  );

  const selectBinCode = (DocEntry, binCodeValue) => {
    setBinCode(binCodeValue);
    setWhscOpen(false);
  };

  const selectLineBinCode = (binCodeValue) => {
    if (!selectedRowId) return;
    handleFieldChange(selectedRowId, "BinCode", binCodeValue);
    setBinLineOpen(false);
  };

  const {
    data: BinDataHeader,
    hasMore: BinHasMoreGetList,
    query: BinGetListQuery,
    onSearch: handleBinGetListSearch,
    onClear: handleBinGetListClear,
    fetchMore: fetchBinMoreGetListData,
  } = useParameterApiCalling({
    url: "/BinLocationV2/GetByWHSCode/",
    defaultParams: { WHSCode: WHSCode, Status: 1 },
    limit: 20,
  });

  const {
    data: BinDataLine,
    hasMore: BinLineHasMoreGetList,
    query: BinLineGetListQuery,
    onSearch: handleBinLineGetListSearch,
    onClear: handleBinLineGetListClear,
    fetchMore: fetchBinLineMoreGetListData,
  } = useParameterApiCalling({
    url: "/BinLocationV2/GetByWHSCode/",
    defaultParams: { WHSCode: WHSCode, Status: 1 },
    limit: 20,
  });

  return (
    <>
      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="Bin Location"
        onChange={(e) => handleBinGetListSearch(e.target.value)}
        value={BinGetListQuery}
        onClickClear={handleBinGetListClear}
        cardData={
          <InfiniteScroll
            dataLength={BinDataHeader.length}
            next={fetchBinMoreGetListData}
            hasMore={BinHasMoreGetList}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            endMessage={
              <Typography textAlign="center">No More Records</Typography>
            }
          >
            {BinDataHeader.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.BinCode}
                searchResult={BinGetListQuery}
                onClick={() => selectBinCode(item.DocEntry, item.BinCode)}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={openBinLine}
        onClose={() => setBinLineOpen(false)}
        onCancel={() => setBinLineOpen(false)}
        title="Bin Location"
        onChange={(e) => handleBinLineGetListSearch(e.target.value)}
        value={BinLineGetListQuery}
        onClickClear={handleBinLineGetListClear}
        cardData={
          <InfiniteScroll
            dataLength={BinDataLine.length}
            next={fetchBinLineMoreGetListData}
            hasMore={BinLineHasMoreGetList}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            endMessage={
              <Typography textAlign="center">No More Records</Typography>
            }
          >
            {BinDataLine.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.BinCode}
                searchResult={BinLineGetListQuery}
                onClick={() => selectLineBinCode(item.BinCode)}
              />
            ))}
          </InfiniteScroll>
        }
      />

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
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}
              >
                <InventoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {Title}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip
                    label={ItemCode}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                  <Chip
                    label={WHSCode}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                  {CardName && (
                    <Chip
                      label={CardName}
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
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

        <DialogContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            mb={2}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ExitToAppIcon color="primary" />
            Batch Intake
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <InfoIcon color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Progress
              </Typography>
            </Stack>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    bgcolor: "success.50",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={500}
                    color="success.main"
                  >
                    {generatedCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    bgcolor: "warning.50",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={500}
                    color="warning.main"
                  >
                    {remainingQty}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Remaining
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    bgcolor: "primary.50",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={500}
                    color="primary.main"
                  >
                    {ValueFormatter(Quantity, 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">
                  {Math.round(progress)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {TwoFormatter(generatedCount)} / {TwoFormatter(Quantity)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background:
                      "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                  },
                }}
              />
            </Box>
          </Paper>

          {remainingQty < Quantity && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {rows.length} batch(es) created. Remaining: {remainingQty}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                }}
                onClick={() => setOpenSBL((p) => !p)}
              >
                <QrCodeIcon color="primary" />
                Batch Generation Rules
                <IconButton size="small">
                  <GridExpandMoreIcon
                    sx={{
                      transform: openSBL ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  />
                </IconButton>
              </Typography>
            </Stack>
            <Collapse in={openDates}>
              <Grid container gap={2}>
                <Grid container spacing={3} mb={2} lg={6}>
                  <Grid item xs={12} lg={12}>
                    <SectionCard
                      title="Date Configuration"
                      icon={<CalendarTodayIcon />}
                      color="warning"
                      action={
                        <IconButton
                          size="small"
                          onClick={() => setOpenDates((p) => !p)}
                        >
                          <GridExpandMoreIcon
                            sx={{
                              transform: openDates
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "0.3s",
                            }}
                          />
                        </IconButton>
                      }
                    >
                      <Collapse in={openDates}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <RoundedTextField
                              fullWidth
                              size="small"
                              type="number"
                              label="ENTER QTY"
                              value={EnteredQty}
                              onChange={handleEnteredQtyChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <InventoryIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <RoundedTextField
                              fullWidth
                              size="small"
                              type="number"
                              name="BatchNum"
                              label="NO. OF BATCH"
                              value={BatchNum}
                              onChange={(e) => setBatchNum(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <InventoryIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          {[
                            {
                              name: "InDate",
                              label: "Intake",
                              value: inDate,
                              onChange: setInDate,
                            },
                            {
                              name: "PrdDate",
                              label: "MFG",
                              value: prdDate,
                              onChange: setPrdDate,
                            },
                            {
                              name: "ExpDate",
                              label: "Expiry",
                              value: expDate,
                              onChange: setExpDate,
                              minDate: prdDate ? dayjs(prdDate) : null,
                            },
                            {
                              name: "GrntStart",
                              label: "Warranty Start",
                              value: grntStart,
                              onChange: setGrntStart,
                            },
                            {
                              name: "GrntExp",
                              label: "Warranty End",
                              value: grntExp,
                              onChange: setGrntExp,
                              minDate: grntStart ? dayjs(grntStart) : null,
                            },
                          ].map((field) => (
                            <Grid item xs={12} sm={6} md={4} key={field.name}>
                              <InputDatePickerFields
                                name={field.name}
                                label={field.label}
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) =>
                                  field.onChange(
                                    date
                                      ? dayjs(date).format("YYYY-MM-DD")
                                      : null
                                  )
                                }
                                minDate={field.minDate}
                              />
                            </Grid>
                          ))}

                          <Grid item xs={12} sm={6}>
                            <RoundedTextField
                              fullWidth
                              size="small"
                              label="Bin Location"
                              value={binCode}
                              onChange={(e) => setBinCode(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <WarehouseIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => setWhscOpen(true)}
                                      sx={{
                                        bgcolor: "primary.main",
                                        color: "white",
                                        "&:hover": { bgcolor: "primary.dark" },
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <RoundedTextField
                              fullWidth
                              size="small"
                              label="Notes / Remarks"
                              defaultValue={notes}
                              onBlur={(e) => setNotes(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DescriptionIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Collapse>
                    </SectionCard>
                  </Grid>
                </Grid>
                <Grid container spacing={2} lg={6}>
                  <Grid item xs={12} md={12} lg={12}>
                    <SectionCard
                      title="Batch Number"
                      icon={<QrCodeIcon />}
                      color="primary"
                    >
                      {BatchRows.map((row, idx) => (
                        <SeriesRowInput
                          key={idx}
                          row={row}
                          index={idx}
                          fieldName="serial"
                          onChange={handleBatchValueChange}
                          onTypeChange={handleBatchTypeChange}
                          onSeqChange={handleBatchSeqChange}
                        />
                      ))}
                    </SectionCard>
                  </Grid>
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

          <Collapse in={openSBL} timeout="auto" unmountOnExit>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <SectionCard
                  title="Batch Data"
                  icon={<QrCodeIcon />}
                  color="success"
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row?.id}
                    pageSize={5}
                    hideFooterSelectedRowCount
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    autoHeight={false}
                    sx={{ height: 250 }}
                  />
                </SectionCard>
              </Grid>
            </Grid>
          </Collapse>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
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
            onClick={handleSaveBatches}
            disabled={remainingQty === 0}
            startIcon={<CheckCircleIcon />}
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              },
            }}
          >
            Generate Batch
          </ActionButton>
          <ActionButton
            variant="contained"
            onClick={handleSubmit}
            disabled={rows.length === 0}
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
export default BatchIntake;
