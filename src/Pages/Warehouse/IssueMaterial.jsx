// import AddIcon from "@mui/icons-material/Add";
// import ClearIcon from "@mui/icons-material/Clear";
// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";
// import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// import { TabContext, TabPanel } from "@mui/lab";
// import {
//   Box,
//   Button,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Tab,
//   Tabs,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import TextField from "@mui/material/TextField";
// import { DataGrid } from "@mui/x-data-grid";
// import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";

// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import dayjs from "dayjs";
// import { useMemo } from "react";
// import Swal from "sweetalert2";
// import useAuth from "../../Routing/AuthContext";
// import apiClient from "../../services/apiClient";
// import { dataGridSx } from "../../Styles/dataGridStyles";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTableSelectField,
//   InputTableTextField,
//   InputTextArea,
//   InputTextField,
//   InputTextSearchButton,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";
// import SearchModel from "../Components/SearchModel";
// import { Loader } from "../Components/Loader";

// export default function IssueMaterial() {
//   const initialFormData = {
//     DocNum: "",
//     OrderDocEntry: "",
//     DocEntry: "",
//     DocDate: dayjs(undefined),
//     OrderNo: "",
//     RequestNo: "",
//     IssueDate: dayjs(undefined),
//     RequestDate: dayjs(undefined),
//     OrderType: "",
//     IssueNO: "",
//     RegistrationNo: "",
//     JobWorkAt: "",
//     InwardNo: "",
//     ReqRemarks: "",
//     RequestBy: "",
//     InvTransferNo: "",
//     HW_WMSStaff: "",
//     IssuedBy: "",
//     Supplier: "",
//     Status: "",
//     RequestedBy: "",
//   };
//   const { control, register, getValues, handleSubmit, reset, watch, setValue } =
//     useForm({
//       defaultValues: initialFormData,
//     });
//   const theme = useTheme();
//   const { user } = useAuth();
//   const [openPosts, setOpenPosts] = useState([]);
//   const [openSearchPosts, setOpenSearchPosts] = useState([]);
//   const [closeSearchPosts, setCloseSearchPosts] = useState([]);
//   const [closedPosts, setClosedPosts] = useState([]);
//   const [openPage, setOpenPage] = useState(0);
//   const [closePage, setClosePage] = useState(0);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [tab, settab] = useState("0");
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [hasMoreClose, setHasMoreClose] = useState(true);
//   const [searchTextOpen, setSearchTextOpen] = useState("");
//   const [searchTextClose, setSearchTextClose] = useState("");
//   const [searchTextGetListForCreate, setsearchTextGetListForCreate] =
//     useState("");
//   const [getListData, setGetListData] = useState([]);
//   const [getListSearchData, setGetListSearchData] = useState([]);
//   const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
//   const [getListPage, setGetListPage] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [Disabled, setDisabled] = useState(false);
//   const [barcodeItem, setBarcodeItem] = useState("");
//   const [WMSStaff, setWMSStaff] = useState([]);
//   const [oLines, setoLines] = useState([]);
//   const watchShowAge = getValues("JobWorkAt");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     getAllOpenList();
//     getAllCloseList();
//     getListForCreate();
//     getAllWMSStaffList();
//   }, []);
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const gridSx = useMemo(() => dataGridSx(theme), [theme]);

//   const getAllOpenList = () => {
//     apiClient
//       .get("/MatIssue?Page=0&Status=1")
//       .then((response) => {
//         setOpenPosts(response.data.values);

//         if (response.data.values.length < 20) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const getAllCloseList = async () => {
//     try {
//       const response = await apiClient.get("/MatIssue?Page=0&Status=0");

//       setClosedPosts(response.data.values);

//       if (response.data.values.length === 0) {
//         setHasMoreClose(false);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const fetchMoreOpenListData = async () => {
//     try {
//       const page = openPage + 1;
//       const trimmedSearch = searchTextOpen?.trim() || "";
//       const cleanSearch = trimmedSearch
//         .replace(/[^a-zA-Z0-9 ]/g, "")
//         .replace(/\s+/g, " ");

//       let response;

//       if (cleanSearch === "") {
//         response = await apiClient.get(`/MatIssue?Page=${page}&Status=1`);

//         setOpenPosts((prev) => [...prev, ...response.data.values]);
//       } else {
//         response = await apiClient.get(
//           `/MatIssue?SearchText=${cleanSearch}&Status=1&Page=${page}`,
//         );

//         setOpenSearchPosts((prev) => [...prev, ...response.data.values]);
//       }

//       setOpenPage(page);

//       if (response.data.values.length === 0) {
//         setHasMoreOpen(false);
//       }
//     } catch (error) {
//       console.error("Fetch Open List Error:", error);
//     }
//   };

//   const onHandleSearchOpen = async (event) => {
//     try {
//       const rawValue = event.target.value || "";
//       const cleanSearch = rawValue
//         .trim()
//         .replace(/[^a-zA-Z0-9 ]/g, "")
//         .replace(/\s+/g, " ");

//       setOpenSearchPosts([]);
//       setSearchTextOpen(cleanSearch);
//       setOpenPage(0);

//       if (!cleanSearch) return;

//       const response = await apiClient.get(
//         `/MatIssue?SearchText=${cleanSearch}&Status=1&Page=0`,
//       );

//       setOpenSearchPosts(response.data.values);

//       if (response.data.values.length < 20) {
//         setHasMoreOpen(false);
//       } else {
//         setHasMoreOpen(true);
//       }
//     } catch (error) {
//       console.error("Search Open Error:", error);
//     }
//   };

//   const removeTableRow = (rowId) => {
//     if (oLines.length === 1) {
//       Swal.fire({
//         text: "At least One Item Required",
//         icon: "warning",
//         toast: true,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true,
//       });
//     } else {
//       // const updatedOLines = [...oLines];
//       // updatedOLines.splice(index, 1);
//       const updatedOLines = oLines.filter(
//         (row) => row.id !== rowId && row.ItemCode !== rowId,
//       );
//       setoLines(updatedOLines);
//     }
//   };

//   const onClickClearOpenSearch = () => {
//     setSearchTextOpen("");
//     setOpenSearchPosts([]);
//     setOpenPosts([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getAllOpenList();
//     }, 100);
//   };

//   const triggeronClickClearOpenSearchTwice = () => {
//     onClickClearOpenSearch();
//     setTimeout(() => {
//       onClickClearOpenSearch();
//     }, 10);
//   };

//   const getCloseSearchList = async (event) => {
//     try {
//       const rawValue = event.target.value || "";
//       const cleanSearch = rawValue
//         .trim()
//         .replace(/[^a-zA-Z0-9 ]/g, "")
//         .replace(/\s+/g, " ");

//       setCloseSearchPosts([]);
//       setSearchTextClose(cleanSearch);
//       setClosePage(0);

//       if (!cleanSearch) return;

//       const response = await apiClient.get(
//         `/MatIssue?SearchText=${cleanSearch}&Status=0&Page=0`,
//       );

//       setCloseSearchPosts(response.data.values);

//       if (response.data.values.length < 20) {
//         setHasMoreClose(false);
//       } else {
//         setHasMoreClose(true);
//       }
//     } catch (error) {
//       console.error("Close Search Error:", error);
//     }
//   };

//   const fetchMoreCloseListData = () => {
//     const page = closePage + 1;

//     if (searchTextClose === "") {
//       apiClient
//         .get(`/MatIssue?Page=${page}&Status=0`)
//         .then((response) => {
//           setClosedPosts((prevPosts) => [
//             ...prevPosts,
//             ...response.data.values,
//           ]);

//           setClosePage(page);

//           if (response.data.values.length === 0) {
//             setHasMoreClose(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       apiClient
//         .get(`/MatIssue?SearchText=${searchTextClose}&Status=0&Page=${page}`)
//         .then((response) => {
//           setCloseSearchPosts((prevPosts) => [
//             ...prevPosts,
//             ...response.data.values,
//           ]);

//           setClosePage(page);

//           if (response.data.values.length === 0) {
//             setHasMoreClose(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const onClickClearCloseSearch = () => {
//     setSearchTextClose("");
//     setCloseSearchPosts([]);
//     setClosedPosts([]);
//     setClosePage(0);
//     setHasMoreClose(true);
//     setTimeout(() => {
//       getAllCloseList();
//     }, 100);
//   };

//   const triggeronClickClearCloseSearchTwice = () => {
//     onClickClearCloseSearch();
//     setTimeout(() => {
//       onClickClearCloseSearch();
//     }, 10);
//   };
//   const fetchDataGetListForCreate = (url, setData, append = false) => {
//     apiClient
//       .get(url, { headers: { "Content-Type": "application/json" } })
//       .then((response) => {
//         const values = response.data.values ?? [];
//         setData((prevData) => (append ? [...prevData, ...values] : values));
//         if (values.length === 0 || values.length < 20)
//           setHasMoreGetListForCreate(false);
//       })
//       .catch((error) => {
//         console.log(error);
//         setHasMoreGetListForCreate(false);
//       });
//   };

//   const getListForCreate = () => {
//     fetchDataGetListForCreate(`/MatIssue/CopyFrom?Page=0`, setGetListData);
//   };
//   const fetchMoreGetListForCreate = () => {
//     const page = getListPage + 1;

//     const url = searchTextGetListForCreate
//       ? `/MatIssue/CopyFrom?SearchText=${searchTextGetListForCreate}&Page=${page}`
//       : `/MatIssue/CopyFrom?Page=${page}`;

//     fetchDataGetListForCreate(
//       url,
//       searchTextGetListForCreate ? setGetListSearchData : setGetListData,
//       true,
//     );

//     setGetListPage(page);
//   };

//   useEffect(() => {
//     if (isDialogOpen === true) {
//       getListForCreate(0);
//     }
//   }, [isDialogOpen]);

//   const onHandleSearchGetListForCreate = (event) => {
//     const searchText = event.target.value;
//     setGetListSearchData([]);
//     setsearchTextGetListForCreate(searchText);
//     setGetListPage(0);
//     setHasMoreGetListForCreate(true);

//     if (searchText) {
//       fetchDataGetListForCreate(
//         `/MatIssue/CopyFrom?SearchText=${searchText}&Page=0`,
//         setGetListSearchData,
//       );
//     } else {
//       setHasMoreGetListForCreate(false);
//       getListForCreate();
//     }
//   };
//   const onClickClearGetListCreateSearch = () => {
//     setsearchTextGetListForCreate("");
//     setGetListSearchData([]);
//     setGetListData([]);
//     setGetListPage(0);
//     getListForCreate();
//   };

//   const triggerClearSearchTwice = () => {
//     onClickClearGetListCreateSearch();
//     setTimeout(() => {
//       onClickClearGetListCreateSearch();
//     }, 10);
//   };

//   const openDialog = () => {
//     setIsDialogOpen(true);
//     setsearchTextGetListForCreate([]);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setsearchTextGetListForCreate([]);
//   };

//   const handleCardClick = () => {
//     setDisabled(true);
//   };

//   const handleClick = () => {
//     setDisabled(false);
//   };

//   const handleTabChangeRight = (e, newvalue1) => {
//     settab(newvalue1);
//   };

//   const setOldOpenListData = async (DocEntry) => {
//     setLoading(true);

//     try {
//       const res = await apiClient.get(`/MatIssue/${DocEntry}`);
//       const data = res.data.values;

//       if (!data) {
//         Swal.fire({
//           icon: "warning",
//           text: "Record not found",
//         });
//         return;
//       }
//       if (res.data.success) {
//         const transformed = {
//           ...data,

//           JobCardNo: "",
//           RegistrationNo: data.RegistrationNo,
//           InwardNo: data.InwardNo,
//           VehInwardDocEntry: data.VehInwardDocEntry,
//           IssueNo: data.DocNum,
//           RequestDate: dayjs(data.RequestDate),
//           OrderNo: data.OrderNo,
//           OrderDocEntry: data.OrderDocEntry,
//           JobWorkAt: data.JobWorkAt,
//           JobWorkDetails: data.IssueRemark,
//           TotalItems: data.oLines?.length || 0,
//           RequestedBy: data.RequestedBy,
//           OrderType: data.OrderType,
//           InventoryTransferNumber: data.InventoryTransferNumber,
//           IssueBy: data.IssueBy,
//           HW_WMSStaff: data.HW_WMSStaff,
//           TechnicianName: data.TechnicianName,
//         };

//         const mappedOLines =
//           data.oLines.map((item) => ({
//             ItemCode: item.ItemCode,
//             ItemName: item.ItemName,
//             WHSCode: item.FromWHS,
//             FromBin: item.FromBin,
//             ToWHS: item.ToWHS,
//             BinLocation: item.FromBin,
//             AvailQty: item.AvailQty,
//             ReqQuantity: item.ReqQuantity,
//             OpenQuantity: item.OpenQuantity,
//             IssueQuantity: item.IssueQuantity,
//             BinList: [{ BinCode: item.FromBin }],
//           })) || [];

//         reset(transformed);
//         setValue("DocNum", data.DocNum);
//         setoLines(mappedOLines);
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Oops...",
//         text: error?.message || "Something went wrong",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const ClearForm = () => {
//     reset(initialFormData);
//     setoLines([]);
//     handleClick();
//   };

//   const onChangeTableData = (event, itemCode) => {
//     const { value, name } = event.target;

//     setoLines((prevLines) =>
//       prevLines.map((line) =>
//         line.ItemCode === itemCode ? { ...line, [name]: value } : line,
//       ),
//     );
//   };

//   const handleBarcodeChange = (event) => {
//     const value = event.target.value?.trim();
//     setBarcodeItem(value);
//     if (!value) return;

//     let itemFound = false;

//     const updatedItems = oLines.map((item) => {
//       const itemCode = String(item.ItemCode || "").toUpperCase();
//       const enteredCode = String(value).toUpperCase();

//       if (itemCode === enteredCode) {
//         itemFound = true;

//         const issueQty = parseFloat(item.IssueQuantity) || 0;
//         const openQty = parseFloat(item.OpenQuantity) || 0;

//         if (issueQty + 1 > openQty) {
//           Swal.fire({
//             text: "You Can't add More than Open Quantity",
//             icon: "warning",
//             toast: true,
//             showConfirmButton: false,
//             timer: 2000,
//             timerProgressBar: true,
//           });
//           return item;
//         }

//         return {
//           ...item,
//           IssueQuantity: (issueQty + 1).toFixed(3),
//         };
//       }

//       return item;
//     });

//     setoLines(updatedItems);
//     setTimeout(() => {
//       setBarcodeItem("");
//     }, 300);
//   };

//   const getAllWMSStaffList = () => {
//     apiClient
//       .get(`/Technician?HW_WMSStaff=Y`)
//       .then((response) => {
//         setWMSStaff(response.data.values);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const columns = [
//     {
//       field: "ItemCode",
//       headerName: "Item Code",
//       width: 160,
//       sortable: false,
//       renderCell: (params) => {
//         const copyText = (e) => {
//           e.stopPropagation();

//           if (navigator.clipboard && navigator.clipboard.writeText) {
//             navigator.clipboard
//               .writeText(params.value)
//               .then(() => {
//                 Swal.fire({
//                   toast: true,
//                   position: "top-end",
//                   icon: "success",
//                   title: "Item Code Copied",
//                   showConfirmButton: false,
//                   timer: 1200,
//                 });
//               })
//               .catch((err) => {
//                 console.error("Failed to copy: ", err);
//               });
//           } else {
//             // fallback for unsupported browsers
//             const textArea = document.createElement("textarea");
//             textArea.value = params.value;
//             document.body.appendChild(textArea);
//             textArea.select();
//             try {
//               document.execCommand("copy");
//               Swal.fire({
//                 toast: true,
//                 position: "top-end",
//                 icon: "success",
//                 title: "Item Code Copied",
//                 showConfirmButton: false,
//                 timer: 1200,
//               });
//             } catch (err) {
//               console.error("Fallback: copy failed", err);
//             }
//             document.body.removeChild(textArea);
//           }
//         };

//         return (
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               cursor: "pointer",
//             }}
//             onClick={copyText}
//           >
//             <Typography variant="body2">{params.value}</Typography>

//             <Tooltip title="Copy Item Code">
//               <IconButton size="small" onClick={copyText}>
//                 <ContentCopyIcon fontSize="inherit" />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         );
//       },
//     },
//     {
//       field: "ItemName",
//       headerName: "Item Description",
//       minWidth: 250,
//       sortable: false,
//       flex: 1,
//     },
//     {
//       field: "WHSCode",
//       headerName: "From WHS",
//       width: 100,
//       sortable: false,
//       type: "number",
//     },
//     {
//       field: "BinList",
//       headerName: "From Bin",
//       width: 140,
//       sortable: false,
//       headerAlign: "center",
//       align: "center",
//       renderCell: (params) => (
//         <Tooltip title={params.row.FromBin} arrow>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               height: "100%",
//               width: "100%",
//             }}
//           >
//             <InputTableSelectField
//               name="FromBin"
//               value={params.row.FromBin}
//               onChange={(e) => onChangeTableData(e, params.row.ItemCode)}
//               data={(params.value === undefined ? [] : params.value).map(
//                 (BinLocation) => ({
//                   key: BinLocation.BinCode,
//                   value: BinLocation.BinCode,
//                 }),
//               )}
//               readOnly={Disabled}
//             />
//           </Box>
//         </Tooltip>
//       ),
//     },

//     {
//       field: "ToWHS",
//       headerName: "To Whs",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField
//           value={watchShowAge === "CNC" ? "99" : "98" || ""}
//         />
//       ),
//       align: "center",
//       headerAlign: "center",
//     },
//     {
//       field: "AvailQty",
//       headerName: "Avl Qty	",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//       align: "center",
//       headerAlign: "center",
//     },
//     {
//       field: "ReqQuantity",
//       headerName: "Req Qty",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//       align: "center",
//       headerAlign: "center",
//     },
//     {
//       field: "OpenQuantity",
//       headerName: "Open Qty	",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//       align: "center",
//       headerAlign: "center",
//     },
//     {
//       field: "IssueQuantity",
//       headerName: "Iss Qty",
//       width: 120,
//       sortable: false,
//       renderCell: (params) => {
//         return (
//           <InputTableTextField
//             value={Number(params.value || 0).toFixed(0)}
//             endAdornment={
//               <InputAdornment position="end">
//                 <IconButton
//                   size="small"
//                   onClick={(e) => clareissueqty(e, params.row.ItemCode)}
//                   disabled={Disabled}
//                 >
//                   <ClearIcon fontSize="small" />
//                 </IconButton>
//               </InputAdornment>
//             }
//           />
//         );
//       },
//       align: "center",
//       headerAlign: "center",
//     },
//     {
//       field: "Action",
//       headerName: "Action	",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <IconButton
//           onClick={() => {
//             removeTableRow(params.row.ItemCode);
//           }}
//         >
//           <RemoveCircleIcon sx={{ color: "red" }} />
//         </IconButton>
//       ),
//     },
//   ];
//   const clareissueqty = (event, itemCode) => {
//     event.stopPropagation(); // Prevents row click events from firing

//     Swal.fire({
//       text: "Do you want to clear Issue Quantity?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes",
//       cancelButtonText: "No",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setoLines((prevLines) =>
//           prevLines.map((line) =>
//             line.ItemCode === itemCode ? { ...line, IssueQuantity: 0 } : line,
//           ),
//         );
//       }
//     });
//   };

//   const handleSubmitForm = async (data) => {
//     const payload = {
//       UserId: user.UserId,
//       CreatedBy: user.UserName,
//       RequestDate: data.RequestDate,
//       IssueDate: data.IssueDate,
//       OrderNo: data.OrderNo,
//       RequestNo: data.DocNum,
//       InwardNo: data.InwardNo,
//       JobCardNo: "",
//       IssueRemark: data.JobWorkDetails,
//       RegistrationNo: data.RegistrationNo,
//       JobWorkAt: data.JobWorkAt,
//       OrderType: data.OrderType,
//       InvTransferNo: String(data.InvTransferNo || ""),
//       RequestedBy: data.RequestBy,
//       OrderDocEntry: data.OrderDocEntry,
//       DocDate: dayjs(),
//       Series: "-1",
//       IssuedBy: user.UserName,
//       IssueBy: user.UserName,
//       IssueRemark: data.ReqRemarks,
//       RequestDocEntry: String(data.RequestDocEntry || ""),
//       SAPDocNum: String(data.SAPDocNum || ""),
//       SAPDocEntry: String(data.SAPDocEntry || ""),
//       HW_WMSStaff: String(data.HW_WMSStaff),

//       oLines: data.oLines.map((element) => ({
//         UserId: user.UserId,
//         CreatedBy: user.UserName,
//         ModifiedBy: user.UserName,
//         RequestNo: data.RequestNo,
//         ItemCode: element.ItemCode,
//         ItemName: element.ItemName,
//         WHSCode: element.WHSCode,
//         FromBin: element.FromBin,
//         ToWHS: data.JobWorkAt === "CNC" ? "99" : "98",
//         ReqQuantity: element.ReqQuantity,
//         OpenQuantity: String(element.OpenQuantity - element.IssueQuantity),
//         IssueQuantity: String(element.IssueQuantity),
//         ReqLineRemarks: "",
//         IssueLineRemarks: "",
//       })),
//     };

//     const watchOlines = watch("oLines");

//     if (!watchOlines || watchOlines.length === 0) {
//       Swal.fire({
//         text: "At least One Item Required",
//         icon: "warning",
//         toast: true,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true,
//       });
//       return;
//     }

//     const MaterialData = getValues();

//     if (MaterialData.OrderNo === "" || MaterialData.OrderNo === undefined) {
//       Swal.fire({
//         text: "Please select order...",
//         icon: "warning",
//         toast: true,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true,
//       });
//       return;
//     }
//     var issueQty = MaterialData.oLines.filter(
//       (line) => line.IssueQuantity === 0,
//     ).length;
//     const bin = MaterialData.oLines.filter(
//       (line) =>
//         line.FromBin === undefined ||
//         line.FromBin === null ||
//         line.FromBin === "",
//     ).length;
//     const CNC = MaterialData.oLines.filter(
//       (line) => Number(line.OpenQuantity) !== Number(line.IssueQuantity),
//     ).length;
//     if (issueQty > 0) {
//       Swal.fire({
//         // title: "Warning!",
//         text: "issue Quantity can not be zero",
//         icon: "warning",
//         toast: true,
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return;
//     }
//      else if (bin > 0) {
//       Swal.fire({
//         // title: "Warning!",
//         text: "Please select bin locations for all items..",
//         icon: "warning",
//         toast: true,
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     else if (!MaterialData.HW_WMSStaff) {
//       Swal.fire({
//         title: "Warning !",
//         text: "Please select Parts Delivered by...",
//         icon: "warning",
//         toast: true,
//         timer: 1000,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     try {
//       const response = await apiClient.post(`/MatIssue`, payload);

//       if (response.data.success) {
//         Swal.fire({
//           title: "Success!",
//           text: "Material Issued Successfully",
//           icon: "success",
//           timer: 1000,
//         });

//         getAllOpenList();
//         getAllCloseList();
//         ClearForm();
//       } else {
//         Swal.fire({
//           title: "Error!",
//           text: response.data.message,
//           icon: "warning",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error!",
//         text:
//           error?.response?.data?.message ||
//           error.message ||
//           "Something went wrong",
//         icon: "warning",
//       });
//     }
//   };

//   const onSelectRequest = (selectedItem) => {
//     // reset({ ...item, IssuedBy: user.UserName, RequestNo: item.DocNum });
//     // setoLines(item.oLines);
//     // setIsDialogOpen(false);

//     const filledValues = {
//       ...initialFormData,
//       ...selectedItem,
//       RegistrationNo: selectedItem.RegistrationNo,
//       InwardNo: selectedItem.VehInwardNo,
//       OrderNo: selectedItem.OrderNo,
//       RequestNo: selectedItem.DocNum,
//       JobWorkDetails: selectedItem.ReqRemarks.toUpperCase(),
//       RequestDate: selectedItem.RequestDate,
//       JobWorkAt: selectedItem.JobWorkAt.toUpperCase(),
//       OrderSubType: selectedItem.OrderSubType,
//       OrderType: selectedItem.OrderType,
//       RequestedBy: selectedItem.RequestBy,
//       InvTransferNo: "",
//       OrderDocEntry: selectedItem.OrderDocEntry,
//       RequestDocEntry: selectedItem.DocEntry,
//       IssueBy: localStorage.getItem("CreatedBy"),
//       HW_WMSStaff: selectedItem.HW_WMSStaff,
//     };
//     const mappedOLines =
//       selectedItem.oLines?.map((line) => ({
//         ItemCode: line.ItemCode,
//         ItemName: line.ItemName,
//         WHSCode: line.WHSCode,
//         AvailQty: line.AvailQty,
//         ReqQuantity: line.ReqQuantity,
//         OpenQuantity: line.OpenQuantity,
//         IssueQuantity: 0,
//         FromBin: line.BinLocation,
//         BinList: line.BinList,
//         ToWHS: selectedItem.JobWorkAt === "CNC" ? "99" : "98",
//       })) || [];
//     reset(filledValues);
//     setoLines(mappedOLines);
//     setIsDialogOpen(false);
//   };

//   const sidebarContent = (
//     <>
//       <Grid
//         item
//         width={"100%"}
//         py={0.5}
//         alignItems={"center"}
//         border={"1px solid silver"}
//         borderBottom={"none"}
//         position={"relative"}
//         sx={{
//           backgroundColor:
//             theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//         }}
//       >
//         <Typography
//           textAlign={"center"}
//           alignContent={"center"}
//           height={"100%"}
//         >
//           Issue Material Documents
//         </Typography>
//         <IconButton
//           edge="end"
//           color="inherit"
//           aria-label="close"
//           onClick={() => setSidebarOpen(false)}
//           sx={{
//             position: "absolute",
//             right: "10px",
//             top: "0px",
//             display: { lg: "none", xs: "block" },
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </Grid>

//       <Grid
//         container
//         item
//         width={"100%"}
//         height={"100%"}
//         border={"1px silver solid"}
//         sx={{
//           backgroundColor:
//             theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//         }}
//       >
//         <Grid
//           item
//           md={12}
//           sm={12}
//           width={"100%"}
//           height={`calc(100% - ${50}px)`}
//         >
//           <Box
//             sx={{
//               width: "100%",
//               height: "100%",
//               typography: "body1",
//               "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
//                 padding: 0,
//               },

//               "& .MuiTabs-flexContainer ": {
//                 justifyContent: "space-around",
//               },
//             }}
//           >
//             <TabContext value={tab}>
//               <Tabs
//                 value={tab}
//                 onChange={handleTabChangeRight}
//                 indicatorColor="primary"
//                 textColor="inherit"
//               >
//                 <Tab value="0" label="Open" />
//                 <Tab value="1" label="Closed" />
//               </Tabs>

//               <TabPanel
//                 value={"0"}
//                 style={{
//                   overflow: "auto",
//                   maxHeight: `calc(100% - ${15}px)`,
//                   paddingLeft: 5,
//                   paddingRight: 5,
//                 }}
//                 id="ListScroll"
//               >
//                 <Grid
//                   item
//                   padding={1}
//                   md={12}
//                   sm={12}
//                   width={"100%"}
//                   sx={{
//                     position: "sticky",
//                     top: "0",
//                     backgroundColor: "#F5F6FA",
//                   }}
//                 >
//                   <SearchInputField
//                     onChange={onHandleSearchOpen}
//                     value={searchTextOpen}
//                     onClickClear={triggeronClickClearOpenSearchTwice}
//                   />
//                 </Grid>
//                 <InfiniteScroll
//                   style={{ textAlign: "center", justifyContent: "center" }}
//                   // dataLength={
//                   //   searchTextOpen === ""
//                   //     ? openPosts || [].length
//                   //     : openSearchPosts || [].length
//                   // }
//                   dataLength={
//                     searchTextOpen === ""
//                       ? openPosts?.length || 0
//                       : openSearchPosts?.length || 0
//                   }
//                   next={fetchMoreOpenListData}
//                   hasMore={hasMoreOpen}
//                   loader={
//                     <BeatLoader
//                       sx={{
//                         backgroundColor:
//                           theme.palette.mode === "light"
//                             ? "#F5F6FA"
//                             : "#080D2B",
//                       }}
//                     />
//                   }
//                   scrollableTarget="ListScroll"
//                   endMessage={<Typography>No More Records</Typography>}
//                 >
//                   {/* {(openSearchPosts || [].length === 0
//                     ? openPosts
//                     : openSearchPosts
//                   ).map((item) => (
//                     <CardComponent
//                       key={item.DocNum}
//                       title={item.CardName}
//                       subtitle={item.RequestNo}
//                       description={item.PhoneNumber1}
//                       onClick={() => {
//                         setOldOpenListData(item.DocEntry);
//                         handleCardClick(true);
//                       }}
//                     />
//                   ))} */}
//                   {(openSearchPosts && openSearchPosts.length > 0
//                     ? openSearchPosts
//                     : openPosts || []
//                   ).map((item) => (
//                     <CardComponent
//                       key={item.DocNum}
//                       title={item.CardName}
//                       subtitle={item.RequestNo}
//                       description={item.PhoneNumber1}
//                       onClick={() => {
//                         setOldOpenListData(item.DocEntry);
//                         handleCardClick(true);
//                       }}
//                     />
//                   ))}
//                 </InfiniteScroll>
//               </TabPanel>

//               <TabPanel
//                 value={"1"}
//                 style={{
//                   overflow: "auto",
//                   maxHeight: `calc(100% - ${15}px)`,
//                   paddingLeft: 5,
//                   paddingRight: 5,
//                 }}
//                 id="ListScrollClosed"
//               >
//                 <Grid
//                   item
//                   padding={1}
//                   md={12}
//                   sm={12}
//                   width={"100%"}
//                   sx={{
//                     position: "sticky",
//                     top: "0",
//                     backgroundColor: "#F5F6FA",
//                   }}
//                 >
//                   <SearchInputField
//                     onChange={getCloseSearchList}
//                     value={searchTextClose}
//                     onClickClear={triggeronClickClearCloseSearchTwice}
//                   />
//                 </Grid>
//                 <InfiniteScroll
//                   style={{ textAlign: "center" }}
//                   // dataLength={
//                   //   searchTextClose === ""
//                   //     ? closedPosts.length
//                   //     : closeSearchPosts.length
//                   // }
//                   dataLength={
//                     searchTextClose === ""
//                       ? closedPosts?.length || 0
//                       : closeSearchPosts?.length || 0
//                   }
//                   next={fetchMoreCloseListData}
//                   hasMore={hasMoreClose}
//                   loader={
//                     <BeatLoader
//                       color={theme.palette.mode === "light" ? "black" : "white"}
//                     />
//                   }
//                   scrollableTarget="ListScrollClosed"
//                   endMessage={<Typography>No More Records</Typography>}
//                 >
//                   {/* {(closeSearchPosts.length === 0
//                     ? closedPosts
//                     : closeSearchPosts
//                   ).map((item) => (
//                     <CardComponent
//                       key={item.DocNum}
//                       title={item.CardName}
//                       subtitle={item.PhoneNumber1}
//                       description={item.RequestNo}
//                       onClick={() => {
//                         handleCardClick();
//                         setOldOpenListData(item.DocEntry);
//                       }}
//                     />
//                   ))} */}
//                   {(closeSearchPosts && closeSearchPosts.length > 0
//                     ? closeSearchPosts
//                     : closedPosts || []
//                   ).map((item) => (
//                     <CardComponent
//                       key={item.DocNum}
//                       title={item.CardName}
//                       subtitle={item.PhoneNumber1}
//                       description={item.RequestNo}
//                       onClick={() => {
//                         handleCardClick();
//                         setOldOpenListData(item.DocEntry);
//                       }}
//                     />
//                   ))}
//                 </InfiniteScroll>
//               </TabPanel>
//             </TabContext>
//           </Box>
//         </Grid>
//       </Grid>
//     </>
//   );

//   //print hardcoded
//   const handlePrint = () => {
//     window.print();
//   };

//   const callPicklist = async () => {
//     if (!oLines || !oLines.length) return;

//     const MaterialData = getValues();

//     const obj = oLines.map((data) => ({
//       UserId: localStorage.getItem("UserId"),
//       CreatedBy: localStorage.getItem("UserName"),
//       RequestNo: MaterialData.RequestNo,
//       OrderNo: MaterialData.OrderNo,
//       OrderDocEntry: MaterialData.OrderDocEntry,
//       ItemCode: data.ItemCode,
//       ItemName: data.ItemName,
//       ReqQty: data.ReqQuantity,
//       FromWHS: data.WHSCode,
//       FromBin: data.FromBin,
//       Status: "1",
//     }));

//     console.log(obj);
//     // return;

//     try {
//       const res = await apiClient.post(`/PicklistPrint`, obj);

//       if (res?.data?.success) {
//         // printpicklist();
//         Swal.fire({
//           title: "Success",
//           text: "Success",
//           icon: "Success",
//           confirmButtonText: "Ok",
//         });
//       } else {
//         Swal.fire({
//           title: "Error!",
//           text: res?.data?.message || "Something went wrong",
//           icon: "warning",
//           confirmButtonText: "Ok",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error!",
//         text:
//           error?.response?.data?.message ||
//           error?.message ||
//           "Something went wrong",
//         icon: "warning",
//         confirmButtonText: "Ok",
//       });
//     }
//   };

//   return (
//     <>
//       <Loader open={loading} />
//       <SearchModel
//         open={isDialogOpen}
//         onClose={handleCloseDialog}
//         title="Select Request"
//         onChange={onHandleSearchGetListForCreate}
//         value={searchTextGetListForCreate}
//         onClickClear={triggerClearSearchTwice}
//         cardData={
//           <>
//             <InfiniteScroll
//               style={{ textAlign: "center" }}
//               dataLength={
//                 searchTextGetListForCreate === ""
//                   ? getListData?.length || 0
//                   : getListSearchData?.length || 0
//               }
//               next={fetchMoreGetListForCreate}
//               hasMore={hasMoreGetListForCreate}
//               loader={
//                 <BeatLoader
//                   color={theme.palette.mode === "light" ? "black" : "white"}
//                 />
//               }
//               scrollableTarget="getListForCreateScroll"
//               endMessage={
//                 <Typography textAlign={"center"}>No More Records</Typography>
//               }
//             >
//               {(getListSearchData && getListSearchData.length > 0
//                 ? getListSearchData
//                 : getListData || []
//               ).map((item) => (
//                 <CardComponent
//                   key={item.DocNum}
//                   title={item.DocNum}
//                   subtitle={item.CardName}
//                   description={item.PhoneNumber1}
//                   onClick={() => {
//                     onSelectRequest(item);
//                   }}
//                 />
//               ))}
//             </InfiniteScroll>
//           </>
//         }
//       />
//       <Grid
//         container
//         width="100%"
//         height="calc(100vh - 110px)"
//         position="relative"
//         component={"form"}
//         onSubmit={handleSubmit(handleSubmitForm)}
//       >
//         <Grid
//           container
//           item
//           height="100%"
//           sm={12}
//           md={6}
//           lg={3}
//           className="sidebar"
//           sx={{
//             position: { lg: "relative", xs: "absolute" },
//             top: 0,
//             left: 0,
//             transition: "left 0.3s ease",
//             zIndex: 1000,
//             display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
//           }}
//         >
//           {sidebarContent}
//         </Grid>

//         <Grid
//           container
//           item
//           width="100%"
//           height="100%"
//           sm={12}
//           md={12}
//           lg={9}
//           position="relative"
//           // onClick={handleSubmitForm}
//         >
//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={toggleSidebar}
//             sx={{
//               position: "absolute",
//               left: "10px",
//               display: { lg: "none", xs: "block" },
//             }}
//           >
//             <MenuIcon />
//           </IconButton>

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={ClearForm}
//             sx={{
//               display: {},
//               position: "absolute",
//               right: "10px",
//             }}
//           >
//             <AddIcon />
//           </IconButton>

//           <Grid
//             item
//             width="100%"
//             py={0.5}
//             alignItems="center"
//             border="1px solid silver"
//             borderBottom="none"
//           >
//             <Typography textAlign="center" alignContent="center" height="100%">
//               Issue Material
//             </Typography>
//           </Grid>

//           <Grid
//             container
//             item
//             width="100%"
//             height="100%"
//             border="1px silver solid"
//           >
//             <Grid
//               container
//               item
//               padding={1}
//               md={12}
//               sm={12}
//               height="calc(100% - 40px)"
//               overflow="scroll"
//               sx={{ overflowX: "hidden" }}
//               position="relative"
//               textTransform={"uppercase"}
//             >
//               <Box
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                   width: "100%",
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={4}
//                     xs={12}
//                     style={{ textAlign: "center" }}
//                   >
//                     <Controller
//                       name="DocNum"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextSearchButton
//                           label="Request NO"
//                           type="text"
//                           readOnly={true}
//                           disabled={Disabled}
//                           onClick={() => {
//                             openDialog();
//                           }}
//                           {...field}
//                           onChange={openDialog}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="OrderNo"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="SO NO"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={4}
//                     xs={12}
//                     textAlign="center"
//                     key="request-date"
//                   >
//                     <Controller
//                       name="RequestDate"
//                       control={control}
//                       render={({ field }) => (
//                         <InputDatePickerField
//                           redOnly
//                           label="REQUEST DATE"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="IssueDate"
//                       control={control}
//                       render={({ field }) => (
//                         <InputDatePickerField
//                           readOnly={true}
//                           label="Issue Date"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="OrderType"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Order Type"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="1"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Issue No "
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="RegistrationNo"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Registration No"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="InwardNo"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Inward No"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="JobWorkAt"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Job Work At"
//                           type="text"
//                           {...register("JobWorkAt")}
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Button
//                       variant="contained"
//                       fullWidth
//                       sx={{ maxWidth: 220 }}
//                       disabled={!watch("RequestNo") || Disabled}
//                       onClick={callPicklist}
//                     >
//                       Print Picklist
//                     </Button>
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Tooltip
//                       title={(watch("ReqRemarks") || "").toUpperCase()}
//                       arrow
//                     >
//                       <div style={{ width: "100%" }}>
//                         <Controller
//                           name="ReqRemarks"
//                           control={control}
//                           render={({ field }) => (
//                             <InputTextArea
//                               label="Job Work Details"
//                               type="text"
//                               {...field}
//                               readOnly={true}
//                             />
//                           )}
//                         />
//                       </div>
//                     </Tooltip>
//                   </Grid>
//                 </Grid>

//                 <Grid
//                   container
//                   sx={{
//                     overflow: "auto",
//                     width: "100%",
//                     mt: 3,
//                     mb: 3,
//                   }}
//                 >
//                   <TextField
//                     fullWidth
//                     placeholder="Scan Barcode"
//                     autoFocus
//                     value={barcodeItem}
//                     onChange={handleBarcodeChange}
//                     disabled={!watch("RequestNo") || Disabled}
//                   />
//                 </Grid>

//                 <Grid
//                   container
//                   sx={{
//                     overflow: "auto",
//                     width: "100%",
//                     height: 230,
//                     mt: "5px",
//                     pl: 1,
//                     pr: 1,
//                   }}
//                 >
//                   <DataGrid
//                     className="datagrid-style"
//                     rows={oLines}
//                     getRowId={(row) => row.ItemCode}
//                     columns={columns}
//                     columnHeaderHeight={35}
//                     rowHeight={45}
//                     hideFooter
//                     disableRowSelectionOnClick
//                     autoHeight="false"
//                     sx={gridSx}
//                   />
//                 </Grid>

//                 <Grid container marginTop={3}>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={6}
//                     xs={12}
//                     textAlign="center"
//                     mt={1}
//                   >
//                     <Controller
//                       name="RequestBy"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Requested By"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={6}
//                     xs={12}
//                     textAlign="center"
//                     mt={1}
//                   >
//                     <Controller
//                       name="InvTransferNo"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Inventory Transfer Number"
//                           type="text"
//                           readOnly={true}
//                           {...field}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={6}
//                     xs={12}
//                     textAlign="center"
//                     mt={1}
//                   >
//                     <Controller
//                       name="IssuedBy"
//                       control={control}
//                       render={({ field }) => (
//                         <InputTextField
//                           label="Issue By"
//                           type="text"
//                           {...field}
//                           readOnly={true}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={6}
//                     xs={12}
//                     textAlign="center"
//                     mt={1}
//                   >
//                     <Controller
//                       name="HW_WMSStaff"
//                       control={control}
//                       rules={{
//                         required: "Parts Delivered By is required",
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="Parts Delivered By"
//                           data={(WMSStaff || []).map((item) => ({
//                             key: item.DocEntry,
//                             value: item.TechnicianName,
//                           }))}
//                           readOnly={!watch("DocNum") || Disabled}
//                           {...field}
//                           error={!!error}
//                           helperText={error?.message}
//                         />
//                       )}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             <Grid
//               item
//               px={1}
//               xs={12}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "end",
//                 position: "sticky",
//               }}
//             >
//               <Button
//                 variant="contained"
//                 sx={{ color: "white" }}
//                 color="success"
//                 type="submit"
//                 disabled={!watch("RequestNo") || Disabled}
//               >
//                 Save
//               </Button>
//               <Button onClick={handlePrint} variant="contained" color="primary">
//                 PRINT
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// }

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import { useMemo } from "react";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTableSelectField,
  InputTableTextField,
  InputTextArea,
  InputTextField,
  InputTextSearchButton,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { Loader } from "../Components/Loader";

export default function IssueMaterial() {
  const initialFormData = {
    DocNum: "",
    OrderDocEntry: "",
    DocEntry: "",
    DocDate: dayjs(undefined),
    OrderNo: "",
    RequestNo: "",
    IssueDate: dayjs(undefined),
    RequestDate: dayjs(undefined),
    OrderType: "",
    IssueNO: "",
    RegistrationNo: "",
    JobWorkAt: "",
    InwardNo: "",
    ReqRemarks: "",
    RequestBy: "",
    InvTransferNo: "",
    HW_WMSStaff: "",
    IssuedBy: "",
    Supplier: "",
    Status: "",
    RequestedBy: "",
  };
  const { control, register, getValues, handleSubmit, reset, watch, setValue } =
    useForm({
      defaultValues: initialFormData,
    });
  const theme = useTheme();
  const { user } = useAuth();
  const [openPosts, setOpenPosts] = useState([]);
  const [openSearchPosts, setOpenSearchPosts] = useState([]);
  const [closeSearchPosts, setCloseSearchPosts] = useState([]);
  const [closedPosts, setClosedPosts] = useState([]);
  const [openPage, setOpenPage] = useState(0);
  const [closePage, setClosePage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [searchTextOpen, setSearchTextOpen] = useState("");
  const [searchTextClose, setSearchTextClose] = useState("");
  const [searchTextGetListForCreate, setsearchTextGetListForCreate] =
    useState("");
  const [getListData, setGetListData] = useState([]);
  const [getListSearchData, setGetListSearchData] = useState([]);
  const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
  const [getListPage, setGetListPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [Disabled, setDisabled] = useState(false);
  const [barcodeItem, setBarcodeItem] = useState("");
  const [WMSStaff, setWMSStaff] = useState([]);
  const [oLines, setoLines] = useState([]);
  const watchShowAge = getValues("JobWorkAt");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllOpenList();
    getAllCloseList();
    getListForCreate();
    getAllWMSStaffList();
  }, []);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const getAllOpenList = () => {
    apiClient
      .get("/MatIssue?Page=0&Status=1")
      .then((response) => {
        setOpenPosts(response.data.values);

        if (response.data.values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAllCloseList = async () => {
    try {
      const response = await apiClient.get("/MatIssue?Page=0&Status=0");

      setClosedPosts(response.data.values);

      if (response.data.values.length === 0) {
        setHasMoreClose(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMoreOpenListData = async () => {
    try {
      const page = openPage + 1;
      const trimmedSearch = searchTextOpen?.trim() || "";
      const cleanSearch = trimmedSearch
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      let response;

      if (cleanSearch === "") {
        response = await apiClient.get(`/MatIssue?Page=${page}&Status=1`);

        setOpenPosts((prev) => [...prev, ...response.data.values]);
      } else {
        response = await apiClient.get(
          `/MatIssue?SearchText=${cleanSearch}&Status=1&Page=${page}`,
        );

        setOpenSearchPosts((prev) => [...prev, ...response.data.values]);
      }

      setOpenPage(page);

      if (response.data.values.length === 0) {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error("Fetch Open List Error:", error);
    }
  };

  const onHandleSearchOpen = async (event) => {
    try {
      const rawValue = event.target.value || "";
      const cleanSearch = rawValue
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      setOpenSearchPosts([]);
      setSearchTextOpen(cleanSearch);
      setOpenPage(0);

      if (!cleanSearch) return;

      const response = await apiClient.get(
        `/MatIssue?SearchText=${cleanSearch}&Status=1&Page=0`,
      );

      setOpenSearchPosts(response.data.values);

      if (response.data.values.length < 20) {
        setHasMoreOpen(false);
      } else {
        setHasMoreOpen(true);
      }
    } catch (error) {
      console.error("Search Open Error:", error);
    }
  };

  const removeTableRow = (rowId) => {
    if (oLines.length === 1) {
      Swal.fire({
        text: "At least One Item Required",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } else {
      // const updatedOLines = [...oLines];
      // updatedOLines.splice(index, 1);
      const updatedOLines = oLines.filter(
        (row) => row.id !== rowId && row.ItemCode !== rowId,
      );
      setoLines(updatedOLines);
    }
  };

  const onClickClearOpenSearch = () => {
    setSearchTextOpen("");
    setOpenSearchPosts([]);
    setOpenPosts([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    setTimeout(() => {
      getAllOpenList();
    }, 100);
  };

  const triggeronClickClearOpenSearchTwice = () => {
    onClickClearOpenSearch();
    setTimeout(() => {
      onClickClearOpenSearch();
    }, 10);
  };

  const getCloseSearchList = async (event) => {
    try {
      const rawValue = event.target.value || "";
      const cleanSearch = rawValue
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      setCloseSearchPosts([]);
      setSearchTextClose(cleanSearch);
      setClosePage(0);

      if (!cleanSearch) return;

      const response = await apiClient.get(
        `/MatIssue?SearchText=${cleanSearch}&Status=0&Page=0`,
      );

      setCloseSearchPosts(response.data.values);

      if (response.data.values.length < 20) {
        setHasMoreClose(false);
      } else {
        setHasMoreClose(true);
      }
    } catch (error) {
      console.error("Close Search Error:", error);
    }
  };

  const fetchMoreCloseListData = () => {
    const page = closePage + 1;

    if (searchTextClose === "") {
      apiClient
        .get(`/MatIssue?Page=${page}&Status=0`)
        .then((response) => {
          setClosedPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);

          setClosePage(page);

          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      apiClient
        .get(`/MatIssue?SearchText=${searchTextClose}&Status=0&Page=${page}`)
        .then((response) => {
          setCloseSearchPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);

          setClosePage(page);

          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onClickClearCloseSearch = () => {
    setSearchTextClose("");
    setCloseSearchPosts([]);
    setClosedPosts([]);
    setClosePage(0);
    setHasMoreClose(true);
    setTimeout(() => {
      getAllCloseList();
    }, 100);
  };

  const triggeronClickClearCloseSearchTwice = () => {
    onClickClearCloseSearch();
    setTimeout(() => {
      onClickClearCloseSearch();
    }, 10);
  };
  const fetchDataGetListForCreate = (url, setData, append = false) => {
    apiClient
      .get(url, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        const values = response.data.values ?? [];
        setData((prevData) => (append ? [...prevData, ...values] : values));
        if (values.length === 0 || values.length < 20)
          setHasMoreGetListForCreate(false);
      })
      .catch((error) => {
        console.log(error);
        setHasMoreGetListForCreate(false);
      });
  };

  const getListForCreate = () => {
    fetchDataGetListForCreate(`/MatIssue/CopyFrom?Page=0`, setGetListData);
  };
  const fetchMoreGetListForCreate = () => {
    const page = getListPage + 1;

    const url = searchTextGetListForCreate
      ? `/MatIssue/CopyFrom?SearchText=${searchTextGetListForCreate}&Page=${page}`
      : `/MatIssue/CopyFrom?Page=${page}`;

    fetchDataGetListForCreate(
      url,
      searchTextGetListForCreate ? setGetListSearchData : setGetListData,
      true,
    );

    setGetListPage(page);
  };

  useEffect(() => {
    if (isDialogOpen === true) {
      getListForCreate(0);
    }
  }, [isDialogOpen]);

  const onHandleSearchGetListForCreate = (event) => {
    const searchText = event.target.value;
    setGetListSearchData([]);
    setsearchTextGetListForCreate(searchText);
    setGetListPage(0);
    setHasMoreGetListForCreate(true);

    if (searchText) {
      fetchDataGetListForCreate(
        `/MatIssue/CopyFrom?SearchText=${searchText}&Page=0`,
        setGetListSearchData,
      );
    } else {
      setHasMoreGetListForCreate(false);
      getListForCreate();
    }
  };
  const onClickClearGetListCreateSearch = () => {
    setsearchTextGetListForCreate("");
    setGetListSearchData([]);
    setGetListData([]);
    setGetListPage(0);
    getListForCreate();
  };

  const triggerClearSearchTwice = () => {
    onClickClearGetListCreateSearch();
    setTimeout(() => {
      onClickClearGetListCreateSearch();
    }, 10);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    setsearchTextGetListForCreate([]);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setsearchTextGetListForCreate([]);
  };

  const handleCardClick = () => {
    setDisabled(true);
  };

  const handleClick = () => {
    setDisabled(false);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const setOldOpenListData = async (DocEntry) => {
    setLoading(true);

    try {
      const res = await apiClient.get(`/MatIssue/${DocEntry}`);
      const data = res.data.values;

      if (!data) {
        Swal.fire({
          icon: "warning",
          text: "Record not found",
        });
        return;
      }
      if (res.data.success) {
        const transformed = {
          ...data,

          JobCardNo: "",
          RegistrationNo: data.RegistrationNo,
          InwardNo: data.InwardNo,
          VehInwardDocEntry: data.VehInwardDocEntry,
          IssueNo: data.DocNum,
          RequestDate: dayjs(data.RequestDate),
          OrderNo: data.OrderNo,
          OrderDocEntry: data.OrderDocEntry,
          JobWorkAt: data.JobWorkAt,
          JobWorkDetails: data.IssueRemark,
          TotalItems: data.oLines?.length || 0,
          RequestedBy: data.RequestedBy,
          OrderType: data.OrderType,
          InventoryTransferNumber: data.InventoryTransferNumber,
          IssueBy: data.IssueBy,
          HW_WMSStaff: data.HW_WMSStaff,
          TechnicianName: data.TechnicianName,
        };

        const mappedOLines =
          data.oLines.map((item) => ({
            ItemCode: item.ItemCode,
            ItemName: item.ItemName,
            WHSCode: item.FromWHS,
            FromBin: item.FromBin,
            ToWHS: item.ToWHS,
            BinLocation: item.FromBin,
            AvailQty: item.AvailQty,
            ReqQuantity: item.ReqQuantity,
            OpenQuantity: item.OpenQuantity,
            IssueQuantity: item.IssueQuantity,
            BinList: [{ BinCode: item.FromBin }],
          })) || [];

        reset(transformed);
        setValue("DocNum", data.DocNum);
        setoLines(mappedOLines);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const ClearForm = () => {
    reset(initialFormData);
    setoLines([]);
    handleClick();
  };

  const onChangeTableData = (event, itemCode) => {
    const { value, name } = event.target;

    setoLines((prevLines) =>
      prevLines.map((line) =>
        line.ItemCode === itemCode ? { ...line, [name]: value } : line,
      ),
    );
  };

  const handleBarcodeChange = (event) => {
    const value = event.target.value?.trim();
    setBarcodeItem(value);
    if (!value) return;

    let itemFound = false;

    const updatedItems = oLines.map((item) => {
      const itemCode = String(item.ItemCode || "").toUpperCase();
      const enteredCode = String(value).toUpperCase();

      if (itemCode === enteredCode) {
        itemFound = true;

        const issueQty = parseFloat(item.IssueQuantity) || 0;
        const openQty = parseFloat(item.OpenQuantity) || 0;

        if (issueQty + 1 > openQty) {
          Swal.fire({
            text: "You Can't add More than Open Quantity",
            icon: "warning",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          return item;
        }

        return {
          ...item,
          IssueQuantity: (issueQty + 1).toFixed(3),
        };
      }

      return item;
    });

    setoLines(updatedItems);
    setTimeout(() => {
      setBarcodeItem("");
    }, 300);
  };

  const getAllWMSStaffList = () => {
    apiClient
      .get(`/Technician?HW_WMSStaff=Y`)
      .then((response) => {
        setWMSStaff(response.data.values);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const columns = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const copyText = (e) => {
          e.stopPropagation();

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(params.value)
              .then(() => {
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "success",
                  title: "Item Code Copied",
                  showConfirmButton: false,
                  timer: 1200,
                });
              })
              .catch((err) => {
                console.error("Failed to copy: ", err);
              });
          } else {
            // fallback for unsupported browsers
            const textArea = document.createElement("textarea");
            textArea.value = params.value;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand("copy");
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Item Code Copied",
                showConfirmButton: false,
                timer: 1200,
              });
            } catch (err) {
              console.error("Fallback: copy failed", err);
            }
            document.body.removeChild(textArea);
          }
        };

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={copyText}
          >
            <Typography variant="body2">{params.value}</Typography>

            <Tooltip title="Copy Item Code">
              <IconButton size="small" onClick={copyText}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      minWidth: 250,
      sortable: false,
      flex: 1,
    },
    {
      field: "WHSCode",
      headerName: "From WHS",
      width: 100,
      sortable: false,
      type: "number",
    },
    {
      field: "BinList",
      headerName: "From Bin",
      width: 140,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Tooltip title={params.row.FromBin} arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <InputTableSelectField
              name="FromBin"
              value={params.row.FromBin}
              onChange={(e) => onChangeTableData(e, params.row.ItemCode)}
              data={(params.value === undefined ? [] : params.value).map(
                (BinLocation) => ({
                  key: BinLocation.BinCode,
                  value: BinLocation.BinCode,
                }),
              )}
              readOnly={Disabled}
            />
          </Box>
        </Tooltip>
      ),
    },

    {
      field: "ToWHS",
      headerName: "To Whs",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <InputTableTextField
          value={watchShowAge === "CNC" ? "99" : "98" || ""}
        />
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "AvailQty",
      headerName: "Avl Qty	",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ReqQuantity",
      headerName: "Req Qty",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "OpenQuantity",
      headerName: "Open Qty	",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
      ),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "IssueQuantity",
      headerName: "Iss Qty",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <InputTableTextField
            value={Number(params.value || 0).toFixed(0)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={(e) => clareissueqty(e, params.row.ItemCode)}
                  disabled={Disabled}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            }
          />
        );
      },
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Action",
      headerName: "Action	",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => {
            removeTableRow(params.row.ItemCode);
          }}
        >
          <RemoveCircleIcon sx={{ color: "red" }} />
        </IconButton>
      ),
    },
  ];
  const clareissueqty = (event, itemCode) => {
    event.stopPropagation(); // Prevents row click events from firing

    Swal.fire({
      text: "Do you want to clear Issue Quantity?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setoLines((prevLines) =>
          prevLines.map((line) =>
            line.ItemCode === itemCode ? { ...line, IssueQuantity: 0 } : line,
          ),
        );
      }
    });
  };

  const handleSubmitForm = async (data) => {
    // oLines lives in React STATE (setoLines), not the form.
    // All validations and the payload MUST read from the `oLines` state variable.

    if (!oLines || oLines.length === 0) {
      Swal.fire({
        text: "At least One Item Required",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (!data.OrderNo) {
      Swal.fire({
        text: "Please select order...",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    // Check zero issue qty — from oLines STATE
    const zeroIssueQty = oLines.filter(
      (line) => !line.IssueQuantity || Number(line.IssueQuantity) === 0,
    ).length;

    // Check missing bin — from oLines STATE so dropdown changes are captured
    const missingBin = oLines.filter(
      (line) =>
        line.FromBin === undefined ||
        line.FromBin === null ||
        line.FromBin === "",
    ).length;

    if (zeroIssueQty > 0) {
      Swal.fire({
        text: "Issue Quantity can not be zero",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    } else if (missingBin > 0) {
      Swal.fire({
        text: "Please select bin locations for all items..",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    } else if (!data.HW_WMSStaff) {
      Swal.fire({
        title: "Warning !",
        text: "Please select Parts Delivered by...",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Build payload using oLines STATE (not data.oLines which is always empty)
    const payload = {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      RequestDate: data.RequestDate,
      IssueDate: data.IssueDate,
      OrderNo: data.OrderNo,
      RequestNo: data.DocNum,
      InwardNo: data.InwardNo,
      JobCardNo: "",
      RegistrationNo: data.RegistrationNo,
      JobWorkAt: data.JobWorkAt,
      OrderType: data.OrderType,
      InvTransferNo: String(data.InvTransferNo || ""),
      RequestedBy: data.RequestBy,
      OrderDocEntry: data.OrderDocEntry,
      DocDate: dayjs(),
      Series: "-1",
      IssuedBy: user.UserName,
      IssueBy: user.UserName,
      IssueRemark: data.ReqRemarks,
      RequestDocEntry: String(data.RequestDocEntry || ""),
      SAPDocNum: String(data.SAPDocNum || ""),
      SAPDocEntry: String(data.SAPDocEntry || ""),
      HW_WMSStaff: String(data.HW_WMSStaff),
      oLines: oLines.map((element) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        RequestNo: data.RequestNo,
        ItemCode: element.ItemCode,
        ItemName: element.ItemName,
        WHSCode: element.WHSCode,
        FromBin: element.FromBin,
        ToWHS: data.JobWorkAt === "CNC" ? "99" : "98",
        ReqQuantity: element.ReqQuantity,
        OpenQuantity: String(element.OpenQuantity - element.IssueQuantity),
        IssueQuantity: String(element.IssueQuantity),
        ReqLineRemarks: "",
        IssueLineRemarks: "",
      })),
    };

    try {
      const response = await apiClient.post(`/MatIssue`, payload);

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Material Issued Successfully",
          icon: "success",
          timer: 1000,
        });

        getAllOpenList();
        getAllCloseList();
        ClearForm();
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        icon: "warning",
      });
    }
  };

  const onSelectRequest = (selectedItem) => {
    // reset({ ...item, IssuedBy: user.UserName, RequestNo: item.DocNum });
    // setoLines(item.oLines);
    // setIsDialogOpen(false);

    const filledValues = {
      ...initialFormData,
      ...selectedItem,
      RegistrationNo: selectedItem.RegistrationNo,
      InwardNo: selectedItem.VehInwardNo,
      OrderNo: selectedItem.OrderNo,
      RequestNo: selectedItem.DocNum,
      JobWorkDetails: selectedItem.ReqRemarks.toUpperCase(),
      RequestDate: selectedItem.RequestDate,
      JobWorkAt: selectedItem.JobWorkAt.toUpperCase(),
      OrderSubType: selectedItem.OrderSubType,
      OrderType: selectedItem.OrderType,
      RequestedBy: selectedItem.RequestBy,
      InvTransferNo: "",
      OrderDocEntry: selectedItem.OrderDocEntry,
      RequestDocEntry: selectedItem.DocEntry,
      IssueBy: localStorage.getItem("CreatedBy"),
      HW_WMSStaff: selectedItem.HW_WMSStaff,
    };
    const mappedOLines =
      selectedItem.oLines?.map((line) => ({
        ItemCode: line.ItemCode,
        ItemName: line.ItemName,
        WHSCode: line.WHSCode,
        AvailQty: line.AvailQty,
        ReqQuantity: line.ReqQuantity,
        OpenQuantity: line.OpenQuantity,
        IssueQuantity: 0,
        FromBin: line.BinLocation,
        BinList: line.BinList,
        ToWHS: selectedItem.JobWorkAt === "CNC" ? "99" : "98",
      })) || [];
    reset(filledValues);
    setoLines(mappedOLines);
    setIsDialogOpen(false);
  };

  const sidebarContent = (
    <>
      <Grid
        item
        width={"100%"}
        py={0.5}
        alignItems={"center"}
        border={"1px solid silver"}
        borderBottom={"none"}
        position={"relative"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          Issue Material Documents
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "absolute",
            right: "10px",
            top: "0px",
            display: { lg: "none", xs: "block" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid
        container
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid
          item
          md={12}
          sm={12}
          width={"100%"}
          height={`calc(100% - ${50}px)`}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="0" label="Open" />
                <Tab value="1" label="Closed" />
              </Tabs>

              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScroll"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={onHandleSearchOpen}
                    value={searchTextOpen}
                    onClickClear={triggeronClickClearOpenSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  // dataLength={
                  //   searchTextOpen === ""
                  //     ? openPosts || [].length
                  //     : openSearchPosts || [].length
                  // }
                  dataLength={
                    searchTextOpen === ""
                      ? openPosts?.length || 0
                      : openSearchPosts?.length || 0
                  }
                  next={fetchMoreOpenListData}
                  hasMore={hasMoreOpen}
                  loader={
                    <BeatLoader
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "#F5F6FA"
                            : "#080D2B",
                      }}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {/* {(openSearchPosts || [].length === 0
                    ? openPosts
                    : openSearchPosts
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.RequestNo}
                      description={item.PhoneNumber1}
                      onClick={() => {
                        setOldOpenListData(item.DocEntry);
                        handleCardClick(true);
                      }}
                    />
                  ))} */}
                  {(openSearchPosts && openSearchPosts.length > 0
                    ? openSearchPosts
                    : openPosts || []
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.RequestNo}
                      description={item.PhoneNumber1}
                      onClick={() => {
                        setOldOpenListData(item.DocEntry);
                        handleCardClick(true);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={getCloseSearchList}
                    value={searchTextClose}
                    onClickClear={triggeronClickClearCloseSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  // dataLength={
                  //   searchTextClose === ""
                  //     ? closedPosts.length
                  //     : closeSearchPosts.length
                  // }
                  dataLength={
                    searchTextClose === ""
                      ? closedPosts?.length || 0
                      : closeSearchPosts?.length || 0
                  }
                  next={fetchMoreCloseListData}
                  hasMore={hasMoreClose}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {/* {(closeSearchPosts.length === 0
                    ? closedPosts
                    : closeSearchPosts
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.PhoneNumber1}
                      description={item.RequestNo}
                      onClick={() => {
                        handleCardClick();
                        setOldOpenListData(item.DocEntry);
                      }}
                    />
                  ))} */}
                  {(closeSearchPosts && closeSearchPosts.length > 0
                    ? closeSearchPosts
                    : closedPosts || []
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.PhoneNumber1}
                      description={item.RequestNo}
                      onClick={() => {
                        handleCardClick();
                        setOldOpenListData(item.DocEntry);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  //print hardcoded
  const handlePrint = () => {
    window.print();
  };

  const callPicklist = async () => {
    if (!oLines || !oLines.length) return;

    const MaterialData = getValues();

    const obj = oLines.map((data) => ({
      UserId: localStorage.getItem("UserId"),
      CreatedBy: localStorage.getItem("UserName"),
      RequestNo: MaterialData.RequestNo,
      OrderNo: MaterialData.OrderNo,
      OrderDocEntry: MaterialData.OrderDocEntry,
      ItemCode: data.ItemCode,
      ItemName: data.ItemName,
      ReqQty: data.ReqQuantity,
      FromWHS: data.WHSCode,
      FromBin: data.FromBin,
      Status: "1",
    }));

    console.log(obj);
    // return;

    try {
      const res = await apiClient.post(`/PicklistPrint`, obj);

      if (res?.data?.success) {
        // printpicklist();
        Swal.fire({
          title: "Success",
          text: "Success",
          icon: "Success",
          confirmButtonText: "Ok",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res?.data?.message || "Something went wrong",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <>
      <Loader open={loading} />
      <SearchModel
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title="Select Request"
        onChange={onHandleSearchGetListForCreate}
        value={searchTextGetListForCreate}
        onClickClear={triggerClearSearchTwice}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={
                searchTextGetListForCreate === ""
                  ? getListData?.length || 0
                  : getListSearchData?.length || 0
              }
              next={fetchMoreGetListForCreate}
              hasMore={hasMoreGetListForCreate}
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
              {(getListSearchData && getListSearchData.length > 0
                ? getListSearchData
                : getListData || []
              ).map((item) => (
                <CardComponent
                  key={item.DocNum}
                  title={item.DocNum}
                  subtitle={item.CardName}
                  description={item.PhoneNumber1}
                  onClick={() => {
                    onSelectRequest(item);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          height="100%"
          sm={12}
          md={6}
          lg={3}
          className="sidebar"
          sx={{
            position: { lg: "relative", xs: "absolute" },
            top: 0,
            left: 0,
            transition: "left 0.3s ease",
            zIndex: 1000,
            display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
          // onClick={handleSubmitForm}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
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
            width="100%"
            py={0.5}
            alignItems="center"
            border="1px solid silver"
            borderBottom="none"
          >
            <Typography textAlign="center" alignContent="center" height="100%">
              Issue Material
            </Typography>
          </Grid>

          <Grid
            container
            item
            width="100%"
            height="100%"
            border="1px silver solid"
          >
            <Grid
              container
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow="scroll"
              sx={{ overflowX: "hidden" }}
              position="relative"
              textTransform={"uppercase"}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    style={{ textAlign: "center" }}
                  >
                    <Controller
                      name="DocNum"
                      control={control}
                      render={({ field }) => (
                        <InputTextSearchButton
                          label="Request NO"
                          type="text"
                          readOnly={true}
                          disabled={Disabled}
                          onClick={() => {
                            openDialog();
                          }}
                          {...field}
                          onChange={openDialog}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="OrderNo"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="SO NO"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign="center"
                    key="request-date"
                  >
                    <Controller
                      name="RequestDate"
                      control={control}
                      render={({ field }) => (
                        <InputDatePickerField
                          redOnly
                          label="REQUEST DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="IssueDate"
                      control={control}
                      render={({ field }) => (
                        <InputDatePickerField
                          readOnly={true}
                          label="Issue Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="OrderType"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Order Type"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="1"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Issue No "
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="RegistrationNo"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Registration No"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="InwardNo"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Inward No"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="JobWorkAt"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Job Work At"
                          type="text"
                          {...register("JobWorkAt")}
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ maxWidth: 220 }}
                      disabled={!watch("RequestNo") || Disabled}
                      onClick={callPicklist}
                    >
                      Print Picklist
                    </Button>
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Tooltip
                      title={(watch("ReqRemarks") || "").toUpperCase()}
                      arrow
                    >
                      <div style={{ width: "100%" }}>
                        <Controller
                          name="ReqRemarks"
                          control={control}
                          render={({ field }) => (
                            <InputTextArea
                              label="Job Work Details"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>

                <Grid
                  container
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    mt: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Scan Barcode"
                    autoFocus
                    value={barcodeItem}
                    onChange={handleBarcodeChange}
                    disabled={!watch("RequestNo") || Disabled}
                  />
                </Grid>

                <Grid
                  container
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    height: 230,
                    mt: "5px",
                    pl: 1,
                    pr: 1,
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={oLines}
                    getRowId={(row) => row.ItemCode}
                    columns={columns}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    hideFooter
                    disableRowSelectionOnClick
                    autoHeight="false"
                    sx={gridSx}
                  />
                </Grid>

                <Grid container marginTop={3}>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign="center"
                    mt={1}
                  >
                    <Controller
                      name="RequestBy"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Requested By"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign="center"
                    mt={1}
                  >
                    <Controller
                      name="InvTransferNo"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Inventory Transfer Number"
                          type="text"
                          readOnly={true}
                          {...field}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign="center"
                    mt={1}
                  >
                    <Controller
                      name="IssuedBy"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="Issue By"
                          type="text"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign="center"
                    mt={1}
                  >
                    <Controller
                      name="HW_WMSStaff"
                      control={control}
                      rules={{
                        required: "Parts Delivered By is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="Parts Delivered By"
                          data={(WMSStaff || []).map((item) => ({
                            key: item.DocEntry,
                            value: item.TechnicianName,
                          }))}
                          readOnly={!watch("DocNum") || Disabled}
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
              }}
            >
              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={!watch("RequestNo") || Disabled}
              >
                Save
              </Button>
              <Button onClick={handlePrint} variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
