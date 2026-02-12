import ViewListIcon from "@mui/icons-material/ViewList";
import {
    alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  InputDatePickerFields,
  InputTextField,
  SelectedDatePickerField,
} from "./formComponents";

import AddIcon from "@mui/icons-material/Add";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import CardComponent from "./CardComponent";
import SearchModel from "./SearchModel";

const AutoCreaeSerial = ({
  ItemCode,
  Quantity,
  WhsCode,
  ItemName,
  onSubmit,
  Title,
  openserialmodal,
  DataSerial=[],
  DialogClosePayto,

}) => {
  const { control, handleSubmit,  } = useForm();
    const theme = useTheme();
  
  let [openserialList, setopenserialList] = useState(false);
  const SerialTableClose = () => setopenserialList(false);
  const [serialRowsData, setSerialRowsData] = useState([]);
  const [PrdDate, setPrdDate] = useState("");
  const [InDate, setInDate] = useState(null);
  const [ExpDate, setExpDate] = useState(null);
  const [GrntStart, setGrntStart] = useState(null);
  const [GrntExp, setGrntExp] = useState(null);
  const [Notes, setNotes] = useState("");
  const [ReaminingQty, setQtyRaming] = useState("");
  const [TotalQty, setTotalQty]=useState(Quantity)
   const timeoutRef = useRef(null);
   const [openWhsc, setWhscOpen] = useState(false);
   const [selectedRowId, setSelectedRowId] = useState(null);
   const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
   const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
   const [BinCodeData,setBinCode]=useState("")
  const SerialCol = (handleDateChange) => [
    //    {
    //   id: 1,
    //   field: "id",
    //   headerName: "LINE NO",
    //   width: 50,
    //   renderCell: (params) => <span>{params.id}</span>,
    // },
      {
      field: "IntrSerial",
      headerName: "SERIAL NO",
      width: 150,
      renderCell: (params) => (
        <InputTextField
          name="IntrSerial"
          value={params.value || ""}
          disabled={params.row.Status === "0"}
          onChange={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
     {
      field: "BatchId",
      headerName: "LOT NO.",
      width: 130,
      renderCell: (params) => (
        <InputTextField
          name="BatchId"
          value={params.value || ""}
          onChange={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
    {
      field: "SuppSerial",
      headerName: "MFR SERIAL NO",
      width: 150,
      renderCell: (params) => (
        <InputTextField
          name="SuppSerial"
          value={params.value || ""}
          onChange={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
  {
  field: "BinCode",
  headerName: "Bin Code",
  width: 220,
  editable: false,
  renderCell: (params) => {
    const rowId = params.id;
    const value = params.row.BinCode;

    return (
      <InputTextField
        value={value || ""}
        title={value || ""}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setSelectedRowId(rowId); // ✅ store which row is being edited
                  setWhscOpen(true);
                }}
                size="small"
                sx={{
                  backgroundColor: "green",
                  borderRadius: "10%",
                  color: "white",
                  p: 0.5,
                }}
              >
                <ViewListIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  },
}
,
    {
      field: "PrdDate",
      headerName: "MFG DATE",
      width: 150,
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
      renderCell: (params) => (
        <InputDatePickerFields
          name="ExpDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("ExpDate", date, params.row)}
           minDate={
        params.row.PrdDate ? dayjs(params.row.PrdDate) : null
      }
        />
      ),
    },
    {
      field: "GrntStart",
      headerName: "MFG WTY START DATE",
      width: 150,  
      editable: false,
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
      renderCell: (params) => (
        <InputDatePickerFields
          name="GrntExp"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) => handleDateChange("GrntExp", date, params.row)}
              minDate={
        params.row.GrntStart ? dayjs(params.row.GrntStart) : null
      }
        />
      ),
    },
    {
      field: "Notes",
      headerName: "REMARKS",
      width: 130,
      renderCell: (params) => (
        <InputTextField
          name="Notes"
          value={params.value || ""}
          onChange={(e) =>
            handleFieldChange(params.id, params.field, e.target.value)
          }
        />
      ),
    },
  ];


  const handleChange = (e) => {
    const value = e.target.value;
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    if (numericValue > ReaminingQty ) return;

    // setQtyRaming(Quantity - value)
    setTotalQty(value);
  };


  const handleDateChange = (fieldName, date, row) => {
    const updatedValue = date ? dayjs(date).format("YYYY-MM-DD") : "";

    setSerialRowsData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              [fieldName]: updatedValue,
            }
          : r
      )
    );
  };

  // 🔹 For text input fields
  const handleFieldChange = (id, field, value) => {
    setSerialRowsData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleFormSubmit = (data) => {
    // onSubmit(data);
    DialogClosePayto();
  };

  // ---------------- STATE ----------------

  const [serialRows, setSerialRows] = useState([
    { type: "N", serial: "", sequence: "T" },
    { type: "T", serial: "", sequence: "N" },
  ]);
  const [lotRows, setLotRows] = useState([
    { type: "N", lot: "", sequence: "N" },
    { type: "T", lot: "", sequence: "N" },
  ]);
  const [mfgRows, setMfgRows] = useState([
    { type: "N", mfg: " ", sequence: "N" },
    { type: "T", mfg: "", sequence: "N" },
  ]);

  // ===== SERIAL NUMBER =====
  const handleSerialTypeChange = (index, e) => {
    const newType = e.target.value;
    const newRows = [...serialRows];
    newRows[index].type = newType;

    const currentSerial = newRows[index].serial;
    if (newType === "N" && /[^0-9]/.test(currentSerial)) {
      newRows[index].serial = "";
     newRows[index].sequence = "I"
    }
    if (newType === "T" && /[^a-zA-Z]/.test(currentSerial)) {
      newRows[index].serial = "";
    }
    if (newType === "T") newRows[index].sequence = "N";
    if (newType === "N") newRows[index].sequence = "I";
    setSerialRows(newRows);
  };

  const handleSerialValueChange = (index, e) => {
    const value = e.target.value;
    const newRows = [...serialRows];
    if (newRows[index].type === "N") {
      newRows[index].serial = value.replace(/[^0-9]/g, "");
    } else if (newRows[index].type === "T") {
      newRows[index].serial = value.replace(/[^a-zA-Z]/g, "");
    } else {
      newRows[index].serial = value;
    }

    setSerialRows(newRows);
  };

  const handleSerialSeqChange = (index, e) => {
    const newRows = [...serialRows];
    newRows[index].sequence = e.target.value;
    setSerialRows(newRows);
  };

  // ===== LOT NUMBER =====
  const handleLotTypeChange = (index, e) => {
    const newType = e.target.value;
    const newRows = [...lotRows];
    newRows[index].type = newType;

    const currentValue = newRows[index].lot;
    if (newType === "N" && /[^0-9]/.test(currentValue)) {
      newRows[index].lot = "";
    }
    if (newType === "T" && /[^a-zA-Z]/.test(currentValue)) {
      newRows[index].lot = "";
    }

    if (newType === "T") newRows[index].sequence = "N";
    setLotRows(newRows);
  };

  const handleLotValueChange = (index, e) => {
    const value = e.target.value;
    const newRows = [...lotRows];

    if (newRows[index].type === "N") {
      newRows[index].lot = value.replace(/[^0-9]/g, "");
    } else if (newRows[index].type === "T") {
      newRows[index].lot = value.replace(/[^a-zA-Z]/g, "");
    } else {
      newRows[index].lot = value;
    }

    setLotRows(newRows);
  };

  const handleLotSeqChange = (index, e) => {
    const newRows = [...lotRows];
    newRows[index].sequence = e.target.value;
    setLotRows(newRows);
  };

  // ===== MFG SERIAL =====
  const handleMfgTypeChange = (index, e) => {
    const newType = e.target.value;
    const newRows = [...mfgRows];
    newRows[index].type = newType;

    const currentValue = newRows[index].mfg;
    if (newType === "N" && /[^0-9]/.test(currentValue)) {
      newRows[index].mfg = "";
    }
    if (newType === "T" && /[^a-zA-Z]/.test(currentValue)) {
      newRows[index].mfg = "";
    }

    if (newType === "T") newRows[index].sequence = "N";
    setMfgRows(newRows);
  };

  const handleMfgValueChange = (index, e) => {
    const value = e.target.value;
    const newRows = [...mfgRows];

    if (newRows[index].type === "N") {
      newRows[index].mfg = value.replace(/[^0-9]/g, "");
    } else if (newRows[index].type === "T") {
      newRows[index].mfg = value.replace(/[^a-zA-Z]/g, "");
    } else {
      newRows[index].mfg = value;
    }

    setMfgRows(newRows);
  };

  const handleMfgSeqChange = (index, e) => {
    const newRows = [...mfgRows];
    newRows[index].sequence = e.target.value;
    setMfgRows(newRows);
  };

  const generateSeries = (rows, qty, key) => {
    const result = [];
    for (let i = 0; i < qty; i++) {
      let value = "";
      rows.forEach((row) => {
        const baseValue = row[key] || "";
        if (row.type === "N") {
          const baseNum = parseInt(baseValue) || "";
          if (row.sequence === "I") value += baseNum + i;
          else if (row.sequence === "D") value += baseNum - i;
          else value += baseNum;
        } else if (row.type === "T") {
          value += baseValue;
        }
      });
      result.push(value);
    }
    return result;
  };
  const handleCreateAll = async() => {
    const qty = Number(TotalQty);


//  if (!qty || qty <= 0) {
//   Swal.fire({
//     title: "Invalid Quantity",
//     text: "Please enter a valid quantity greater than zero.",
//     icon: "warning",
//     confirmButtonText: "OK",
//   });
//   return;
// }


  Swal.fire({
    title: "Generating Series...",
    text: "Please wait while rows are being prepared.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const serialGenerated = await new Promise((resolve) =>
    setTimeout(() => resolve(generateSeries(serialRows, qty, "serial")), 100)
  );

    // const serialGenerated = generateSeries(serialRows, qty, "serial");
    const lotGenerated = generateSeries(lotRows, qty, "lot");
  //  const lotGenerated=  await new Promise((resolve) =>
  //   setTimeout(() => resolve(generateSeries(lotRows, qty, "lot")), 100)
  // );
    const mfgGenerated = generateSeries(mfgRows, qty, "mfg");
  //     const mfgGenerated = await new Promise((resolve) =>
  //   setTimeout(() => resolve(generateSeries(mfgRows, qty, "mfg")), 100)
  // );
    const combinedData = serialGenerated.map((serial, index) => ({
      id: index + 1,
      SuppSerial: mfgGenerated[index] || "",
      IntrSerial: serial || "",
      BatchId: lotGenerated[index] || "",
      Notes: Notes || "",
      ItemCode: DataSerial[0]?.ItemCode ?? "",
      ItemName:DataSerial[0]?.ItemName ?? "",
      Quantity: DataSerial[0]?.Quantity ?? "",
      WhsCode: DataSerial[0]?.WhsCode ?? "",
    //   BaseType: BaseType,
    //   BaseEntry: BaseEntry,
    //   BinCode:BinCodeData,
    //   BaseNum: BaseNum,
    //   BaseLinNum: BaseLinNum,
    //   CardCode: CardCode,
    //   CardName: CardName,
    //   Direction: Direction,
    //   TtlQuantity: TtlQuantity,
    //   Ids:Ids,
    //   BsDocType: BsDocType,
    //   BsDocEntry: BsDocEntry,
    //   BsDocLine: BsDocLine,
      InDate: InDate ? dayjs(InDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      PrdDate: PrdDate ? dayjs(PrdDate).format("YYYY-MM-DD") : null,
      ExpDate: ExpDate ? dayjs(ExpDate).format("YYYY-MM-DD") : null,
      GrntStart: GrntStart ? dayjs(GrntStart).format("YYYY-MM-DD") :null,
      GrntExp: GrntExp ? dayjs(GrntExp).format("YYYY-MM-DD") : null,
    }));
 
  setSerialRowsData((prev) => [...(prev || []), ...combinedData]);
  
  const remaining = ReaminingQty - qty;
  setQtyRaming(remaining > 0 ? remaining : 0);
  setTotalQty(0)

   Swal.close();
    setopenserialList(true);
//  if (ReaminingQty===0) {
//   Swal.fire({
//     title: "Quantity Exceeded",
//     text: `Entered quantity  cannot  remaining quantity 0 or Clear the.`,
//     icon: "error",
//     confirmButtonText: "OK",
//   });
//   return;
// }
  // ✅ Success message
  // Swal.fire({
  //   title: "Completed!",
  //   text: "Series generated successfully.",
  //   icon: "success",
  //   // timer:100
  // });
  //   setSerialRowsData(combinedData);
  //   const Reming= ReaminingQty -qty 
  //   setQtyRaming(Reming)
    onSubmit(combinedData);
    DialogClosePayto()
    //   dataFinalSerial(combinedData)

  };


  useEffect(() => {
    if (openserialmodal) {
      setSerialRows([
        { type: "N", serial: "", sequence: "N" },
        { type: "T", serial: "", sequence: "N" },
      ]);
      setLotRows([
        { type: "N", lot: "", sequence: "N" },
        { type: "T", lot: "", sequence: "N" },
      ]);
      setMfgRows([
        { type: "N", mfg: "", sequence: "N" },
        { type: "T", mfg: "", sequence: "N" },
      ]);
      setPrdDate("");
      setInDate(null);
      setExpDate(null);
      setGrntStart(null);
      setGrntExp(null);
      setNotes("");
      setSerialRowsData([]); // Clear generated table
    }
  }, [openserialmodal]);

 
  const handleSerialSave = (savedRows) => {
    setSerialRowsData(savedRows);
    // if (onSubmit) {
    //   onSubmit(savedRows);
    // }
    setopenserialList(false);
    DialogClosePayto();
  };

     const fetchWhscGetListData = async (pageNum, searchTerm = "",) => {
        try {
        const { data } = await apiClient.get(
        `/BinLocationV2/GetByWHSCode/`,{
           params:{
           WHSCode:WhsCode,
           Status:1,
           Page:pageNum,
           SearchText:searchTerm
          }
        })
    
          if (data.success) {
            const newData = data.values;
            setWhsHasMoreGetList(newData.length === 20);
           
            setWhscGetListData((prev) =>
              pageNum === 0 ? newData : [...prev, ...newData]
            );
      
          return newData.length
          } else if (data.success === false) {
            Swal.fire({
              text: data.message,
              icon: "question",
              confirmButtonText: "YES",
              showConfirmButton: true,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      const handleWhscGetListSearch = (res) => {
        setWhsGetListQuery(res);
        setWhsGetListSearching(true);
        setWhsGetListPage(0);
        setWhscGetListData([]);
        // Clear the previous timeout if it exists
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
    
        timeoutRef.current = setTimeout(() => {
          fetchWhscGetListData(0, res);
        }, 600);
      };
    
      const handleWhscGetListClear = () => {
        setWhsGetListQuery("");
        setWhsGetListSearching(true);
        setWhsGetListPage(0); // Reset page to 0
        setWhscGetListData([]); // Clear current data
        fetchWhscGetListData(0); // Fetch first page without search
      };
    
      const fetchWhscMoreGetListData = () => {
        fetchWhscGetListData(
          WhsgetListPage + 1,
          WhsgetListSearching ? WhsrgetListquery : ""
        );
        setWhsGetListPage((prev) => prev + 1);
      };
      useEffect(() => {
        fetchWhscGetListData(0); // Load first page on mount
        setQtyRaming(Quantity)
        setTotalQty(Quantity)
        // setBinCode(BinCode)
      }, [openserialmodal]);

 const selectBinCode = (DocEntry, binCodeValue) => {
  setWhscOpen(false);

  if(!openserialList){
  setBinCode(binCodeValue);
  }


  if (!selectedRowId) return; // safety check
  handleFieldChange(selectedRowId, "BinCode", binCodeValue);
}

      const Clearallocation=()=>{
       setQtyRaming(Quantity)
       setTotalQty(Quantity)
       setSerialRowsData([])
      }

      const getFinalPreview = () => {
  return serialRows
    .map((row) => {
      // If TEXT → return text as it is
      if (row.type === "T") {
        return row.serial || "";
      }

      // If NUMBER → return number + sequence (+ or -)
      if (row.type === "N") {
        // const seqSymbol = row.sequence === "I" ? "+" : "-";
        return `${row.serial}`;
      }

      return "";
    })
    .join(""); // space between parts
};

  return (
    <>

     <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="BinLocation"
        onChange={(e) => handleWhscGetListSearch(e.target.value)}
        value={WhsrgetListquery}
        onClickClear={handleWhscGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={WhscgetListData.length}
            next={fetchWhscMoreGetListData}
            hasMore={WhshasMoreGetList}
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
            {WhscgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.BinCode}
                searchResult={WhsrgetListquery}
                onClick={() => {
                  selectBinCode(item.DocEntry,item.BinCode);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />


      <Dialog
        open={openserialmodal}
        // onClose={DialogClosePayto}
        scroll="paper"
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            minHeight: "50vh",
            maxHeight: "90vh",
            minWidth: "90vh",
            maxWidth: "140vh",
          },
        }}
      >
        <DialogTitle>
          <Grid item display="flex" justifyContent="center">
            <Typography color="primary" variant="h6" fontWeight="600" textAlign="center"  fontSize="18px">

              {Title}
            </Typography>
          </Grid>
            <IconButton
                    onClick={Clearallocation}
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
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              padding: 2,
              boxShadow: 2,
              //    mb: 2,
            }}
          >
            <Grid container spacing={2}>
              {/* ---------- Row 1 ---------- */}
              <Grid item xs={12} sm={6} md={3}>
                <InputTextField
                  fullWidth
                  name="ItemCode"
                  label="ITEM NO."
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.ItemCode ?? ""}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InputTextField
                  name="ItemName"
                  fullWidth
                  label="ITEM DESC"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.ItemName ?? ""}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InputTextField
                  fullWidth
                  name="Quantity"
                  label="TOTAL QTY"
                  variant="outlined"
                  readOnly={true}
                  size="small"
                  value={DataSerial[0]?.Quantity ?? ""}
                //   InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <SelectedDatePickerField
                  fullWidth
                  name="InDate"
                  label="INWARD DATE"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.InDate ?? dayjs(undefined).format("YYYY-MM-DD")}
                  onChange={(newDate) => setInDate(newDate)}
                />
              </Grid>

              {/* ---------- Row 2 ---------- */}
              <Grid item xs={12} sm={6} md={3}>
                <SelectedDatePickerField
                  fullWidth
                  name="PrdDate"
                  label="MFG DATE"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.PrdDate ??  dayjs(undefined).format("YYYY-MM-DD")}
                  onChange={(newDate) => setPrdDate(newDate)}
                  // minDate={dayjs()}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <SelectedDatePickerField
                  fullWidth
                  name="ExpDate"
                  label="EXPIRY DATE"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.ExpDate ?? dayjs(undefined).format("YYYY-MM-DD")}
                  onChange={(newDate) => setExpDate(newDate)}
                    minDate={PrdDate || dayjs()} // can't choose before MFG date

                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <SelectedDatePickerField
                  fullWidth
                  name="GrntStart"
                  label="MFG WTY START DATE"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.GrntStart ?? dayjs(undefined).format("YYYY-MM-DD")}
                  onChange={(newDate) => setGrntStart(newDate)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <SelectedDatePickerField
                  fullWidth
                  name="GrntExp"
                  label="MFG WTY END DATE"
                  variant="outlined"
                  size="small"
                  value={DataSerial[0]?.GrntExp ??  dayjs(undefined).format("YYYY-MM-DD")}
                  onChange={(newDate) => setGrntExp(newDate)}
                  minDate={GrntStart}
                />
              </Grid>
              {/* <Grid item xs={3}>
                <InputTextField
                  name="Direction"
                  label="DIRECTION"
                  variant="outlined"
                  size="small"
                  fullWidth
                  readOnly
                //   value={Direction}
                />
              </Grid> */}
                <Grid item xs={3}>
                <InputTextField
                  name="QTY"
                  label="REMAINING"
                  variant="outlined"
                  size="small"
                  fullWidth
                   value={ReaminingQty}
                   readOnly
                //  onChange={handleChange}
                  // value={Direction}
                />
              </Grid>
              <Grid item xs={3}>
                <InputTextField
                  name="Notes"
                  label="REMARKS"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={DataSerial[0]?.Notes ?? ""}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <Divider sx={{ my: 2 }} />

        <DialogContent>
          <Grid container spacing={2}>
            <Grid   container
  item
  xs={10}
  sx={{ display: "flex", gap: 2 }}  >
                <InputTextField
                  name="QTY"
                  label="ENTER QUANTITY"
                  variant="outlined"
                  size="small"
                  fullWidth
                   value={TotalQty}
                 onChange={handleChange}
                  // value={Direction}
                />
                 <InputTextField
                                  label="BIN LOCATION"
                                  readOnly={true}
                                  value={BinCodeData}
                                  title={BinCodeData}
                                  InputProps={{
                                    readOnly: true, 
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton color="primary">
                                        </IconButton>
                                        <IconButton
                                          onClick={()=>setWhscOpen(true)}
                                          size="small"
                                          style={{
                                            backgroundColor: "green",
                                            borderRadius: "10%",
                                            color: "white",
                                            padding: 2,
                                          }}
                                        >
                                          <ViewListIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                /></Grid>
               
            <Grid item xs={12} md={4}>
              
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  padding: 2,
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                  align="center"
                >
                  SERIAL NUMBER
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
  
                  {serialRows.map((row, index) => (
                    <Grid container item xs={12} spacing={2} key={index}>
                      {/* Type Dropdown */}
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="TYPE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.type}
                          onChange={(e) => handleSerialTypeChange(index, e)}
                        >
                          <MenuItem value="T">TEXT</MenuItem>

                          <MenuItem value="N">NO</MenuItem>
                        </TextField>
                      </Grid>

                      {/* SerialIntake Input */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="ENTER SERIAL"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={row.serial}
                          onChange={(e) => handleSerialValueChange(index, e)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="SEQUENCE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.sequence} // removed logic for "N"
                          onChange={(e) => handleSerialSeqChange(index, e)}
                          disabled={row.type === "T"}
                        >
                          <MenuItem value="I">+</MenuItem>
                          <MenuItem value="D">-</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* ================= LOT NUMBER SECTION ================= */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  padding: 2,
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                  align="center"
                >
                  LOT NUMBER
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {lotRows.map((row, index) => (
                    <Grid container item xs={12} spacing={2} key={index}>
                      {/* Type Dropdown */}
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="TYPE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.type}
                          onChange={(e) => handleLotTypeChange(index, e)}
                        >
                          <MenuItem value="N">NO</MenuItem>
                          <MenuItem value="T">TEXT</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Lot Name Input */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="LOT NAME"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={row.lot}
                          onChange={(e) => handleLotValueChange(index, e)}
                        />
                      </Grid>

                      {/* Sequence Dropdown */}
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="SEQUENCE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.type === "T" ? "N" : row.sequence}
                          onChange={(e) => handleLotSeqChange(index, e)}
                          disabled={row.type === "T"}
                        >
                          <MenuItem value="N">none</MenuItem>
                          <MenuItem value="I">+</MenuItem>
                          <MenuItem value="D">-</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* ================= MFG SERIAL NUMBER SECTION ================= */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  padding: 2,
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                  align="center"
                >
                  MFG SERIAL NUMBER
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {mfgRows.map((row, index) => (
                    <Grid container item xs={12} spacing={2} key={index}>
                      {/* Type Dropdown */}
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="TYPE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.type}
                          onChange={(e) => handleMfgTypeChange(index, e)}
                        >
                          <MenuItem value="N">NO</MenuItem>
                          <MenuItem value="T">TEXT</MenuItem>
                        </TextField>
                      </Grid>

                      {/* MFG Input */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="ENTER MFG"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={row.mfg}
                          onChange={(e) => handleMfgValueChange(index, e)}
                        />
                      </Grid>

                      {/* Sequence Dropdown */}
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="SEQUENCE"
                          variant="outlined"
                          size="small"
                          fullWidth
                          select
                          value={row.type === "T" ? "N" : row.sequence}
                          onChange={(e) => handleMfgSeqChange(index, e)}
                          disabled={row.type === "T"}
                        >
                          <MenuItem value="N">none</MenuItem>
                          <MenuItem value="I">+</MenuItem>
                          <MenuItem value="D">-</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider sx={{ my: 2 }} />
        {/* Final String Display */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="info.main"
                  gutterBottom
                >
                    Final String : {getFinalPreview()}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  Review and confirm your serial number configuration before
                  saving.
                </Typography> */}
              </Paper>

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
              onClick={handleCreateAll}
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

export default AutoCreaeSerial;
