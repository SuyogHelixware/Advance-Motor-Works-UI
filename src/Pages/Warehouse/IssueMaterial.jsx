// import ClearIcon from "@mui/icons-material/Clear";
// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";
// import RefreshIcon from "@mui/icons-material/Refresh";
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
//   Typography,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import TextField from "@mui/material/TextField";
// import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTableSelectField,
//   InputTableTextField,
//   InputTextArea,
//   InputTextField,
//   InputTextSearchField,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";
// import SearchModel from "../Components/SearchModel";
// import useAuth from "../../Routing/AuthContext";
// import Swal from "sweetalert2";
// import dayjs from "dayjs";

// export default function IssueMaterial() {
//   const initialFormData = {
//     CardCode: "",
//     CardName: "",
//     PhoneNumber1: "",
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
//     VehInwardNo: "",
//     JobWorkAt: "",
//     ReqRemarks: "",
//     RequestBy: "",
//     InvTransferNo: "",
//     HW_WMSStaff: "",
//     IssuedBy: "",
//     Supplier: "",
//     Status: "",
//     RequestedBy: "",
//   };
//   const { control, register, getValues, handleSubmit, reset } = useForm({
//     defaultValues: initialFormData,
//   });
//   const theme = useTheme();
//   const { user } = useAuth();
//   const [openPosts, setOpenPosts] = useState([]); // State for Open posts
//   const [openSearchPosts, setOpenSearchPosts] = useState([]); // State for Open posts
//   const [closeSearchPosts, setCloseSearchPosts] = useState([]); // State for Open posts
//   const [closedPosts, setClosedPosts] = useState([]);
//   const [openPage, setOpenPage] = useState(0); // Pagination for Open posts
//   const [closePage, setClosePage] = useState(0);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [tab, settab] = useState("0");
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [hasMoreClose, setHasMoreClose] = useState(true);
//   const [searchTextOpen, setSearchTextOpen] = useState("");
//   const [searchTextClose, setSearchTextClose] = useState("");
//   const [searchTextGetListForCreate, setsearchTextGetListForCreate] = useState("");
//   const [getListData, setGetListData] = useState([]);
//   const [getListSearchData, setGetListSearchData] = useState([]); // State for Open posts
//   const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
//   const [getListPage, setGetListPage] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [Disabled, setDisabled] = useState(false);
//   const [barcodeItem, setBarcodeItem] = useState("");
//   const [WMSStaff, setWMSStaff] = useState([]);
//   const [oLines, setoLines] = useState([]);
//   // const watchShowAge = watch("JobWorkAt", "");
//   const watchShowAge = getValues("JobWorkAt");

//   useEffect(() => {
//     getAllOpenList();
//     getAllCloseList();
//     getListForCreate();
//     getAllWMSStaffList();
//     console.log("=================test===================");
//     console.log(user);
//     console.log("====================================");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

 
//   //Toggle sidebar
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
 
//   // for Open Request
//   const getAllOpenList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/MatIssue/pages/0/1`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
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

//   const getAllCloseList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/MatIssue/pages/0/0`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setClosedPosts(response.data.values);
//         if (response.data.values.length < 0) {
//           setHasMoreClose(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const fetchMoreOpenListData = () => {
//     if (searchTextOpen === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/MatIssue/pages/${page}/1`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setOpenPosts((prevPosts) => [...prevPosts, ...response.data.values]);
//           setOpenPage(page);
//           if (response.data.values.length === 0) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/matissue/search/${searchTextOpen}/0/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setOpenSearchPosts((prevPosts) => [
//             ...prevPosts,
//             ...response.data.values,
//           ]);
//           setOpenPage(page);
//           if (response.data.values.length === 0) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const onHandleSearchOpen = (event) => {
//     const searchText = event.target.value;
//     setOpenSearchPosts([]);
//     setSearchTextOpen(searchText);
//     setOpenPage(0);
//     if (searchText !== "") {
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/MatIssue/search/${searchText}/1/0`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setOpenSearchPosts(response.data.values);

//           if (response.data.values.length === 20) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const removeTableRow = (index) => {
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
//       // Create a new array excluding the item at the specified index
//       const updatedOLines = [...oLines];
//       updatedOLines.splice(index, 1);

//       // Update the state with the new array
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

//   // for close Request

//   const getCloseSearchList = (event) => {
//     const searchText = event.target.value;
//     setCloseSearchPosts([]);
//     setSearchTextClose(searchText);
//     setClosePage(0);
//     if (searchText !== "") {
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/MatIssue/search/${searchText}/0/0`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setCloseSearchPosts(response.data.values);

//           if (response.data.values.length < 20) {
//             setHasMoreClose(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const fetchMoreCloseListData = () => {
//     if (searchTextClose === "") {
//       const page = closePage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/MatIssue/pages/${page}/0`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
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
//       const page = closePage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/MatIssue/search/${searchTextClose}/0/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
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

//   // for getListFor Search
//   const fetchDataGetListForCreate = (url, setData, append = false) => {
//     axios
//       .get(url, { headers: { "Content-Type": "application/json" } })
//       .then((response) => {
//         const values = response.data.values;
//         setData((prevData) => (append ? [...prevData, ...values] : values));
//         if (values.length === 0 || values.length < 20)
//           setHasMoreGetListForCreate(false);
//       })
//       .catch((error) => console.log(error));
//   };

//   const getListForCreate = () => {
//     fetchDataGetListForCreate(
//       `${BASE_URL}/MatIssue/GetListForCreate/0`,
//       setGetListData
//     );
//   };

//   const fetchMoreGetListForCreate = () => {
//     const page = getListPage + 1;
//     const url = searchTextGetListForCreate
//       ? `${BASE_URL}/MatIssue/GetListForCreate/search/${searchTextGetListForCreate}/${page}`
//       : `${BASE_URL}/MatIssue/GetListForCreate/${page}`;
//     fetchDataGetListForCreate(
//       url,
//       searchTextGetListForCreate ? setGetListSearchData : setGetListData,
//       true
//     );
//     setGetListPage(page);
//   };

//   const onHandleSearchGetListForCreate = (event) => {
//     const searchText = event.target.value;
//     setGetListSearchData([]);
//     setsearchTextGetListForCreate(searchText);
//     setGetListPage(0);
//     if (searchText) {
//       fetchDataGetListForCreate(
//         `${BASE_URL}/MatIssue/GetListForCreate/search/${searchText}/0`,
//         setGetListSearchData
//       );
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
//     }, 10); // You can adjust the delay time in milliseconds
//   };

//   const openDialog = () => {
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//   };

//   //save button diseble
//   const handleCardClick = () => {
//     setDisabled(true);
//   };

//   const handleClick = () => {
//     setDisabled(false);
//   };

//   // chnage Tab function open and closed orders
//   const handleTabChangeRight = (e, newvalue1) => {
//     settab(newvalue1);
//   };

//   const setOldOpenListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/MatIssue/${DocEntry}`)
//       .then((response) => {
//         toggleSidebar();
//         const data = response.data.values[0];

//         reset({
//           ...data,
//           ReqRemarks: data.IssueRemark,
//           RequestBy: data.RequestedBy,
//         });
//         if (data.oLines) {
//           const obj = data.oLines.map((item) => ({
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
//           }));
//           setoLines(obj);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   const ClearForm = () => {
//     reset(initialFormData);
//     setoLines([]);
//     handleClick();
//   };

//   const onChangeTableData = (event, index) => {
//     const { value, name } = event.target;

//     console.log("Row index:", index);
//     console.log("Selected value:", value);

//     // Update the state based on the row index and the new value
//     setoLines((prevLines) => {
//       const updatedLines = [...prevLines]; // Make a copy of the previous state
//       updatedLines[index] = {
//         ...updatedLines[index], // Keep other properties unchanged
//         [name]: value, // Update the BinList field with the new value
//       };
//       return updatedLines;
//     });
//   };

//   const handleBarcodeChange = (event) => {
//     setBarcodeItem(event.target.value);
//     let itemFound = false; // Track if item is found

//     const updatedItems = oLines.map((item) => {
//       // Check if the ItemCode matches the target ItemCode
//       if (
//         String(item.ItemCode).toUpperCase() ===
//         String(event.target.value).toUpperCase()
//       ) {
//         itemFound = true; // Mark item as found
//         if (
//           parseFloat(item.IssueQuantity) + 1 >
//           parseFloat(item.OpenQuantity)
//         ) {
//           // Show a toast for IssueQuantity exceeding OpenQuantity
//           Swal.fire({
//             icon: "warning",
//             text: `Issue Quantity cannot exceed Open Quantity for item ${item.ItemCode}`,
//             toast: true,
//             position: "bottom-end",
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//           });

//           return item; // Return item unchanged if exceeds
//         }
//         // Increment the IssueQuantity by 1
//         return {
//           ...item,
//           IssueQuantity: (parseFloat(item.IssueQuantity) + 1).toFixed(3), // Increment and format to 3 decimal places
//         };
//       }
//       return item; // No change for non-matching items
//     });

//     // If no item was found after the iteration, show "Item not found" toast
//     if (!itemFound) {
//       Swal.fire({
//         icon: "warning",
//         text: `Item not found in your request`,
//         toast: true,
//         position: "bottom-right",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//       });
//     }

//     // Update the state with the modified items
//     setoLines(updatedItems);
//     setTimeout(() => {
//       setBarcodeItem("");
//     }, 200);
//   };

//   const getAllWMSStaffList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/Technician/All`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setWMSStaff(response.data.values);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   // data grid Table
//   const columns = [
//     {
//       field: "ItemCode",
//       headerName: "Item Code",
//       width: 130,
//       editable: false,
//       sortable: false,
//     },
//     {
//       field: "ItemName",
//       headerName: "Item Description",
//       minWidth: 250,
//       editable: false,
//       sortable: false,
//       flex: 1,
//     },
//     {
//       field: "WHSCode",
//       headerName: "From WHS",
//       width: 100,
//       editable: false,
//       sortable: false,
//       type: "number",
//     },
//     {
//       field: "BinList",
//       headerName: "From Bin",
//       width: 130,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableSelectField
//           name="BinLocation"
//           value={params.row.BinLocation}
//           onChange={(e) => onChangeTableData(e, params.id)}
//           data={(params.value === undefined ? [] : params.value).map(
//             (BinLocation) => ({
//               key: BinLocation.BinCode,
//               value: BinLocation.BinCode,
//             })
//           )}
//         />
//       ),
//     },

//     {
//       field: "ToWHS",
//       headerName: "To Whs	",
//       width: 100,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField
//           value={watchShowAge === "CNC" ? "99" : "98" || ""}
//         />
//       ),
//     },
//     {
//       field: "AvailQty",
//       headerName: "Avl Qty	",
//       width: 100,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//     },
//     {
//       field: "ReqQuantity",
//       headerName: "Req Qty	",
//       width: 100,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//     },
//     {
//       field: "OpenQuantity",
//       headerName: "Open Qty	",
//       width: 100,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField value={Number(params.value).toFixed(0) || ""} />
//       ),
//     },
//     {
//       field: "IssueQuantity",
//       headerName: "Iss Qty	",
//       width: 100,
//       editable: false,
//       sortable: false,
//       renderCell: (params) => (
//         <InputTableTextField
//           value={Number(params.value).toFixed(0) || ""}
//           endAdornment={
//             <InputAdornment position="end" sx={{ p: 0, m: 0 }}>
//               <IconButton size="small" sx={{ fontSize: "15px" }}>
//                 <ClearIcon fontSize="inherit" sx={{ p: 0, m: 0 }} />
//               </IconButton>
//             </InputAdornment>
//           }
//         />
//       ),
//     },
//     {
//       field: "Action",
//       headerName: "Action	",
//       width: 100,
//       editable: true,
//       sortable: false,
//       renderCell: (params) => (
//         <IconButton
//           onClick={() => {
//             removeTableRow(params.id);
//           }}
//         >
//           <RemoveCircleIcon sx={{ color: "red" }} />
//         </IconButton>
//       ),
//     },
//   ];

//   const handleSubmitForm  = (data) => {
//     const obj = {
//       UserId: user.UserId,
//       CreatedBy: user.UserName,
//       ModifiedBy: user.UserName,
//       RequestDate: data.RequestDate,
//       IssueDate: "",
//       RequestNo:data.RequestNo ||"",
//       OrderType: data.OrderType,
//       // SONO:data.OrderType,
//       RegistrationNo: data.RegistrationNo,
//       InvTransferNo: data.InvTransferNo,
//       InwardNo: data.VehInwardNo,
//       JobWorkAt: data.JobWorkAt,
//       OrderDocEntry: data.OrderDocEntry,
//       RequestedBy: data.RequestBy,
//       CardCode: data.CardCode,
//       CardName: data.CardName,
//       PhoneNumber1: data.PhoneNumber1,
    
//       // RegistrationNo: data.RegistrationNo,

//       // UserId: user.UserId,
//       DocNum: data.DocNum,
//       DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
//       // CreatedBy: user.UserName,
//       // IssueDate: dayjs(data.DocDate).format("YYYY-MMM-DD"),
//       // RequestDate: data.RequestDate,
//       OrderNo: data.OrderNo,
//       JobCardNo: "",
//       IssueRemark: data.ReqRemarks,
//       // JobWorkAt: data.JobWorkAt,
//       // OrderType: data.OrderType,
//       // InwardNo: data.VehInwardNo,
//       // RequestedBy: data.RequestBy,
//       // InvTransferNo: data.InvTransferNo,
//       IssuedBy: data.IssuedBy,
//       RequestDocEntry: data.DocEntry,
//       SAPDocNum: "",
//       SAPDocEntry: "",
//       HW_WMSStaff: String(data.HW_WMSStaff),
//       oLines: oLines.map((element) => ({
//         UserId: user.UserId,
//         CreatedBy: user.UserName,
//         ModifiedBy: user.UserName,
//         RequestNo: data.RequestNo,
//         ItemCode: element.ItemCode,
//         ItemName: element.ItemName,
//         WHSCode: element.WHSCode,
//         FromBin: String(element.BinLocation),
//         ToWHS: data.JobWorkAt === "CNC" ? "99" : "98",
//         ReqQuantity: element.ReqQuantity,
//         OpenQuantity: String(element.OpenQuantity - element.IssueQuantity),
//         IssueQuantity: String(element.IssueQuantity),
//         ReqLineRemarks: "",
//         IssueLineRemarks: "",
//       })),
//     };

//     console.log(obj);

//     axios
//       .post(`${BASE_URL}/MatIssue`, obj)
//       .then((response) => {
//         if (response.data.success) {
//           getAllOpenList();
//           getAllCloseList();
//           ClearForm();
//           Swal.fire({
//             title: "Success!",
//             text: "Material Issued Successfully",
//             icon: "success",
//             confirmButtonText: "Ok",
//             timer: 1000,
//           });
//         } else {
//           Swal.fire({
//             title: "Error!",
//             text: response.data.message,
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//         }
//       })
//       .catch((error) => {
//         Swal.fire({
//           title: "Error!",
//           text: error,
//           icon: "warning",
//           confirmButtonText: "Ok",
//         });
//       });
//   };

//   const onSelectRequest = (item) => {
//     console.log(item);
//     reset({ ...item, IssuedBy: user.UserName });
//     setoLines(item.oLines);
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
//         // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
//                   dataLength={
//                     searchTextOpen === ""
//                       ? openPosts.length
//                       : openSearchPosts.length
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
//                   {(openSearchPosts.length === 0
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
//                   dataLength={
//                     searchTextClose === ""
//                       ? closedPosts.length
//                       : closeSearchPosts.length
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
//                   {(closeSearchPosts.length === 0
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

//   return (
//     <>
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
//                 getListData.length === 0
//                   ? getListSearchData.length
//                   : getListData.length
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
//               {(getListSearchData.length === 0
//                 ? getListData
//                 : getListSearchData
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
//             <RefreshIcon />
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
//                       name="OrderNo"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextSearchField
//                           label="Request NO"
//                           type="text"
//                           onClick={() => {
//                             openDialog();
//                             ClearForm();
//                           }}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="OrderNo"
//                       control={control}
//                       rules={{
//                         required: "so No is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SO NO"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
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
//                       rules={{
//                         required: "REQUEST DATE is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputDatePickerField
//                           label="REQUEST DATE"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                           onChange={(date) =>
//                             field.onChange(date ? date.toISOString : undefined)
//                           }
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="IssueDate"
//                       control={control}
//                       rules={{
//                         required: "issue date is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputDatePickerField
//                           label="Issue Date"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                           onChange={(date) =>
//                             field.onChange(date ? date.toISOString : undefined)
//                           }
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="OrderType"
//                       rules={{
//                         required:"Order Type is required", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Order Type"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="1"
//                       control={control}
//                       // rules={{
//                       //   required: "issue no is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Issue No "
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="RegistrationNo"
//                       control={control}
//                       // rules={{
//                       //   required: "Registration No is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Registration No"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="InwardNo"
//                       control={control}
//                       // rules={{
//                       //   required: "Inward No is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Inward No"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="JobWorkAt"
//                       control={control}
//                       // rules={{
//                       //   required: "Job Work At is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Job Work At"
//                           type="text"
//                           {...register("JobWorkAt")}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Button
//                       variant="contained"
//                       fullWidth
//                       sx={{ maxWidth: 220 }}
//                       disabled={Disabled}
//                     >
//                       {Disabled ? "Print Picklist" : "Print Picklist"}
//                     </Button>
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="ReqRemarks"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextArea
//                           label="Job Work Details"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>
//                 </Grid>

//                 <Grid container>
//                   <Grid item md={12} lg={12} xs={12} textAlign="center" m={2}>
//                     <TextField
//                       fullWidth
//                       placeholder="Search..."
//                       autoFocus
//                       value={barcodeItem}
//                       onChange={handleBarcodeChange}
//                     />
//                   </Grid>
//                 </Grid>

//                 <Grid
//                   container
//                   sx={{
//                     overflow: "auto",
//                     width: "100%",
//                     height: 230,
//                     mt: "5px",
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
//                     sx={{
//                       backgroundColor:
//                         theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//                       "& .MuiDataGrid-cell": {
//                         border: "none",
//                       },
//                       "& .MuiDataGrid-cell:focus": {
//                         outline: "none",
//                       },
//                     }}
//                   />
//                 </Grid>

//                 <Grid container>
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
//                       rules={{
//                         required: "Requested By is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Requested By"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
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
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Inventory Transfer Number"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
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
//                       rules={{
//                         required: "issue by is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="Issue By"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
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
//                       rules={{
//                         required: "Parts Deliverd By is required", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="Parts Delivered By"
//                           data={WMSStaff.map((data) => ({
//                             key: data.DocEntry,
//                             value: data.TechnicianName,
//                           }))}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
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
//                 disabled={Disabled}
//               >
//                 {Disabled ? "Save" : "Save"}
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
