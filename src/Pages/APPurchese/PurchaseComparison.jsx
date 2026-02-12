import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from "@mui/x-data-grid-premium";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardCopyFrom from "../Components/CardCopyFrom";
import {
  InputSelectTextField,
  ModelInputSelectTextField,
  ModelInputText,
} from "../Components/formComponents";
import { CopyFromSearchModel } from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import DynamicLoader from "../../Loaders/DynamicLoader";
import { TwoFormatter } from "../Components/ValueFormatter";

export default function PurchaseComparison() {
  useEffect(() => {
    const hideWarning = () => {
      const warningDiv = document.querySelector(
        'div[style*="color: rgba(130, 130, 130, 0.62)"][style*="position: absolute"]'
      );
      if (
        warningDiv &&
        warningDiv.textContent.includes("MUI X Missing license key")
      ) {
        warningDiv.style.display = "none"; // Just hide it instead of removing
      }
    };

    hideWarning();

    const observer = new MutationObserver(hideWarning);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(141);
  const [checkedItems, setCheckedItems] = useState({});
  const [openDialog, setOpenDialog] = useState(true);
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [OlinesData, setOlines] = useState([]);
  const [selectedRowsData, setSelectedRow] = useState([]);
  const [type, setType] = useState("I");
  const [allRowData, setrowData] = useState([]);
   const [clearCache, setClearCache] = useState(false);
  // const [DocSeries, setDocumentSeries] = useState([]);
    const [apiloading, setapiloading] = useState(false);
  const timeoutRef = useRef(null);
  const { control, handleSubmit, getValues, watch, setValue } = useForm({
    defaultValues: {
      isOpenFilter: true,
      Price: true,
      QuatedDate: true,
      Quantity: true,
    },
  });
    const { DocSeries } = useDocumentSeries(
      "22",
      dayjs(undefined).format("YYYY-MM-DD"),
      setValue,
      clearCache,
      "SAVE",
    );
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    const isOpenFilter = getValues("isOpenFilter");
    try {
      const url = `/PurchaseQuotation/Get?searchText=${searchTerm}&Status=1&isOpenFilter=${isOpenFilter}&page=${pageNum}&limit=20&docType=${type}`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      } else if (response.data.success === false) {
        Swal.fire({
          text: response.data.message,

          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // const DocumentSeries = async () => {
  //   try {
  //     const res = await apiClient.get(`/DocSeries/ByTransId/22`);
  //     const response = res.data;
  //     if (response.success === true) {
  //       setDocumentSeries(response.values);
  //       setValue("Series", response.values[0].DocEntry);
  //       setValue("DocNum", response.values[0].DocNum);
  //     } else if (response.success === false) {
  //       Swal.fire({
  //         title: "Error!",
  //         text: response.message,
  //         icon: "warning",
  //         confirmButtonText: "Ok",
  //       });
  //     }
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Error!",
  //       text: error,
  //       icon: "error",
  //       confirmButtonText: "Ok",
  //     });
  //   }
  // };
  // Initial fetch

  


  useEffect(() => {
    // Reset openListData to an empty array when filters change
    setCheckedItems({});
    setOlines([]);
    setrowData([]);
    setOpenListData([]);
    // DocumentSeries();
    setHasMoreOpen(true); // Ensure that infinite scroll shows more records again
    fetchOpenListData(0); // Load the first page of data when filters change
  }, [type, watch("isOpenFilter")]);

  const handleQautation = () => {
    setrowData(OlinesData);
    setOpenDialog(false);
  };

  const onClickQuotationData = useCallback((e, item, index) => {
    const checked = e.target.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [index]: checked, // Update specific checkbox state
      };
      return newCheckedItems;
    });

    if (checked) {
      
      setOlines((prevOlines) => {
        const newOlines = [
          
          ...prevOlines,
          
          ...item.oLines.map((obj) => ({
            ...obj,
            CardCode: item.CardCode,
            CardName: item.CardName,
            DocType: item.DocType,
        //         Series:
        // isFirstRow && index === 0
        //   ? DocSeries?.[0]?.DocEntry ?? "0"
        //   : "0",

        //        PoDocNum:
        // isFirstRow && index === 0
        //   ? DocSeries?.[0]?.DocNum ?? "0"
        //   : "0",
            DocNum: item.DocNum,
            UserId: item.UserId,
            CreatedBy: item.CreatedBy,
            ModifiedBy: item.ModifiedBy,
            Status: item.Status,
            NumAtCard: item.NumAtCard,
            DocDate: item.DocDate,
            DocDueDate: item.DocDueDate,
            TaxDate: item.TaxDate,
            CurSource: item.CurSource,
            DocCur: item.DocCur,
            DocRate: item.DocRate,
            PaidToDate: item.PaidToDate,
            Address2: item.Address2,
            Address: item.Address,
            PayToCode: item.PayToCode,
            TrnspCode: item.TrnspCode,
            AttcEntry: item.AttcEntry,
            TotalBefDisc: item.TotalBefDisc,
            TotalBefDiscSy: item.TotalBefDiscSy,
            TotalBefDiscFrgn: item.TotalBefDiscFrgn,
            Discount: item.Discount,
            DiscountAmt: item.DiscountAmt,
            RoundDif: item.RoundDif,
            VatSum: item.VatSum,
            TotalExpns: item.TotalExpns,
            CntctCode: item.CntctCode,
            SlpCode: item.SlpCode,
            TaxOnExp: item.TaxOnExp,
            Comments: item.Comments,
            DocTotalSy: item.DocTotalSy,
            DocTotal: item.DocTotal,
            DocTotalFC: item.DocTotalFC,
            DpmVat: item.DpmVat,
            PaidFC: item.PaidFC,
            Serial: item.Serial,
            DpmAppl: item.DpmAppl,
            PaidDpm: item.PaidDpm,
            PaidSum: item.PaidSum,
            SysRate: item.SysRate,
            TransId: item.TransId,
            CANCELED: item.CANCELED,
            PORevise: item.PORevise,
            VatPaid: item.VatPaid,
            BankCode: item.BankCode,
            BaseDisc: item.BaseDisc,
            BnkCntry: item.BnkCntry,
            DpmDrawn: item.DpmDrawn,
            DpmPrcnt: item.DpmPrcnt,
            DpmVatFc: item.DpmVatFc,
            DpmVatSc: item.DpmVatSc,
            FolioNum: item.FolioNum,
            GroupNum: item.GroupNum,
            JrnlMemo: item.JrnlMemo,
            PaidDpmF: item.PaidDpmF,
            PaidDpmS: item.PaidDpmS,
            VatSumFC: item.VatSumFC,
            VatSumSy: item.VatSumSy,
            BnkBranch: item.BnkBranch,
            DiscSumFC: item.DiscSumFC,
            DiscSumSy: item.DiscSumSy,
            DpmAmntSC: item.DpmAmntSC,
            DpmApplFc: item.DpmApplFc,
            DpmApplSc: item.DpmApplSc,
            DpmAppVat: item.DpmAppVat,
            DpmStatus: item.DpmStatus,
            ExtraDays: item.ExtraDays,
            FolioPref: item.FolioPref,
            PaidSumFc: item.PaidSumFc,
            PaidSumSc: item.PaidSumSc,
            TaxOnExAp: item.TaxOnExAp,
            ToBinCode: item.ToBinCode,
            VatPaidFC: item.VatPaidFC,
            BaseDiscFc: item.BaseDiscFc,
            BaseDiscPr: item.BaseDiscPr,
            BaseDiscSc: item.BaseDiscSc,
            BnkAccount: item.BnkAccount,
            CheckDigit: item.CheckDigit,
            FC: item.FC,
            DpmAppVatF: item.DpmAppVatF,
            DpmAppVatS: item.DpmAppVatS,
            ExtraMonth: item.ExtraMonth,
            GrosProfFC: item.GrosProfFC,
            GrosProfit: item.GrosProfit,
            PayDuMonth: item.PayDuMonth,
            ReceiptNum: item.ReceiptNum,
            RoundDifFC: item.RoundDifFC,
            RoundDifSy: item.RoundDifSy,
            ShipToCode: item.ShipToCode,
            TaxOnExApF: item.TaxOnExApF,
            TaxOnExApS: item.TaxOnExApS,
            TaxOnExpFc: item.TaxOnExpFc,
            TaxOnExpSc: item.TaxOnExpSc,
            TotalExpFC: item.TotalExpFC,
            TotalExpSC: item.TotalExpSC,
            VatPaidSys: item.VatPaidSys,
            ShipMode: item.ShipMode || "0",
            SAPDocNum: item.SAPDocNum,
            Sy: item.Sy || "0",
            SAPDocEntry: item.SAPDocEntry,
            WeightUnit: item.WeightUnit,
            oLines: item.oLines,
            oExpLines: item.oExpLines,
            oTaxExtLines: item.oTaxExtLines,
            oPaymentLines: item.oPaymentLines,
            oDPLines: item.oDPLines,
          })),
        ];
        return Array.from(
          new Map(newOlines.map((obj) => [JSON.stringify(obj), obj])).values()
        );
      });
    } else {
      setOlines((prevOlines) =>
        prevOlines.filter(
          (line) => !item.oLines.some((ol) => ol.LineNum === line.LineNum)
        )
      );
    }
  }, []);

  const ClearForm = () => {
    setOlines([]);
    setrowData([]);
    setCheckedItems({});
  };
  const apiRef = useGridApiRef();

  const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);
  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: {
        model: ["ItemCode", "ServCode"], // Set initial grouping by ItemCode
      },
    },
  });


  const Items = [
    {
      id: 1,
      field: "ItemCode",
      headerName: "ITEM NO",
      width: 100,
      headerClassName: "bold-itemcode-header",
      groupable: true,
    },
    {
      field: "ItemCode",
      headerName: "ItemCode",
      width: 140,
      // You can also make this groupable if needed
    }, // Make ItemCode groupable
    {
      id: 2,
      field: "ItemName",
      headerName: "ITEM DESC",
      width: 140,
      sortable: false,
      // groupable: true, // You can also make this groupable if needed
    },
    {
      field: "DocNum",
      headerName: "QUOTATION DOCNUM",
      width: 140,
      type: "text",
      sortable: false,
    },
    {
      field: "CardCode",
      headerName: "VENDOR CODE",
      width: 100,
      type: "text",
      sortable: false,
      groupable: true, // Enable grouping
    },
    {
      field: "CardName",
      headerName: "VENDOR NAME",
      width: 100,
      type: "text",
      sortable: false,
      groupable: true, // Enable grouping
    },

    {
      field: "PQTReqDate",
      headerName: "REQUIRED DATE",
      width: 140,
      editable: false,
      renderCell: (params) => (
        <span>
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      field: "PQTReqQty",
      headerName: "REQUIRED QTY",
      width: 140,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "shipDate",
      headerName: "DELIVERY DATE",
      width: 140,
      editable: false,
      renderCell: (params) => (
        <span>
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      field: "Quantity",
      headerName: "DELIVERY QTY",
      width: 100,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OpenQuantity",
      headerName: "QTY",
      width: 140,
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
      // renderCell: (params) => (
      //   <>
      //     {params.value ? (
      //       <ModelInputText
      //         name="OpenQuantity"
      //         // type="number"
      //         disabled={params.row.Status === "0"}
      //         value={params.value}
      //         onChange={(e) => handleChange(e, params.row)}
      //       />
      //     ) : (
      //       "-"
      //     )}
      //   </>
      // ),
    },

    {
      field: "PriceBefDi",
      headerName: "PRICE",
      // sortable: false,
      width: 100,
      editable: false,
   renderCell: (params) =>
  params.value == null || params.value === "" ? (
    <span style={{ opacity: 0.6 }}>-</span>
  ) : (
    `${params.row.Currency} ${Number(params.value).toFixed(2)}`
  )
    },
    {
      field: "LineTotal",
      headerName: "AMOUNT",
      type: "number",
      width: 100,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
      // sortable: false,
    },
    {
      field: "OnOrder",
      headerName: "ORDERED QTY",
      width: 100,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
      // sortable: false,
    },
    // {
    //   field: "Series",
    //   headerName: "Series",
    //   width: 150,
    //   editable: false,
    //   renderCell: (params) => (
    //     <>
    //       {params.value ? (
    //         <ModelInputSelectTextField
    //           name="Series"
    //           value={params.value}
    //           onChange={(e) => handleChange(e, params.row)}
    //           data={[
    //             ...(DocSeries || []).map((item) => ({
    //               key: item.DocEntry,
    //               value: item.SeriesName,
    //             })),
    //             { key: "0", value: "MANUAL" },
    //           ]}
    //         />
    //       ) : (
    //         "-"
    //       )}
    //     </>
    //   ),
    // },
    // {
    //   field: "PoDocNum",
    //   headerName: "PoDocNum",
    //   width: 140,
    //   editable: false,
    //   renderCell: (params) => {
    //     const { rowNode, row, value } = params;

    //     // Determine if children exist (rowNode.children is non-empty)
    //     const hasChildren = rowNode?.children && rowNode.children.length > 0;
    //     return !hasChildren ? (
    //       <ModelInputText
    //         name="PoDocNum"
    //         disabled={row.Status === "0"}
    //         value={value}
    //         onChange={(e) => handleChange(e, row)}
    //       />
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
    {
      field: "Status",
      headerName: "STATUS",
      width: 100,
      // sortable: false,
      renderCell: (params) => (
        <span>
          {params.value === "1"
            ? "open"
            : params.value === "0"
            ? "closed"
            : "-"}
        </span>
      ),
    },
  ];
  const Services = [
    { id: 1, field: "ServCode", headerName: "SERVICE CODE", width: 100 },

    {
      id: 2,
      field: "ItemName",
      headerName: "SERVICE NAME",
      width: 150,
      sortable: false,
      editable: false,
    },
    {
      field: "PQTReqDate",
      headerName: "REQUIRED DATE",
      width: 170,
      editable: false,
      renderCell: (params) => (
        <span>
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      field: "shipDate",
      headerName: "DELIVERY DATE",
      width: 170,
      editable: false,
      renderCell: (params) => (
        <span>
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      field: "PriceBefDi",
      headerName: "PRICE",
      // sortable: false,
      width: 100,
      editable: false,
       renderCell: (params) =>
  params.value == null || params.value === "" ? (
    <span style={{ opacity: 0.6 }}>-</span>
  ) : (
    `${params.row.Currency} ${Number(params.value).toFixed(2)}`
  )
      // renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "TaxCode",
      headerName: "TAX CODE",
      width: 120,
      sortable: false,
      editable: false,
    },

    {
      field: "Discount",
      headerName: "DISC(%)",
      width: 100,
      sortable: false,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "LineTotal",
      headerName: "TOTAL(LC)",
      type: "number",
      width: 100,
      sortable: false,
      editable: false,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
      // renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    // {
    //   field: "Series",
    //   headerName: "Series",
    //   width: 120,
    //   editable: false,
    //   renderCell: (params) => (
    //     <>
    //       {params.value ? (
    //         <ModelInputSelectTextField
    //           name="Series"
    //           value={params.value }
    //           onChange={(e) => handleChange(e, params.row)}
    //           data={[
    //             ...(DocSeries || []).map((item) => ({
    //               key: item.DocEntry,
    //               value: item.SeriesName,
    //             })),
    //             { key: "0", value: "MANUAL" },
    //           ]}
    //         />
    //       ) : (
    //         "-"
    //       )}
    //     </>
    //   ),
    // },
    // {
    //   field: "PoDocNum",
    //   headerName: "PoDocNum",
    //   width: 140,
    //   editable: false,
    //   renderCell: (params) => {
    //     const { rowNode, row, value } = params;
    //     // Determine if children exist (rowNode.children is non-empty)
    //     const hasChildren = rowNode?.children && rowNode.children.length > 0;
    //     return !hasChildren ? (
    //       <ModelInputText
    //         name="PoDocNum"
    //         disabled={row.Status === "0"}
    //         value={value}
    //         onChange={(e) => handleChange(e, row)}
    //       />
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
  ];
  // const handleChange = (e, row) => {
  //   const { name, value } = e.target;
  //   const updatedRows = allRowData.map((r, index) => {
  //     if (index !== row.id) return r;
  //     const updatedRow = {
  //       ...r,
  //       [name]: value,
  //     };
  //     if (name === "OpenQuantity" && Number(value) > Number(r.Quantity)) {
  //       return r;
  //     }
  //     if (name === "OpenQuantity") {
  //       updatedRow.OpenQuantity = Math.min(Math.max(Number(value), 0));
  //     }
  //     if (name === "Series") {
  //       const seriesData = DocSeries.find(
  //         (item) => item.DocEntry === updatedRow.Series
  //       );
  //       updatedRow.PoDocNum = seriesData?.DocNum || "";
  //     }
  //     return updatedRow;
  //   });
  //   setrowData(updatedRows);
  // };


  const processRowUpdate = (newRow, oldRow) => {
  const updatedRow = { ...newRow };

  // ✅ OpenQuantity validation
  if ("OpenQuantity" in newRow) {
    const value = Number(newRow.OpenQuantity) || 0;
    const maxQty = Number(oldRow.Quantity) || 0;

    if (value > maxQty) {
      return oldRow; // ❌ reject update
    }


    
    updatedRow.OpenQuantity = Math.max(0, value);

    
  }

  // ✅ Series → auto set PoDocNum
  // if (newRow.Series !== oldRow.Series) {
  //   const seriesData = DocSeries.find(
  //     (s) => String(s.DocEntry) === String(newRow.Series)
  //   );

  //   updatedRow.PoDocNum = seriesData?.DocNum ?? "0";
  // }

  return updatedRow;
};

  const handleSelectionChange = (selectedIDs) => {
    console.log(selectedIDs);
    const selectedRows = allRowData.filter((row) =>
      selectedIDs.includes(row.LineNum)
    );
    console.log("======", selectedRows);
    setSelectedRow(selectedRows);
  };

  const CreatePOSubmit = () => {
        // const allHaveWhs = obj.some((line) => line.DocNum !== "");
    if (selectedRowsData.length <= 0) {
      Swal.fire({
        title: "Document",
        text: "Please Select The Document",
        icon: "warning",
        confirmButtonText: "Ok",
        timer: 3000,
      });
      return;
    }
    const obj = selectedRowsData.map((data, index) => ({
      index: index,
      CardCode: data.CardCode,
      CardName: data.CardName,
      DocType: data.DocType,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      Status: data.Status,
      NumAtCard: data.NumAtCard,
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD"),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      CurSource: data.CurSource,
      DocCur: data.DocCur,
      DocRate: data.DocRate,
      PaidToDate: data.PaidToDate,
      Address2: data.Address2,
      Address: data.Address,
      PayToCode: data.PayToCode,
      TrnspCode: data.TrnspCode,
      AttcEntry: data.AttcEntry,
      TotalBefDisc: data.TotalBefDisc,
      TotalBefDiscSy: data.TotalBefDiscSy,
      TotalBefDiscFrgn: data.TotalBefDiscFrgn,
      Discount: data.Discount,
      DiscountAmt: data.DiscountAmt,
      RoundDif: data.RoundDif,
      VatSum: data.VatSum,
      TotalExpns: data.TotalExpns,
      CntctCode: data.CntctCode,
      SlpCode: data.SlpCode,
      TaxOnExp: data.TaxOnExp,
      Comments: data.Comments,
      DocTotalSy: data.DocTotalSy,
      Series: String("-1"),
      DocNum: data.PoDocNum || "0",
      FinncPriod:data.FinncPriod || "0",
      PIndicator:data.PIndicator || "0",
      DocTotal: data.DocTotal,
      DocTotalFC: data.DocTotalFC,
      DpmVat: data.DpmVat,
      PaidFC: data.PaidFC,
      Serial: data.Serial,
      DpmAppl: data.DpmAppl,
      PaidDpm: data.PaidDpm,
      PaidSum: data.PaidSum,
      SysRate: data.SysRate,
      TransId: data.TransId,
      CANCELED: data.CANCELED || "0",
      PORevise: data.PORevise || "0",
      VatPaid: data.VatPaid,
      BankCode: data.BankCode,
      BaseDisc: data.BaseDisc,
      BnkCntry: data.BnkCntry,
      DpmDrawn: data.DpmDrawn,
      DpmPrcnt: data.DpmPrcnt,
      DpmVatFc: data.DpmVatFc,
      DpmVatSc: data.DpmVatSc,
      FolioNum: data.FolioNum,
      GroupNum: data.GroupNum,
      JrnlMemo: data.JrnlMemo,
      PaidDpmF: data.PaidDpmF,
      PaidDpmS: data.PaidDpmS,
      VatSumFC: data.VatSumFC,
      VatSumSy: data.VatSumSy,
      BnkBranch: data.BnkBranch,
      DiscSumFC: data.DiscSumFC,
      DiscSumSy: data.DiscSumSy,
      DpmAmntSC: data.DpmAmntSC,
      DpmApplFc: data.DpmApplFc,
      DpmApplSc: data.DpmApplSc,
      DpmAppVat: data.DpmAppVat,
      DpmStatus: data.DpmStatus,
      ExtraDays: data.ExtraDays,
      FolioPref: data.FolioPref,
      PaidSumFc: data.PaidSumFc,
      PaidSumSc: data.PaidSumSc,
      TaxOnExAp: data.TaxOnExAp,
      ToBinCode: data.ToBinCode,
      VatPaidFC: data.VatPaidFC,
      BaseDiscFc: data.BaseDiscFc,
      BaseDiscPr: data.BaseDiscPr,
      BaseDiscSc: data.BaseDiscSc,
      BnkAccount: data.BnkAccount,
      CheckDigit: data.CheckDigit,
      FC: data.FC || "0",
      DpmAppVatF: data.DpmAppVatF,
      DpmAppVatS: data.DpmAppVatS,
      ExtraMonth: data.ExtraMonth,
      GrosProfFC: data.GrosProfFC,
      GrosProfit: data.GrosProfit,
      PayDuMonth: data.PayDuMonth,
      ReceiptNum: data.ReceiptNum,
      RoundDifFC: data.RoundDifFC,
      RoundDifSy: data.RoundDifSy,
      ShipToCode: data.ShipToCode,
      TaxOnExApF: data.TaxOnExApF,
      TaxOnExApS: data.TaxOnExApS,
      TaxOnExpFc: data.TaxOnExpFc,
      TaxOnExpSc: data.TaxOnExpSc,
      TotalExpFC: data.TotalExpFC,
      TotalExpSC: data.TotalExpSC,
      VatPaidSys: data.VatPaidSys,
      ShipMode: data.ShipMode,
      DpmAmntFC: data.DpmAmntFC || "0",
      Sy: data.Sy,
      SAPDocEntry: data.SAPDocEntry || "0",
      SAPDocNum: data.SAPDocNum || "0",
      WeightUnit: data.WeightUnit,
      ReqDate: data.ReqDate || dayjs(undefined).format("YYYY-MM-DD"),
      DeliveredQty: data?.DeliveredQty ?? "0",
      CdcOffset: data?.CdcOffset ?? "0",
      CancelDate: data.CancelDate || dayjs(undefined).format("YYYY-MM-DD"),
      ExpApplSC: data.ExpApplSC || "0",
      ExpApplFC: data.ExpApplFC || "0",
      ExpAppl: data.ExpAppl || "0",
      PaidSys: data.PaidSys || "0",
      oLines: data.oLines.map((item) => ({
        ...item,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        Quantity: String(data.OpenQuantity),
        ETA: dayjs(undefined).format("YYYY-MM-DD"),
        LastGRNDt: dayjs(undefined).format("YYYY-MM-DD"),
        LineNum: "",
        ReqDate: item.ReqDate || dayjs(undefined).format("YYYY-MM-DD"),
        DeliveredQty: item?.DeliveredQty ?? "0",
        CdcOffset: item?.CdcOffset ?? "0",
        CancelDate: item.CancelDate || dayjs(undefined).format("YYYY-MM-DD"),
        OpenInvQty: item.OpenInvQty || "0",
        LastPurPr: item.LastPurPr || "0",
        Rate: String(item.LastPurPr || "0"),
        BaseDocNum: data.DocNum || "0",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          LineNum: "",
          ExpnsCode: taxItem?.ExpnsCode ?? "0",
          TaxSumSys: taxItem?.TaxSumSys ?? "0",
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          RelateType: "1",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          StaCode: taxItem.StaCode || "",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "",
          TaxSumFrgn: taxItem.TaxSumFrgn || "0",
          BaseSumFrg: taxItem.BaseSumFrg || "0",
          BaseSumSys: taxItem.BaseSumSys || "0",
          VatApplied: taxItem.VatApplied || "0",
          VatAppldFC: taxItem.VatAppldFC || "0",
          VatAppldSC: taxItem.VatAppldSC || "0",
          LineSeq: taxItem.LineSeq || "1",
          DeferrAcct: taxItem.DeferrAcct || "",
          BaseType: taxItem.BaseType || "1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
        })),
      })),
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        LineNum: "",
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      })),
      oExpLines: (data.oExpLines || []).map((oExpLines) => ({
        ...oExpLines,
        ModifiedBy: user.UserName,
        LineNum: "",
        BaseType: oExpLines.BaseType || "-1",
        BaseAbsEnt: oExpLines.BaseAbsEnt || "-1",
        BaseLnNum: oExpLines.BaseLnNum || "-1",
        BaseRef: oExpLines.BaseRef || "0",
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      })),
      oPaymentLines: (data.oPaymentLines || []).map((oPaymentLines) => ({
        ...oPaymentLines,
        ModifiedBy: user.UserName,
        LineNum: "",
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      })),
      oDPLines: (data.oDPLines || []).map((oDPLines) => ({
        ...oDPLines,
        ModifiedBy: user.UserName,
        LineNum: "",
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      })),
    }));

    const objpost = Object(obj);
    console.log("selected Data Create Po", objpost);

    // const allHaveWhs = obj.some((line) => line.DocNum !== "");
    // if (allHaveWhs === false) {
    //   Swal.fire({
    //     title: "Select Series",
    //     text: "Please Select The Series",
    //     icon: "warning",
    //     confirmButtonText: "Ok",
    //     timer: 3000,
    //   });
    //   return;
    // }

        // const allHaveWhs = obj.some((line) => line.DocNum !== "");
    // if (allHaveWhs === false) {
    //   Swal.fire({
    //     title: "Select Series",
    //     text: "Please Select The Series",
    //     icon: "warning",
    //     confirmButtonText: "Ok",
    //     timer: 3000,
    //   });
    //   return;
    // }
    console.log("pod", ...objpost);
    if (obj.length >= 1) {
      apiClient
        .post(`/POV2/bulk`, obj)
        .then((res) => {
          if (res.data.success) {
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Purchase Order saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
              // timer: 1000,
            });
          }
        })
        .catch((error) => {
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    }
  };

  return (
    <>

<DynamicLoader open={apiloading} />
      <CopyFromSearchModel
        open={openDialog}
        onClose={() => {
          console.log("Dialog closing...");
          setOpenDialog(false);
        }}
        onCancel={() => {
          console.log("Dialog canceling...");
          setOpenDialog(false);
        }}
        onChange={(e) => handleOpenListSearch(e.target.value)}
        value={openListquery}
        onClickClear={handleOpenListClear}
        title={"PURCHASE QUOTATIONS"}
        onSave={handleQautation}
        Input={
          <>
            <Grid container mt={1}>
              <Grid item xs={12} md={12} lg={12} sm={12} textAlign={"center"}>
                <Controller
                  name="DocType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      type="text"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      label="ITEM/SERVICE TYPE"
                      data={[
                        { key: "I", value: "ITEM" },
                        { key: "S", value: "SERVICE" },
                      ]}
                      value={type}
                      onChange={(e) => {
                        field.onChange(e);
                        setType(e.target.value);
                        setrowData([]);
                      }}
                      // Manually set the select field value if needed
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={12} lg={12} sm={12} textAlign={"center"}>
                <Controller
                  name="isOpenFilter"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox {...field} checked={field.value || false} />
                      }
                      label="Display Purchase Quotation Open Only"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </>
        }
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={openListData.length}
              next={fetchMoreOpenListData}
              hasMore={hasMoreOpen}
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
              {openListData.map((item, i) => (
                <CardCopyFrom
                  key={i}
                  id={i}
                  title={item.DocNum}
                  subtitle={dayjs(item.DocDate).format("DD/MM/YYYY")}
                  description={dayjs(item.DocDueDate).format("DD/MM/YYYY")}
                  searchResult={openListquery}
                  checked={checkedItems[i] || false}
                  onClick={(e) => {
                    onClickQuotationData(e, item, i);
                    // handleCellClickPurchaseModel(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <Grid container width={"100%"} padding={1} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          // component="form"
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="add"
            onClick={ClearForm}
            sx={{
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
              Purchase Quotation Comparison
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
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 5px)"
              position={"relative"}
            >
              <Box
                // component="form"
                sx={{
                  // "& .MuiTextField-root": { m: 1 , },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid
                  container
                  component="form"
                  // onSubmit={handleSubmit(handleCompare)}
                >
                  <Grid item lg={3} md={6} sm={6} xs={12} textAlign={"center"}>
                    <Checkbox
                      checked={true} // or false
                      readOnly={true}
                      sx={{
                        color:
                          theme.palette.mode === "light"
                            ? "cornflowerblue"
                            : "#3B6DB0",
                        "&.Mui-checked": {
                          color:
                            theme.palette.mode === "light"
                              ? "cornflowerblue"
                              : "#3B6DB0",
                        },
                      }}
                    />
                    Delivery Date
                    {/* />
                      )} */}
                    {/* /> */}
                  </Grid>
                  {type === "I" && (
                    <>
                      <Grid
                        item
                        lg={3}
                        md={6}
                        sm={6}
                        xs={12}
                        textAlign="center"
                      >
                        <Checkbox
                          checked={true} // or false
                          readOnly={true}
                          sx={{
                            color:
                              theme.palette.mode === "light"
                                ? "cadetblue"
                                : "#3B7D7F",
                            "&.Mui-checked": {
                              color:
                                theme.palette.mode === "light"
                                  ? "cadetblue"
                                  : "#3B7D7F",
                            },
                          }}
                        />
                        Quantity
                      </Grid>
                    </>
                  )}
                  <Grid item lg={3} md={6} sm={6} xs={12} textAlign={"center"}>
                    <Checkbox
                      checked={true}
                      disabled={true} // better UX than readOnly
                      sx={{
                        color:
                          theme.palette.mode === "light"
                            ? "greenyellow"
                            : "#4caf50",
                        "&.Mui-checked": {
                          color:
                            theme.palette.mode === "light"
                              ? "greenyellow"
                              : "#4caf50",
                        },
                      }}
                    />
                    Price
                  </Grid>

                  <Grid container mt={2} sx={{ px: 2, width: "100%" }}>
                    <Paper
                      sx={{
                        width: "100%",
                        height: "450px",
                        overflow: "auto",
                      }}
                    >
                      <DataGridPremium
                        columnHeaderHeight={35}
                        rowHeight={45}
                        apiRef={apiRef}
                        rows={allRowData.map((data, index) => ({
                          ...data,
                          id: index,
                        }))}
                        experimentalFeatures={{ newEditingApi: true }}
                        columns={type === "I" ? Items : Services}
                        // disableRowSelectionOnClick
                        getRowId={(row) => row.LineNum || row.id}
                        onRowSelectionModelChange={(selectedIDs) =>
                          handleSelectionChange(selectedIDs)
                        }
                          processRowUpdate={processRowUpdate}
  onProcessRowUpdateError={(error) => console.error(error)}
                        defaultGroupingExpansionDepth={-1}
                        checkboxSelection
                        initialState={initialState}
                        autoHeight={false}
                        // Safer implementation for highlighting max price cells
                        getRowClassName={(params) =>
                          params.row.Status === "0" ? "disabled-row" : ""
                        }
                        slots={{ toolbar: CustomToolbar }}
                        getCellClassName={(params) => {
                          try {
                            const field = params.field;
                            const groupingFields =
                              initialState?.rowGrouping?.model || [];

                            if (groupingFields.length === 0) return "";

                            // Build unique group key from all grouping fields
                            const currentGroupKey = groupingFields
                              .map((f) => params.row[f])
                              .join("||");

                            const rowsInCurrentGroup = allRowData.filter(
                              (row) => {
                                const rowGroupKey = groupingFields
                                  .map((f) => row[f])
                                  .join("||");
                                return rowGroupKey === currentGroupKey;
                              }
                            );

                            // ---- Handle PriceBefDi ----
                            if (field === "PriceBefDi") {
                              const prices = rowsInCurrentGroup.map(
                                (row) => parseFloat(row.PriceBefDi) || 0
                              );
                              const minPrice = Math.min(...prices);
                              const value = params.value;
                              const current =
                                value === "" || value == null
                                  ? 0
                                  : parseFloat(value);

                              // Optional: style empty price separately
                              if (value === "" || value == null) {
                                return "missing-price-cell";
                              }

                              if (current <= minPrice) return "min-price-cell";
                            }

                            // ---- Handle Quantity ----
                            if (field === "Quantity") {
                              const quantities = rowsInCurrentGroup
                                .map((row) => {
                                  const q = parseFloat(row.Quantity);
                                  return isNaN(q) ? null : q;
                                })
                                .filter((q) => q !== null);

                              const maxQty =
                                quantities.length > 0
                                  ? Math.max(...quantities)
                                  : 0;
                              const value = params.value;
                              const current =
                                value === "" || value == null
                                  ? null
                                  : parseFloat(value);

                              if (current === null || isNaN(current)) {
                                return "missing-quantity-cell"; // Optional: style missing quantity
                              }

                              if (current >= maxQty) return "max-quantity-cell";
                            }

                            // ---- Handle shipDate ----
                            if (field === "shipDate") {
                              const shipDates = rowsInCurrentGroup
                                .map((row) => {
                                  const d = new Date(row.shipDate);
                                  return isNaN(d.getTime()) ? null : d;
                                })
                                .filter(Boolean);

                              if (shipDates.length > 0 && params.value) {
                                const earliest = new Date(
                                  Math.min(...shipDates.map((d) => d.getTime()))
                                );
                                const current = new Date(params.value);

                                if (!isNaN(current.getTime())) {
                                  if (
                                    dayjs(current).isSame(
                                      dayjs(earliest),
                                      "day"
                                    )
                                  ) {
                                    return "earliest-shipdate-cell";
                                  }
                                }
                              }
                            }

                            return "";
                          } catch (error) {
                            console.log("Error in cell styling:", error);
                            return "";
                          }
                        }}
                        // Pre-process the component props
                        componentsProps={{
                          cell: {
                            // Safe event handler
                            onFocus: (event) => {
                              try {
                                // Focus handling if needed
                              } catch (error) {
                                console.log("Error in cell focus:", error);
                              }
                            },
                          },
                        }}
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "light" ? "#fff" : "#373842",
                          "& .MuiDataGrid-cell": {
                            border: "none",
                          },
                          "& .MuiDataGrid-cell:focus": {
                            outline: "2px solid green",
                          },
                          "& .disabled-row .MuiDataGrid-cell": {
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "##f2f2f2 !important"
                                : "#080D2B", // ✅ Light gray background
                            opacity: 0.6, // ✅ Reduce visibility
                            pointerEvents: "none", // ✅ Prevent interaction
                          },
                          "& .min-price-cell": {
                            // backgroundColor: "greenyellow",
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "greenyellow"
                                : "#4caf50",
                            fontWeight: "bold",
                          },
                          "& .max-quantity-cell": {
                            // backgroundColor: "#cce5ff",
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "cadetblue"
                                : "#3B7D7F",

                            fontWeight: "bold",
                          },
                          "& .earliest-shipdate-cell": {
                            // backgroundColor: "#fff9c4", // light red
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "cornflowerblue"
                                : "#3B6DB0",

                            fontWeight: "bold",
                          },
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              <Grid
                item
                px={1}
                xs={12}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  position: "sticky",
                  bottom: "0px",
                }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                  >
                    Back
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    disabled={!perms.IsAdd || !perms.IsEdit}
                    onClick={CreatePOSubmit}
                  >
                 
                    Create PO
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
