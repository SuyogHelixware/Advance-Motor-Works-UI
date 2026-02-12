import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import FactoryIcon from "@mui/icons-material/Factory";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import QrCodeIcon from "@mui/icons-material/QrCode";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DeleteIcon from "@mui/icons-material/Delete";

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
  Typography,
  useTheme,
} from "@mui/material";
import MuiPagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  GridExpandMoreIcon,
  gridPageCountSelector,
  gridPageSelector,
  GridToolbarQuickFilter,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import { useParameterApiCalling } from "../../Hooks/useParameterApiCalling";
import CardComponent from "./CardComponent";
import {
  InputDatePickerFields,
  InputTextField,
  ModelInputTextField,
} from "./formComponents";
import SearchModel from "./SearchModel";
import Swal from "sweetalert2";
import { ValueFormatter } from "./ValueFormatter";
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

function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const handleChange = (event, value) => {
    apiRef.current.setPage(value - 1); // ✅ directly update page via apiRef
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
const SerialIntake = ({
  Title = "SERIAL NUMBER",
  openserialmodal,
  DialogClosePayto,
  onSubmit,
  ItemCode,
  ItemName,
  Quantity,
  WhsCode,
  BaseType,
  BaseEntry,
  BaseNum,
  BaseLinNum,
  CardCode,
  CardName,
  Direction,
  TtlQuantity,
  BsDocType,
  BsDocEntry,
  BsDocLine,
  BinCode,
  oSerialLines = [],
  Ids,
}) => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalQty, setTotalQty] = useState("");
  const [notes, setNotes] = useState("");
  const [inDate, setInDate] = useState(new Date().toISOString().split("T")[0]);
  const [prdDate, setPrdDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [grntStart, setGrntStart] = useState("");
  const [grntExp, setGrntExp] = useState("");
  const [binCode, setBinCode] = useState("");
  const [openDates, setOpenDates] = useState(true);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [openSBL, setOpenSBL] = useState(true);
  const theme = useTheme();
  const [openWhsc, setWhscOpen] = useState(false);
  const [openBinLine, setBinLineOpen] = useState(false);
  const [serialRows, setSerialRows] = useState([
    { type: "N", serial: "", sequence: "I" },
    { type: "T", serial: "", sequence: "N" },
  ]);

  const [lotRows, setLotRows] = useState([
    { type: "N", lot: "", sequence: "I" },
    { type: "T", lot: "", sequence: "N" },
  ]);

  const [mfgRows, setMfgRows] = useState([
    { type: "N", mfg: "", sequence: "I" },
    { type: "T", mfg: "", sequence: "N" },
  ]);

  const [generatedData, setGeneratedData] = useState([]);

  console.log("sdfds", generatedData);
  // Initialize values when modal opens
  useEffect(() => {
    if (openserialmodal) {
      setTotalQty(Quantity - oSerialLines.length);
      setBinCode(BinCode || "");
      setGeneratedCount(oSerialLines.length);
      setGeneratedData(oSerialLines);
    }
  }, [openserialmodal, Quantity, BinCode]);

  const remainingQty = (Quantity || 0) - generatedCount;
  const progress = Quantity > 0 ? (generatedCount / Quantity) * 100 : 0;

  // Generate series logic
  const generateSeries = (rows, qty, key) => {
    const result = [];
    for (let i = 0; i < qty; i++) {
      let value = "";
      rows.forEach((row) => {
        const baseValue = row[key] || "";
        if (row.type === "N") {
          const baseNum = parseInt(baseValue) || 0;
          if (row.sequence === "I") value += (baseNum + i).toString();
          else if (row.sequence === "D") value += (baseNum - i).toString();
          else value += baseNum.toString();
        } else if (row.type === "T") {
          value += baseValue;
        }
      });
      result.push(value);
    }
    return result;
  };

  // const handleGenerate = () => {
  //   const qty = Number(totalQty);
  //   if (!qty || qty <= 0 || qty > remainingQty) {
  //     alert(`Please enter a valid quantity between 1 and ${remainingQty}`);
  //     return;
  //   }
  // Swal.fire({
  //   title: "Generating Series...",
  //   text: "Please wait while rows are being prepared.",
  //   allowOutsideClick: false,
  //   didOpen: () => {
  //     Swal.showLoading();
  //   },
  // });
  //   const serialGenerated = generateSeries(serialRows, qty, "serial");
  //   const lotGenerated = generateSeries(lotRows, qty, "lot");
  //   const mfgGenerated = generateSeries(mfgRows, qty, "mfg");

  //   const newData = serialGenerated.map((serial, index) => ({
  //     id: generatedData.length + index + 1,
  //     serial: serial || "",
  //     lot: lotGenerated[index] || "",
  //     mfg: mfgGenerated[index] || "",
  //     binCode: binCode,
  //     inDate: inDate,
  //     prdDate: prdDate,
  //     expDate: expDate,
  //     grntStart: grntStart,
  //     grntExp: grntExp,
  //     notes: notes,
  //   }));

  //   setGeneratedData([...generatedData, ...newData]);
  //   setGeneratedCount(generatedCount + qty);
  //   setTotalQty((remainingQty - qty).toString());
  // };
  const handleGenerate = async () => {
    const qty = Number(totalQty);
    if (!qty || qty <= 0 || qty > remainingQty) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: `Please enter a valid quantity between 1 and ${remainingQty}`,
        confirmButtonText: "OK",
      });
      return;
    }

    // Show loader
    Swal.fire({
      title: "Generating Series...",
      text: "Please wait while rows are being prepared.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Give Swal time to render before heavy computation
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Generate series
    const serialGenerated = generateSeries(serialRows, qty, "serial");
    const lotGenerated = generateSeries(lotRows, qty, "lot");
    const mfgGenerated = generateSeries(mfgRows, qty, "mfg");
    const newData = serialGenerated.map((serial, index) => ({
      id: generatedData.length + index + 1,
      serial: serial || "",
      lot: lotGenerated[index] || "",
      mfg: mfgGenerated[index] || "",
      binCode: binCode,
      inDate: inDate,
      prdDate: prdDate,
      expDate: expDate,
      grntStart: grntStart,
      grntExp: grntExp,
      notes: notes,
    }));

    // Update state
    setGeneratedData([...generatedData, ...newData]);
    setGeneratedCount(generatedCount + qty);
    setTotalQty((remainingQty - qty).toString());

    // Close loader
    Swal.close();
  };

  const handleClearAll = () => {
    setSerialRows([
      { type: "N", serial: "", sequence: "I" },
      { type: "T", serial: "", sequence: "N" },
    ]);
    setLotRows([
      { type: "N", lot: "", sequence: "I" },
      { type: "T", lot: "", sequence: "N" },
    ]);
    setMfgRows([
      { type: "N", mfg: "", sequence: "I" },
      { type: "T", mfg: "", sequence: "N" },
    ]);
    setGeneratedData([]);
    setGeneratedCount(0);
    setTotalQty(Quantity?.toString() || "");
    setNotes("");
    setPrdDate("");
    setExpDate("");
    setGrntStart("");
    setGrntExp("");
  };

  const handleSubmit = () => {
    if (generatedData.length === 0) {
      alert("Please generate at least one serial number");
      return;
    }

    const serialData = {
      Ids,
      generatedCount,
      serials: generatedData.map((se) => ({
        id: se.id,
        SuppSerial: se?.mfg ?? "",
        IntrSerial: se?.serial ?? "", // Serial Number
        BatchId: se?.lot ?? "", // Lot Number
        ExpDate: dayjs(se.expDate).isValid()
          ? dayjs(se.expDate).format("YYYY-MM-DD")
          : null, // Expiry Date (use Date or dayjs)
        PrdDate: dayjs(se.prdDate).isValid()
          ? dayjs(se.prdDate).format("YYYY-MM-DD")
          : null, // Manufacturing Date
        InDate: dayjs(se.inDate).isValid()
          ? dayjs(se.inDate).format("YYYY-MM-DD")
          : null, // Admission Date
        GrntStart: dayjs(se.grntStart).isValid()
          ? dayjs(se.grntStart).format("YYYY-MM-DD")
          : null, // Mfr Warranty Start Date
        GrntExp: dayjs(se.grntExp).isValid()
          ? dayjs(se.grntExp).format("YYYY-MM-DD")
          : null, // Mfr Warranty End Date
        Notes: se?.notes ?? "", // Details / Remarks
        Quantity: "0", // Quantity
        BaseType: "", // Base Doc. ObjectType
        BaseEntry: "", // Base Document DocEntry
        BaseNum: "", // Base Document Number
        BaseLinNum: "0", // Row No. in Base Document
        CreateDate: null, // Creation Date
        CardCode: "", // Card Code
        CardName: "", // Card Name
        ItemName: "", // Item Description / Name
        Status: "1", // Status
        Direction: "1", // Direction
        TtlQuantity: "0",
      })),
    };

    onSubmit(serialData);
    console.log("serialData", serialData);

    DialogClosePayto();
  };

  const SectionCard = ({ title, icon, children, color = "primary" }) => (
    <StyledCard elevation={0} color={color}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 44,
              height: 44,
              boxShadow: `0 4px 12px ${color}.main40`,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={`${color}.main`}
            >
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure generation rules
            </Typography>
          </Box>
        </Stack>
        {children}
      </CardContent>
    </StyledCard>
  );

  const SeriesRowInput = ({
    row,
    index,
    onChange,
    onTypeChange,
    onSeqChange,
    fieldName,
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 1.5,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        transition: "all 0.2s",
        // "&:hover": {
        //   bgcolor: "grey.100",
        //   borderColor: "primary.light",
        // },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={index === 0 ? "Pre" : "Suf"}
          size="small"
          sx={{
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 28,
            bgcolor: index === 0 ? "primary.50" : "secondary.50",
            color: index === 0 ? "primary.main" : "secondary.main",
          }}
        />
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={row.type}
            onChange={(e) => onTypeChange(index, e.target.value)}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              fontSize: "0.875rem",
            }}
          >
            <MenuItem value="N">Num</MenuItem>
            <MenuItem value="T">Text</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          fullWidth
          defaultValue={row[fieldName]}
          onBlur={(e) => onChange(index, e.target.value)}
          placeholder={row.type === "N" ? "1000" : "SN"}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
              fontSize: "0.875rem",
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <Select
            value={row.sequence}
            onChange={(e) => onSeqChange(index, e.target.value)}
            disabled={row.type === "T"}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              fontSize: "0.875rem",
            }}
          >
            <MenuItem value="N">None</MenuItem>
            <MenuItem value="I">Inc</MenuItem>
            <MenuItem value="D">Dec</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );

  const handleSerialChange = (index, value) => {
    const newRows = [...serialRows];
    if (newRows[index].type === "N") {
      newRows[index].serial = value.replace(/[^0-9]/g, "");
    } else {
      newRows[index].serial = value.replace(/[^a-zA-Z]/g, "");
    }
    setSerialRows(newRows);
  };

  const handleSerialTypeChange = (index, value) => {
    const newRows = [...serialRows];
    newRows[index].type = value;
    if (value === "T") newRows[index].sequence = "N";
    if (value === "N") newRows[index].sequence = "I";
    setSerialRows(newRows);
  };

  const handleSerialSeqChange = (index, value) => {
    const newRows = [...serialRows];
    newRows[index].sequence = value;
    setSerialRows(newRows);
  };

  const handleFieldChange = (id, field, value) => {
    setGeneratedData((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleDateChange = (field, date, row) => {
    setGeneratedData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, [field]: date ? dayjs(date).toISOString() : null }
          : r,
      ),
    );
  };
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
  const SerialCol = [
    // { field: "id", headerName: "#", width: 70 },
    {
      field: "serial",
      headerName: "Serial No",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <ModelInputTextField
          name="serial"
          defaultValue={params.row.serial}
          onBlur={(e) => handleFieldChange(e, params.row)}
        />
      ),
    },

    {
      field: "lot",
      headerName: "LOT NO.",
      width: 130,
      renderCell: (params) => (
        <InputTextField
          name="BatchId"
          defaultValue={params.value || ""}
          onBlur={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
    {
      field: "mfg",
      headerName: "MFR SERIAL NO",
      width: 150,
      renderCell: (params) => (
        <InputTextField
          name="SuppSerial"
          defaultValue={params.value || ""}
          onBlur={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
    {
      field: "binCode",
      headerName: "Bin Code",
      width: 220,
      editable: false,
      renderCell: (params) => {
        const rowId = params.id;
        const value = params.row.binCode;

        return (
          <InputTextField
            value={value || ""}
            title={value || ""}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedRowId(rowId); // ✅ store row id
                      setBinLineOpen(true); // ✅ open modal
                    }}
                    sx={{
                      backgroundColor: "green",
                      borderRadius: "10%",
                      color: "white",
                      p: 0.5,
                      "&:hover": {
                        backgroundColor: "darkgreen",
                      },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
      },
    },
    {
      field: "prdDate",
      headerName: "MFG DATE",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <InputDatePickerFields
          name="prdDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("prdDate", date, params.row)}
        />
      ),
    },
    {
      field: "expDate",
      headerName: "EXPIRY DATE",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <InputDatePickerFields
          name="expDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("expDate", date, params.row)}
          minDate={params.row.PrdDate ? dayjs(params.row.PrdDate) : null}
        />
      ),
    },
    {
      field: "grntStart",
      headerName: "MFG WTY START DATE",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <InputDatePickerFields
          name="grntStart"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("grntStart", date, params.row)}
        />
      ),
    },
    {
      field: "grntExp",
      headerName: "MFG WTY END DATE",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <InputDatePickerFields
          name="grntExp"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("grntExp", date, params.row)}
          minDate={params.row.GrntStart ? dayjs(params.row.GrntStart) : null}
        />
      ),
    },
    {
      field: "notes",
      headerName: "REMARKS",
      width: 130,
      renderCell: (params) => (
        <InputTextField
          name="notes"
          value={params.value || ""}
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

  const handleRemoveRow = (id) => {
    const deletedrow = generatedData.filter((r, i) => r.id !== id);
    setGeneratedData(deletedrow);
    setTotalQty(Quantity - deletedrow.length);
    setGeneratedCount(deletedrow.length);
  };

  const selectBinCode = (DocEntry, binCodeValue) => {
    setBinCode(binCodeValue);
    setWhscOpen(false);
  };
  const selectLineBinCode = (binCodeValue) => {
    if (!selectedRowId) return;

    // setGeneratedData(selectedRowId, "BinCode", binCodeValue);
    handleFieldChange(selectedRowId, "binCode", binCodeValue);
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
    defaultParams: {
      WHSCode: WhsCode,
      Status: 1,
    },
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
    defaultParams: {
      WHSCode: WhsCode,
      Status: 1,
    },
    limit: 20,
  });

  return (
    <>
      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="BinLocation"
        onChange={(e) => handleBinGetListSearch(e.target.value)}
        value={BinGetListQuery}
        onClickClear={handleBinGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={BinDataHeader.length}
            next={fetchBinMoreGetListData}
            hasMore={BinHasMoreGetList}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {BinDataHeader.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.BinCode}
                searchResult={BinGetListQuery}
                onClick={() => {
                  selectBinCode(item.DocEntry, item.BinCode);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={openBinLine}
        onClose={() => setBinLineOpen(false)}
        onCancel={() => setBinLineOpen(false)}
        title="BinLocation"
        onChange={(e) => handleBinLineGetListSearch(e.target.value)}
        value={BinLineGetListQuery}
        onClickClear={handleBinLineGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={BinDataLine.length}
            next={fetchBinLineMoreGetListData}
            hasMore={BinLineHasMoreGetList}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {BinDataLine.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.BinCode}
                searchResult={BinLineGetListQuery}
                onClick={() => {
                  selectLineBinCode(item.BinCode);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
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
                    label={WhsCode}
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

        <DialogContent sx={{ p: 3, bgcolor: "background.paper" }}>
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
          >
            <ExitToAppIcon color="primary" />
            Series IN
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              mb: 2,
              borderRadius: 2,
              bgcolor: "background.paper",

              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <InfoIcon color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Generation Progress
              </Typography>
            </Stack>
            <Grid container spacing={3} mb={1}>
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
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
                    fontWeight={300}
                    color="warning.main"
                  >
                    {remainingQty}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={300}
                  >
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
                    fontWeight={300}
                    color="primary.main"
                  >
                    {ValueFormatter(Quantity, 0)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={300}
                  >
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="caption" fontWeight={300}>
                  {Math.round(progress)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {generatedCount} / {Quantity}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
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

          {/* Date Information */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Date Configuration
              </Typography>
              <IconButton onClick={() => setOpenDates((p) => !p)}>
                <GridExpandMoreIcon
                  sx={{
                    transform: openDates ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </IconButton>
            </Stack>
            <Collapse in={openDates}>
              <Grid container spacing={2}>
                {[
                  {
                    name: "InDate",
                    label: "Intake Date",
                    value: inDate,
                    onChange: setInDate,
                  },
                  {
                    name: "PrdDate",
                    label: "MFG Date",
                    value: prdDate,
                    onChange: setPrdDate,
                  },
                  {
                    name: "ExpDate",
                    label: "Expiry Date",
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
                ].map((field, idx) => (
                  <Grid item xs={12} sm={6} md={2.4} key={idx}>
                    <InputDatePickerFields
                      name={field.name}
                      label={field.label}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(
                          date ? dayjs(date).format("YYYY-MM-DD") : null,
                        )
                      }
                      minDate={field.minDate}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Input Fields */}
              <Grid container spacing={2} mt={1.5}>
                <Grid item xs={12} sm={4}>
                  <RoundedTextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity to Generate"
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
                <Grid item xs={12} sm={4}>
                  <RoundedTextField
                    fullWidth
                    size="small"
                    label="Bin Location"
                    value={binCode}
                    onChange={(e) => setBinCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WarehouseIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              "&:hover": { bgcolor: "primary.dark" },
                            }}
                          >
                            <AddIcon
                              fontSize="small"
                              onClick={() => setWhscOpen(true)}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <RoundedTextField
                    fullWidth
                    size="small"
                    label="Notes / Remarks"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

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
            Series Generation Rules
            <IconButton size="small">
              <GridExpandMoreIcon
                sx={{
                  transform: openSBL ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.3s",
                }}
              />
            </IconButton>
          </Typography>

          <Collapse in={openSBL} timeout="auto" unmountOnExit>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={4}>
                <SectionCard
                  title="Serial Number"
                  icon={<QrCodeIcon />}
                  color="primary"
                >
                  {serialRows.map((row, idx) => (
                    <SeriesRowInput
                      key={idx}
                      row={row}
                      index={idx}
                      fieldName="serial"
                      onChange={handleSerialChange}
                      onTypeChange={handleSerialTypeChange}
                      onSeqChange={handleSerialSeqChange}
                    />
                  ))}
                </SectionCard>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <SectionCard
                  title="Lot Number"
                  icon={<InventoryIcon />}
                  color="warning"
                >
                  {lotRows.map((row, idx) => (
                    <SeriesRowInput
                      key={idx}
                      row={row}
                      index={idx}
                      fieldName="lot"
                      onChange={(i, v) => {
                        const newRows = [...lotRows];
                        if (newRows[i].type === "N") {
                          newRows[i].lot = v.replace(/[^0-9]/g, "");
                        } else {
                          newRows[i].lot = v.replace(/[^a-zA-Z]/g, "");
                        }
                        setLotRows(newRows);
                      }}
                      onTypeChange={(i, v) => {
                        const newRows = [...lotRows];
                        newRows[i].type = v;
                        if (v === "T") newRows[i].sequence = "N";
                        if (v === "N") newRows[i].sequence = "I";
                        setLotRows(newRows);
                      }}
                      onSeqChange={(i, v) => {
                        const newRows = [...lotRows];
                        newRows[i].sequence = v;
                        setLotRows(newRows);
                      }}
                    />
                  ))}
                </SectionCard>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <SectionCard
                  title="MFG Serial"
                  icon={<FactoryIcon />}
                  color="success"
                >
                  {mfgRows.map((row, idx) => (
                    <SeriesRowInput
                      key={idx}
                      row={row}
                      index={idx}
                      fieldName="mfg"
                      onChange={(i, v) => {
                        const newRows = [...mfgRows];
                        if (newRows[i].type === "N") {
                          newRows[i].mfg = v.replace(/[^0-9]/g, "");
                        } else {
                          newRows[i].mfg = v.replace(/[^a-zA-Z]/g, "");
                        }
                        setMfgRows(newRows);
                      }}
                      onTypeChange={(i, v) => {
                        const newRows = [...mfgRows];
                        newRows[i].type = v;
                        if (v === "T") newRows[i].sequence = "N";
                        if (v === "N") newRows[i].sequence = "I";
                        setMfgRows(newRows);
                      }}
                      onSeqChange={(i, v) => {
                        const newRows = [...mfgRows];
                        newRows[i].sequence = v;
                        setMfgRows(newRows);
                      }}
                    />
                  ))}
                </SectionCard>
              </Grid>
            </Grid>
          </Collapse>
          {/* Generated Data Preview */}
          {generatedData.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 3,
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              {/* Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography variant="h6" fontWeight={600}>
                  Generated Series ({generatedData.length})
                </Typography>
                {/* {generatedData.slice(-5).map((item) => ( <Chip key={item.id} label={#${item.id}: ${item.serial} | ${item.lot} | ${item.mfg}} size="small" sx={{ m: 0.5 }} /> ))} */}
              </Stack>

              {/* DataGrid */}
              <Box sx={{ height: 520, width: "100%" }}>
                <DataGrid
                  rows={generatedData}
                  columns={SerialCol}
                  getRowId={(row) => row.id}
                  /* Pagination */
                  pagination
                  slots={{
                    toolbar: QuickFilterToolbar,
                    pagination: CustomPagination, // ✅ fixed pagination slot
                  }}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  }}
                  pageSizeOptions={[10, 25]}
                  rowCount={generatedData.length}
                  /* Performance */
                  disableRowSelectionOnClick
                  rowHeight={52}
                  columnHeaderHeight={40}
                  sx={{
                    border: "none",
                    bgcolor: "background.paper",
                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: "background.default",
                      color: "text.primary",
                      fontWeight: 600,
                    },
                    "& .MuiDataGrid-cell": {
                      py: 0.5,
                      color: "text.primary",
                    },
                    "& .MuiDataGrid-row:hover": {
                      bgcolor: "action.hover",
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "1px solid",
                      borderColor: "divider",
                      minHeight: 48,
                    },
                  }}
                />
              </Box>
            </Paper>
          )}
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
            onClick={handleGenerate}
            disabled={remainingQty === 0}
            startIcon={<CheckCircleIcon />}
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              },
            }}
          >
            Generate Series
          </ActionButton>
          <ActionButton
            variant="contained"
            onClick={handleSubmit}
            disabled={generatedData.length === 0}
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
export default SerialIntake;
