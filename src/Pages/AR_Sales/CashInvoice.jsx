// import MenuIcon from "@mui/icons-material/Menu";
// import React, { useEffect, useState } from "react";

// import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// import { TabContext, TabPanel } from "@mui/lab";
// import Swal from "sweetalert2";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import {
//   Box,
//   Button,
//   Divider,
//   Grid,
//   IconButton,
//   Paper,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tabs,
//   Typography,
//   useTheme,
// } from "@mui/material";

// import CloseIcon from "@mui/icons-material/Close";
// import SearchInputField from "../Components/SearchInputField";

// import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
// import dayjs from "dayjs";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTextArea,
//   InputTextField,
//   InputTextSearchButton,
//   RadioButtonsField,
//   SmallInputTextField,
// } from "../Components/formComponents";
// import SearchModel from "../Components/SearchModel";

// const initialFormData = {
//   Job_SO_DocEntry: "",
//   VehInwardNo: "",
//   RegistrationNo: "",
//   CardCode: "",
//   CardName: "",
//   JobWorkAt: "",
//   VehInwardTime:"",
//   VehInwardDate: undefined,
//   PhoneNumber1: "",
//   JobRemarks: "",
//   Email: "",
//   DocNum: "",
//   ShippingAmt: "",
//   NetPartsValue: "",
//   DesiredDisc: "",
//   DesiredDiscAmt: "",
//   SpecialDisc: "",
//   SpecialDiscAmt: "",
//   RoundingAmt: "",
//   ServiceAndInstallation: "",
//   TotalPartsValue: "",
//   TotalDocAmt: "",
//   AdvanceAmount: "",
//   DueAmount: "",
//   PaidAmount: "",
// };
// export default function CashInvoice() {
//   const [tabvalue, settabvalue] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tab, settab] = useState("1");
//   const [isDialogOpen, setisDialogOpen] = useState(false);
//   const theme = useTheme();

//   // Model API Bind
//   const [searchTextGetListForCreate, setsearchTextGetListForCreate] =useState("");
//   const [getListData, setGetListData] = useState([]);
//   const [getListPage, setGetListPage] = useState(0);

//   const [getListSearchData, setGetListSearchData] = useState([]);
//   const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
//   // ==================================================================================

//   //  Open List Api Bind
//   const [openPosts, setOpenPosts] = useState([]); 
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [searchTextOpen, setSearchTextOpen] = useState("");
//   const [openPage, setOpenPage] = useState(0); 
//   const [oLines, setoLines] = useState([]);
//   const [openSearchPosts, setOpenSearchPosts] = useState([]);

//   // ============================================

//   // Close Api Bind
//   const [closePosts, setClosedPosts] = useState([]);
//   const [hasMoreClose, setHasMoreClose] = useState(true);
//   const [closeSearchPosts, setCloseSearchPosts] = useState([]); // State for Open posts
//   const [closePage, setClosePage] = useState(0);
//   const [searchTextClose, setSearchTextClose] = useState("");

//   const [bankData, setBankData] = useState([]);

//   const addRow = () => {
//     const newData = {
//       myRadioGroup: getValues("myRadioGroup"),
//       AuthCode: getValues("AuthCode"),
//       Creditno: getValues("Creditno"),
//       Amount: getValues("Amount"),
//     };

//     setBankData((prevData) => [...prevData, newData]);
//     reset(); // Clear input fields after adding
//   };

//   const removeTableRow1 = (index) => {
//     const updatedData = bankData.filter((_, i) => i !== index);
//     setBankData(updatedData);
//   };
//   // ===================================================
//   const columns = [
//     {
//       field: "ItemCode",
//       headerName: "Item Code",
//       width: 150,
//       editable: false,
//     },
//     {
//       field: "ItemName",
//       headerName: "	Description",
//       width: 150,
//       editable: true,
//     },
//     {
//       field: "Quantity",
//       headerName: "Qty",
//       width: 150,
//       editable: true,
//     },
//     {
//       field: "Price",
//       headerName: "Price",
//       width: 150,
//       editable: true,
//     },
//     {
//       field: "Amount",
//       headerName: "Amount",
//       width: 150,
//       editable: true,
//     },
//     {
//       field: "Fitting",
//       headerName: "Fitting",
//       width: 150,
//       editable: true,
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

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//     trigger,
//     getValues,
//   } = useForm({
//     defaultValues: initialFormData,
//   });
  

//   useEffect(() => {
//     getListForCreate();
//     getAllOpenList();
//     getAllCloseList();
//   }, []);

//   // APi OPen Tab
//   const getAllOpenList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/ARInvoice/search/0/1`,
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

//   const fetchMoreOpenListData = () => {
//     if (searchTextOpen === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/ARInvoice/search/${page}/1`,
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
//           url: `${BASE_URL}/ARInvoice/search/${searchTextOpen}/0/${page}`,
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
//           url: `${BASE_URL}/ARInvoice/search/${searchText}/1/0`,
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

//   const SetoldData = (item) => {
//     console.log(item);
//     reset(item);
//   };
//   // =============================

//   // API Close Tab List
//   const getAllCloseList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/ARInvoice/search/0/0`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         console.log("close list", response);
//         setClosedPosts(response.data.values);
//         if (response.data.values.length < 20) {
//           setHasMoreClose(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const fetchMoreCloseListData = () => {
//     if (searchTextClose === "") {
//       const page = closePage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/ARInvoice/search/${page}/0`,
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
//           url: `${BASE_URL}/ARInvoice/search/${searchTextClose}/0/${page}`,
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

//   const getCloseSearchList = (event) => {
//     const searchText = event.target.value;
//     setCloseSearchPosts([]);
//     setSearchTextClose(searchText);
//     setClosePage(0);
//     if (searchText !== "") {
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/ARInvoice/search/${searchText}/0/0`,
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

//   const setOldDataclose = (itemclose) => {
//     console.log(itemclose);
//     reset(itemclose);
//   };

//   // ========================================================
//   // model Api Bind

//   const getListForCreate = () => {
//     fetchDataGetListForCreate(
//       `${BASE_URL}/ARInvoice/GetListForCreate/0`,
//       setGetListData
//     );
//   };

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

//   const fetchMoreGetListForCreate = () => {
//     const page = getListPage + 1;
//     const url = searchTextGetListForCreate
//       ? `${BASE_URL}/ARInvoice/GetListForCreate/Search/${searchTextGetListForCreate}/${page}`
//       : `${BASE_URL}/ARInvoice/GetListForCreate/${page}`;
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
//         `${BASE_URL}/ARInvoice/GetListForCreate/search/${searchText}/0`,
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

//   const onSelectRequest = (item) => {
//     console.log(item);
//     reset(item);
//     setoLines(item.oLines);
//     ModelClose();
//   };

//   // ===================================================
//   const ClearFormData = (item) => {
//     reset(initialFormData);
//     setoLines([]);
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

//   const onSubmit = (data) => {
//     console.log(data);
//   };

//   const OpenDailog = () => {
//     setisDialogOpen(true);
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const ModelClose = () => {
//     setisDialogOpen(false);
//   };

//   const handleTabChange = (event, newValue) => {
//     settabvalue(newValue);
//   };

//   const handleTabChangeRight = (e, newvalue1) => {
//     settab(newvalue1);
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
//           Closed Invoices
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
//         // bgcolor={'red'}
//         // mt={10}
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
//                 <Tab value="1" label="Open" />
//                 <Tab value="0" label="Closed" />
//               </Tabs>
//               <TabPanel
//                 value={"1"}
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
//                   style={{ textAlign: "center" }}
//                   dataLength={
//                     searchTextOpen === ""
//                       ? openPosts.length
//                       : openSearchPosts.length
//                   }
//                   next={fetchMoreOpenListData}
//                   hasMore={hasMoreOpen}
//                   loader={<BeatLoader />}
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
//                       subtitle={item.DocNum}
//                       description={item.PhoneNumber1}
//                       onClick={() => SetoldData(item)}
//                     />
//                   ))}
//                 </InfiniteScroll>
//               </TabPanel>
//               <TabPanel
//                 value={"0"}
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
//                       ? closePosts.length
//                       : closeSearchPosts.length
//                   }
//                   next={fetchMoreCloseListData}
//                   hasMore={hasMoreClose}
//                   loader={<BeatLoader />}
//                   scrollableTarget="ListScrollClosed"
//                   endMessage={<Typography>No More Records</Typography>}
//                 >
//                   {(closeSearchPosts.length === 0
//                     ? closePosts
//                     : closeSearchPosts
//                   ).map((itemclose) => (
//                     <CardComponent
//                       key={itemclose.DocNum}
//                       title={itemclose.CardName}
//                       subtitle={itemclose.DocNum}
//                       description={itemclose.PhoneNumber1}
//                       onClick={() => setOldDataclose(itemclose)}
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
//   return (
//     <>
//       <Grid
//         container
//         width="100%"
//         height="calc(100vh - 110px)"
//         position="relative"
//         component={"form"}
//         onSubmit={handleSubmit(onSubmit)}
//       >
//         {/* Sidebar for larger screens */}

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

//         {/* User Creation Form Grid */}

//         <Grid
//           container
//           item
//           width="100%"
//           height="100%"
//           sm={12}
//           md={12}
//           lg={9}
//           // component="form"
//           position="relative"
//         >
//           {/* Hamburger Menu for smaller screens */}

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={toggleSidebar}
//             sx={{
//               display: {
//                 lg: "none",
//               }, // Show only on smaller screens

//               position: "absolute",

//               // top: "10px",

//               left: "10px",
//             }}
//           >
//             <MenuIcon />
//           </IconButton>

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={ClearFormData}
//             sx={{
//               display: {}, // Show only on smaller screens

//               position: "absolute",

//               // top: "10px",

//               right: "10px",
//             }}
//           >
//             <RefreshIcon />
//           </IconButton>

//           <Grid
//             item
//             width={"100%"}
//             py={0.5}
//             alignItems={"center"}
//             border={"1px solid silver"}
//             borderBottom={"none"}
//           >
//             <Typography
//               textAlign={"center"}
//               alignContent={"center"}
//               height={"100%"}
//             >
//               Cash AR Invoice
//             </Typography>
//           </Grid>

//           <Grid
//             container
//             item
//             width={"100%"}
//             height={"100%"}
//             border={"1px silver solid"}
//           >
//             <Grid
//               container
//               item
//               padding={1}
//               md={12}
//               sm={12}
//               height="calc(100% - 40px)"
//               overflow={"scroll"}
//               sx={{ overflowX: "hidden" }}
//               position={"relative"}
//             >
//               <Box
//                 component="form"
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                   width: "100%",
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid container item>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="Job_SO_DocEntry"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextSearchButton
//                             label="JOB CARD/SO NO"
//                             onClick={() => {
//                               OpenDailog();
//                             }}
//                             {...field}
//                             error={!!error}
//                             helperText={error ? error.message : null}
//                           />
//                         )}
//                       />
//                       <SearchModel
//                         open={isDialogOpen}
//                         onClose={ModelClose}
//                         onCancel={ModelClose}
//                         title="JOB Card/So No"
//                         onChange={onHandleSearchGetListForCreate}
//                         value={searchTextGetListForCreate}
//                         onClickClear={triggerClearSearchTwice}
//                         cardData={
//                           <>
//                             <InfiniteScroll
//                               style={{ textAlign: "center" }}
//                               dataLength={
//                                 getListData.length === 0
//                                   ? getListSearchData.length
//                                   : getListData.length
//                               }
//                               next={fetchMoreGetListForCreate}
//                               hasMore={hasMoreGetListForCreate}
//                               loader={
//                                 <BeatLoader
//                                   color={theme.palette.mode === "light" ? "black" : "white"}
//                                 />
//                               }
//                               scrollableTarget="getListForCreateScroll"
//                               endMessage={
//                                 <Typography textAlign={"center"}>No More Records</Typography>
//                               }
//                             >
//                               {(getListSearchData.length === 0
//                                 ? getListData
//                                 : getListSearchData
//                               ).map((item, index) => (
//                                 <CardComponent
//                                   key={index}
//                                   title={item.Job_SO_DocEntry}
//                                   subtitle={item.CardName}
//                                   description={item.PhoneNumber1}
//                                   onClick={() => {
//                                     onSelectRequest(item);
//                                   }}
//                                 />
//                               ))}
//                             </InfiniteScroll>
//                           </>
//                         }
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="RegistrationNo"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="RegistrationNo"
//                             type="text"
//                             {...field}
//                             error={!!error}
//                             helperText={error ? error.message : null}
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="VehInwardNo"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="Inward No"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign="center"
//                       key="VehInward-Date"
//                     >
//                       <Controller
//                         name="VehInwardDate"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputDatePickerField
//                             label="INWARD DATE"
//                             name={field.name}
//                             value={field.value ? dayjs(field.value) : undefined}
//                             onChange={(date) =>
//                               field.onChange(
//                                 date ? date.toISOString : undefined
//                               )
//                             }
//                             error={!!error}
//                             helperText={error ? error.message : null}
//                           />
//                         )}
//                       />
//                     </Grid>

//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="CardName"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="Customer Name"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="JobWorkAt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="Job Work At"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="VehInwardTime"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="Inward Time"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="PhoneNumber1"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="CUSTOMER NUMBER"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="JobRemarks"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextArea
//                             label="JOB WORK DETAILS"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="Email"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="CUSTOMER Email"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={4}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="DocNum"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="INV NO"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                   </Grid>
//                   <Grid
//                     container
//                     item
//                     sx={{
//                       px: 2,
//                       overflow: "auto",
//                       width: "100%",
//                       // backgroundColor: "#f2.3f2",
//                       // height: "100%",
//                     }}
//                   >
//                     <Paper sx={{ width: "100%" }}>
//                       <DataGrid
//                         columnHeaderHeight={35}
//                         rowHeight={40}
//                         className="datagrid-style"
//                         sx={{
//                           backgroundColor:
//                             theme.palette.mode === "light" ? "#fff" : "#373842",
//                           "& .MuiDataGrid-cell": {
//                             border: "none",
//                           },
//                           "& .MuiDataGrid-cell:focus": {
//                             outline: "none",
//                           },
//                         }}
//                         rows={oLines}
//                         getRowId={(row) => row.ItemCode}
//                         columns={columns}
//                         initialState={{
//                           pagination: {
//                             paginationModel: {
//                               pageSize: 3,
//                             },
//                           },
//                         }}
//                         hideFooter
//                         disableRowSelectionOnClick
//                         pageSizeOptions={[3]}
//                       />
//                     </Paper>
//                   </Grid>

//                   <Grid container item mt={1}>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="NetPartsValue"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="PARTS VALUE"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="DesiredDisc"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="DISC(%)"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="DesiredDiscAmt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="DICS AMT"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="SpecialDisc"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="SPECIAL DISC(%)"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="SpecialDiscAmt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="SPECIAL DISC AMT"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>

//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="RoundingAmt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="ROUNDING OFF"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="ServiceAndInstallation"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="SERVICE & INSURANCE"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="TotalPartsValue"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="NET PARTS VALUE"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>

//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="ShippingAmt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="SHIPPING "
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="TotalDocAmt"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="TOTAL DOC VALUE"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="AdvanceAmount"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="ADVANCE PAID"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>

//                     <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="DueAmount"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="DUE AMOUNT"
//                             type="text"
//                             {...field}
//                             error={!!error}
//                             helperText={error ? error.message : null}
//                           />
//                         )}
//                       />
//                     </Grid>
//                   </Grid>

//                   <Grid container item>
//                     <Grid item width="100%" mt={3} border="1px solid grey">
//                       <Tabs
//                         value={tabvalue}
//                         onChange={handleTabChange}
//                         aria-label="disabled tabs example"
//                         variant="scrollable"
//                         scrollButtons="auto"
//                       >
//                         <Tab value={0} label="Cash" />
//                         <Tab value={1} label="Credit card" />
//                         <Tab value={2} label="Bank Transfer" />
//                       </Tabs>
//                       <Divider />
//                       {tabvalue === 0 && (
//                         <>
//                           <Grid container>
//                             <Grid
//                               item
//                               sm={5}
//                               md={6}
//                               lg={4}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="CashAmount"
//                                 control={control}
//                                 rules={{
//                                   required: "Total Deu Amount is Required",
//                                 }}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="CASH PAID"
//                                     type="text"
//                                     {...field}
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                             <Grid
//                               item
//                               sm={5}
//                               md={6}
//                               lg={4}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name=""
//                                 disabled
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="CASH ACCOUNT"
//                                     type="text"
//                                     {...field}
//                                     error={!!error} // Pass error state to the FormComponent if needed
//                                     helperText={error ? error.message : null} // Show the validation message
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                             <Grid
//                               item
//                               sm={5}
//                               md={6}
//                               lg={4}
//                               xs={12}
//                               textAlign="center"
//                               key="VehInward-Date"
//                             >
//                               <Controller
//                                 name="VehInwardDate"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputDatePickerField
//                                     label="RECEIPT DATE"
//                                     name={field.name}
//                                     value={dayjs(undefined)}
//                                     onChange={(date) =>
//                                       field.onChange(
//                                         date ? date.toISOString : undefined
//                                       )
//                                     }
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                           </Grid>
//                         </>
//                       )}
//                       {tabvalue === 1 && (
//                         <>
//                           <Grid container>
//                             <Grid
//                               container
//                               item
//                               lg={6}
//                               xs={12}
//                               md={6}
//                               sm={6}
//                               textAlign={"center"}
//                             >
//                               <RadioButtonsField
//                                 control={control}
//                                 name="myRadioGroup"
//                                 data={[
//                                   { value: "KNET", label: "KNET" },
//                                   { value: "MASTER", label: "MASTER" },
//                                   { value: "VISA", label: "VISA" },
//                                   { value: "MF", label: "MF" },
//                                   { value: "TABBY", label: "TABBY" },
//                                   { value: "TAMARA", label: "TAMARA" },
//                                 ]}
//                               />

//                               <Grid
//                                 item
//                                 sm={12}
//                                 md={6}
//                                 lg={6}
//                                 xs={12}
//                                 textAlign={"center"}
//                               >
//                                 <Controller
//                                   name="Creditno"
//                                   control={control}
//                                   render={({
//                                     field,
//                                     fieldState: { error },
//                                   }) => (
//                                     <InputTextField
//                                       label="Credit Card No"
//                                       type="text"
//                                       {...field}
//                                       error={!!error}
//                                       helperText={error ? error.message : null}
//                                     />
//                                   )}
//                                 />
//                               </Grid>

//                               <Grid
//                                 item
//                                 sm={12}
//                                 md={6}
//                                 lg={6}
//                                 xs={12}
//                                 textAlign={"center"}
//                               >
//                                 <Controller
//                                   name="Amount"
//                                   control={control}
//                                   render={({
//                                     field,
//                                     fieldState: { error },
//                                   }) => (
//                                     <SmallInputTextField
//                                       label="Amount"
//                                       type="text"
//                                       {...field}
//                                       error={!!error}
//                                       helperText={error ? error.message : null}
//                                     />
//                                   )}
//                                 />
//                               </Grid>

//                               <Grid
//                                 item
//                                 sm={12}
//                                 md={6}
//                                 lg={6}
//                                 xs={12}
//                                 textAlign={"center"}
//                               >
//                                 <Controller
//                                   name="AuthCode"
//                                   control={control}
//                                   rules={{
//                                     required: "Authorization code is required",

//                                     maxLength: {
//                                       value: 10,
//                                       message:
//                                         "Authorization code must be exactly 10 digits",
//                                     },
//                                   }}
//                                   render={({
//                                     field,
//                                     fieldState: { error },
//                                   }) => (
//                                     <InputTextField
//                                       label="AUTHORIZATION CODE"
//                                       type="text"
//                                       {...field}
//                                       error={!!error}
//                                       helperText={error ? error.message : null}
//                                       onChange={(e) => {
//                                         const value = e.target.value;
//                                         field.onChange(value); // Update the field value
//                                         trigger("AuthCode"); // Trigger validation
//                                       }}
//                                     />
//                                   )}
//                                 />
//                               </Grid>

//                               <Grid
//                                 item
//                                 sm={12}
//                                 md={6}
//                                 lg={6}
//                                 xs={12}
//                                 textAlign={"center"}
//                               >
//                                 <Button
//                                   variant="contained"
//                                   color="success"
//                                   sx={{ px: 5, mt: 1 }}
//                                   onClick={addRow}
//                                 >
//                                   ADD
//                                 </Button>
//                               </Grid>
//                             </Grid>
//                             <Grid item lg={6} xs={12} md={6} sm={6}>
//                               <TableContainer
//                                 // component={Paper}
//                                 sx={{ overflow: "auto" }}
//                               >
//                                 <Table
//                                   stickyHeader
//                                   size="small"
//                                   // className="table-style"
//                                 >
//                                   <TableHead>
//                                     <TableRow>
//                                       <TableCell>A/C CODE</TableCell>
//                                       <TableCell>CARD NAME</TableCell>
//                                       <TableCell>CARD NO</TableCell>
//                                       <TableCell>AMOUNT</TableCell>
//                                       <TableCell></TableCell>
//                                     </TableRow>
//                                   </TableHead>
//                                   <TableBody>
//                                     {bankData.map((data, index) => (
//                                       <TableRow key={index}>
//                                         <TableCell component="th" scope="row">
//                                           {data.AuthCode}
//                                         </TableCell>
//                                         <TableCell>
//                                           {data.myRadioGroup}
//                                         </TableCell>
//                                         <TableCell>{data.Creditno}</TableCell>
//                                         <TableCell>{data.Amount}</TableCell>
//                                         <TableCell>
//                                           <IconButton
//                                             onClick={() =>
//                                               removeTableRow1(index)
//                                             }
//                                           >
//                                             <RemoveCircleIcon
//                                               sx={{ color: "red" }}
//                                             />
//                                           </IconButton>
//                                         </TableCell>
//                                       </TableRow>
//                                     ))}
//                                   </TableBody>
//                                 </Table>
//                               </TableContainer>
//                             </Grid>
//                           </Grid>
//                         </>
//                       )}

//                       {tabvalue === 2 && (
//                         <>
//                           <Grid container>
//                             <Grid
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="cardname"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="TRANSFER sUM"
//                                     type="text"
//                                     {...field}
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                             <Grid
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="cardname"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="TRANSFER REF NUMBER"
//                                     type="text"
//                                     {...field}
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                             <Grid
//                               item
//                               xs={12}
//                               md={6}
//                               sm={6}
//                               lg={6}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="Series"
//                                 rules={{ required: "this field is requered" }}
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputSelectTextField
//                                     type="number"
//                                     {...field}
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                     label="SERIES"
//                                     data={[
//                                       {
//                                         key: "1201022",
//                                         value: "Bank NBK 2008134452",
//                                       },
//                                     ]}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                             <Grid
//                               item
//                               sm={5}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign="center"
//                               key="VehInward-Date"
//                             >
//                               <Controller
//                                 name="VehInwardDate"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputDatePickerField
//                                     label="Transfer Date"
//                                     name={field.name}
//                                     value={dayjs(undefined)}
//                                     onChange={(date) =>
//                                       field.onChange(
//                                         date ? date.toISOString : undefined
//                                       )
//                                     }
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                   />
//                                 )}
//                               />
//                             </Grid>
//                           </Grid>
//                         </>
//                       )}
//                     </Grid>
//                   </Grid>

//                   <Grid container item>
//                     <Grid sm={6} md={6} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="DueAmount"
//                         control={control}
//                         rules={{ required: "Paid Amount " }}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="Total DEU AMOUNT"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid sm={6} md={6} lg={2.3} xs={6} textAlign={"center"}>
//                       <Controller
//                         name="PaidAmo"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <SmallInputTextField
//                             label="PAID DEU AMOUNT"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={3.5}
//                       xs={12}
//                       textAlign={"center"}
//                     >
//                       <Controller
//                         name="PhoneNumbr1"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputTextField
//                             label="SAP INVOICE NUMBER"
//                             type="text"
//                             {...field}
//                             error={!!error} // Pass error state to the FormComponent if needed
//                             helperText={error ? error.message : null} // Show the validation message
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid
//                       item
//                       sm={6}
//                       md={6}
//                       lg={3.5}
//                       xs={12}
//                       textAlign="center"
//                       key="VehInward-Date"
//                     >
//                       <Controller
//                         name="VehInwardDate"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputDatePickerField
//                             label="INVOICE DATE"
//                             name={field.name}
//                             value={field.value ? dayjs(field.value) : undefined}
//                             onChange={(date) => field.onChange(date)}
//                             error={!!error}
//                             helperText={error ? error.message : null}
//                           />
//                         )}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             <Grid
//               item
//               px={1}
//               // md={12}
//               xs={12}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "end",
//                 position: "sticky",
//                 bottom: "0px",
//               }}
//             >
//               <Button variant="contained" color="success" type="submit">
//                 PROCESS INVOICE
//               </Button>

//               <Button variant="contained" color="primary">
//                 PRINT
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// }
