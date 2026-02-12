// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import {
//   Box,
//   Button,
//   Checkbox,
//   Divider,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   Modal,
//   Paper,
//   Typography,
//   useTheme
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import Spinner from "../../Loaders/Spinner";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputTextField,
//   InputTextSearchField,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";
// import { SearchModel1 } from "../Components/SearchModel";

// const columns = [
//   {
//     field: "Item Code",
//     headerName: "Item Code",
//     width: 120,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "Item Description",
//     headerName: "Item Description",
//     width: 150,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "FITTING",
//     headerName: "fitting",
//     width: 80,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "TIME(MIN)",
//     headerName: "time-min",
//     width: 80,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "EDIT",
//     headerName: "edit",
//     width: 80,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "DELETE",
//     headerName: "delete",
//     width: 80,
//     editable: true,
//     flex: 1,
//   },
// ];

// const rows = [
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
// ];

// const columns1 = [
//   {
//     field: "Itemde",
//     headerName: "Item Code",
//     width: 120,
//     editable: true,
//   },
//   {
//     field: "Itemame",
//     headerName: "Item Name",
//     width: 150,
//     editable: true,
//     flex: 1,
//   },
//   {
//     field: "fitng",
//     headerName: "Fitting Charge",
//     width: 80,
//     editable: true,
//   },
//   {
//     field: "price",
//     headerName: "Price",
//     width: 80,
//     editable: true,
//   },
// ];

// const rows1 = [
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
// ];

// const initial = {
//   DocEntry: "",
//   VehicleID: "",
//   VehicleName: "",
//   VehicleMakeId: "",
//   VehicleModeId: "",
//   VehicleMfgYear: "",
//   Remark: "",
//   Status: true,
// };

// export default function FittingChargeAndTime( user ) {
//   const theme = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [card, setCard] = useState([]);  
//   const [searchText, setSearchText] = useState("");
//   const [searchText1, setSearchText1] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [filteredCard1, setFilteredCard1] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [hasMoreOpen1, setHasMoreOpen1] = useState(true);
//   const [openPage, setOpenPage] = useState(0);
//   const [DocEntry, setDocEntry] = useState("");
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [open, setOpen] = useState(false);
//   const [openPage1, setOpenPage1] = useState(0);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [vehicle, setVehicle] = useState([]);
//   const [oLines, setoLines] = useState([]);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   const openDialog = () => {
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//   };

//   const toggleDrawer = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   const onHandleSearch = (event) => {
//     const searchText = event.target.value;
//     setFilteredCard([]);
//     setSearchText(searchText);
//     setOpenPage(0);
//     if (searchText !== "") {
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/VehiclePartMap/search/${searchText}/0`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setFilteredCard(response.data.values);

//           if (response.data.values.length < 20) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const onHandleSearch1 = (event) => {
//     const searchText = event.target.value;
//     setFilteredCard([]);
//     setSearchText(searchText);
//     setOpenPage(0);
//     if (searchText !== "") {
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/VehiclePartMap/search/${searchText}/0`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setFilteredCard(response.data.values);

//           if (response.data.values.length < 20) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };
  
//   const getListForCreate = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/VehiclePartMap/GetListForCreate/0`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setVehicle(response.data.values);

//         if (response.data.values.length < 20) {
//           setHasMoreOpen1(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const onClickClearGetListCreateSearch = () => {
//     setSearchText1("");
//     setFilteredCard1([]);
//     setVehicle([]);
//     setOpenPage1(0);
//     setHasMoreOpen1(true);
//     setTimeout(() => {
//       getListForCreate();
//     }, 100);
//   };

//   const triggerClearSearchTwice = () => {
//     onClickClearGetListCreateSearch();
//     setTimeout(() => {
//       onClickClearGetListCreateSearch();
//     }, 10); // You can adjust the delay time in milliseconds
//   };

//   const fetchMoreGetListForCreate = () => {
//     if (searchText1 === "") {
//       const page = openPage1 + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/VehiclePartMap/GetListForCreate/search/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setVehicle((prevPosts) => [...prevPosts, ...response.data.values]);
//           setOpenPage1(page);
//           if (response.data.values.length === 0) {
//             setHasMoreOpen1(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       const page = openPage1 + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/VehiclePartMap/GetListForCreate/search/${searchText}/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setFilteredCard1((prevPosts) => [
//             ...prevPosts,
//             ...response.data.values,
//           ]);
//           setOpenPage1(page);
//           if (response.data.values.length === 0) {
//             setHasMoreOpen1(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const getFittingChargesListData = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/VehiclePartMap/pages/0`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setCard(response.data.values);

//         if (response.data.values.length < 20) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const getAllVehicleList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/VehiclePartMap/GetListForCreate/0`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setVehicle(response.data.values);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   useEffect(() => {
//     getFittingChargesListData();
//     getAllVehicleList();
//   }, []);

//   const setFittingChargesListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/VehiclePartMap/${DocEntry}`)
//       .then((response) => {
//         toggleDrawer();
//         const data = response.data.values[0];
//         reset(data);
//         setSaveUpdateName("UPDATE");
//         setDocEntry(DocEntry);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   const onSelectRequest = (item) => {
//     console.log(item);
//     reset({
//       ...item,
//       IssuedBy: user?.UserName || 'Unknown User', // Handle undefined user
//     });
//     setoLines(item.oLines);
//     setIsDialogOpen(false); // Close dialog after selection
//   };

//   const fetchMoreData = () => {
//     if (searchText === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/VehiclePartMap/pages/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setCard((prevPosts) => [...prevPosts, ...response.data.values]);
//           setVehicle((prevPosts) => [...prevPosts, ...response.data.values]);
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
//           url: `${BASE_URL}/VehiclePartMap/search/${searchText}/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setFilteredCard((prevPosts) => [
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

//   const clearFormData = () => {
//     reset(initial);
//     setSaveUpdateName("SAVE");
//   };

//   const onClickClearSearch = () => {
//     setSearchText("");
//     setFilteredCard([]);
//     setCard([]);
//     setVehicle([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getFittingChargesListData();
//     }, 100);
//   };

//   const triggeronClickClearSearchTwice = () => {
//     onClickClearSearch();
//     setTimeout(() => {
//       onClickClearSearch();
//     }, 10);
//   };

//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: initial,
//   });
  
//   const handleSubmitForm = (data) => {
//     const fittingChargeData = {
//       userId: sessionStorage.getItem("UserId"),
//       createdBy: sessionStorage.getItem("CreatedBy"),
//       VehicleId: String(data.VehicleID),
//       vehicleName: data.VehicleName,
//       remarks: data.Remarks,
//       status: data.Status ? "1" : "0",
//       modifiedBy: sessionStorage.getItem("UserId"),
//       oLines: data.oLines.map((fitLine) => ({
//         UserId: sessionStorage.getItem("UserId"),
//         CreatedBy: sessionStorage.getItem("CreatedBy"),
//         ItemCode: fitLine.ItemCode,
//         FittingCharge: fitLine.FittingCharge,
//         FittingTime: fitLine.FittingTime,
//         DocEntry: String(fitLine.DocEntry),
//         ItemName: fitLine.ItemName,
//         ModifiedBy: sessionStorage.getItem("CreatedBy"),
//       })),
//     };


//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       axios
//         .post(`${BASE_URL}/vehiclePartMap`, fittingChargeData)
//         .then((resp) => {
//           if (resp.data.success) {
//             getFittingChargesListData();
//             clearFormData();
//             setLoading(false);

//             Swal.fire({
//               title: "Success!",
//               text: "Fitting & Time Added",
//               icon: "success",
//               confirmButtonText: "Ok",
//               timer: 1000,
//             });
//           } else {
//             setLoading(false);
//             Swal.fire({
//               title: "Error!",
//               text: resp.data.message,
//               icon: "warning",
//               confirmButtonText: "Ok",
//             });
//           }
//         })
//         .catch((err) => {
//           Swal.fire({
//             title: "Error!",
//             text: "something went wrong",
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//         });
//     } else {
//       Swal.fire({
//         text: `Do You Want Update "${data.VehicleMakeId}-${data.VehicleModeId}-${data.VehicleMfgYear}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setLoading(true);

//           axios
//             .put(`${BASE_URL}/vehiclePartMap/${DocEntry}`, fittingChargeData)
//             .then((response) => {
//               if (response.data.success) {
//                 getFittingChargesListData();
//                 clearFormData();
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Success!",
//                   text: "Fitting & Time Updated",
//                   icon: "success",
//                   confirmButtonText: "Ok",
//                   timer: 1000,
//                 });
//               } else {
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Error!",
//                   text: response.data.message,
//                   icon: "warning",
//                   confirmButtonText: "Ok",
//                 });
//               }
//             })
//             .catch(() => {
//               setLoading(false);

//               Swal.fire({
//                 title: "Error!",
//                 text: "something went wrong",
//                 icon: "warning",
//                 confirmButtonText: "Ok",
//               });
//             });
//         } else {
//           setLoading(false);

//           Swal.fire({
//             text: "Fitting & Time Not Updated",
//             icon: "info",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         }
//       });
//     }
//   };

//   const handleOnDelete = (data) => {
//     Swal.fire({
//       text: `Do You Want Delete "${data.VehicleMakeId}-${data.VehicleModeId}-${data.VehicleMfgYear}"`,
//       icon: "question",
//       confirmButtonText: "YES",
//       cancelButtonText: "No",
//       showConfirmButton: true,
//       showDenyButton: true,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLoading(true);

//         axios.delete(`${BASE_URL}/vehiclePartMap/${DocEntry}`).then((resp) => {
//           if (resp.data.success) {
//             clearFormData();
//             getFittingChargesListData();
//             setLoading(false);
//             Swal.fire({
//               text: "Fitting & Time Deleted",
//               icon: "success",
//               toast: true,
//               showConfirmButton: false,
//               timer: 1000,
//             });
//           } else {
//             setLoading(false);
//             Swal.fire({
//               title: resp.data.success,
//               text: resp.data.message,
//               icon: "info",
//               toast: true,
//               showConfirmButton: false,
//               timer: 1500,
//             });
//           }
//         });
//       } else {
//         setLoading(false);
//         Swal.fire({
//           text: "Fitting & Time Not Deleted",
//           icon: "info",
//           toast: true,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
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
//           Fitting Charges and Time List
//         </Typography>
//         <IconButton
//           edge="end"
//           color="inherit"
//           aria-label="close"
//           onClick={() => setDrawerOpen(false)}
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
//         // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
//         sx={{
//           backgroundColor:
//             theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//         }}
//       >
//         <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
//           <Box
//             sx={{
//               width: "100%",
//               height: "100%",
//               px: 1,
//               overflow: "scroll",
//               overflowX: "hidden",
//               typography: "body1",
//             }}
//             id="ListScroll"
//           >
//             <Grid
//               item
//               padding={1}
//               md={12}
//               sm={12}
//               width={"100%"}
//               sx={{
//                 position: "sticky",
//                 top: "0",
//                 backgroundColor:
//                   theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//               }}
//             >
//               <SearchInputField
//                 onChange={onHandleSearch}
//                 value={searchText}
//                 onClickClear={triggeronClickClearSearchTwice}
//               />
//             </Grid>
//             <InfiniteScroll
//               style={{ textAlign: "center" }}
//               dataLength={searchText === "" ? card.length : filteredCard.length}
//               next={fetchMoreData}
//               hasMore={hasMoreOpen}
//               loader={<BeatLoader />}
//               scrollableTarget="ListScroll"
//               endMessage={<Typography>No More Records</Typography>}
//             >
//               {(filteredCard.length === 0 ? card : filteredCard).map((item) => (
//                 <CardComponent
//                   key={item.DocEntry}
//                   title={item.VehicleMakeId}
//                   subtitle={item.VehicleMfgYear}
//                   description={item.VehicleModeId}
//                   onClick={() => {
//                     setFittingChargesListData(item.DocEntry);
//                   }}
//                 />
//               ))}
//             </InfiniteScroll>
//           </Box>
//         </Grid>
//       </Grid>
//     </>
//   );

//   return (
//     <>
//       <Spinner open={loading} />
//       <Grid
//         container
//         width={"100%"}
//         height="calc(100vh - 110px)"
//         position={"relative"}
//         component={"form"}
//         onSubmit={handleSubmit(handleSubmitForm)}
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
//             display: { lg: "block", xs: `${drawerOpen ? "block" : "none"}` },
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
//           position="relative"
//         >
//           {/* Hamburger Menu for smaller screens */}

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={toggleDrawer}
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
//             onClick={clearFormData}
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
//               Fitting Charges and Time
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
//               xs={12}
//               height="calc(100% - 40px)"
//               overflow={"scroll"}
//               sx={{ overflowX: "hidden" }}
//               position={"relative"}
//             >
//               <Box
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item md={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="DocEntry"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextSearchField
//                           label="VEHICLE ID"
//                           type="text"
//                           onClick={() => {
//                             openDialog();
//                             // ClearForm();
//                           }}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <SearchModel1
//                     open={isDialogOpen}
//                     onClose={handleCloseDialog}
//                     onCancel={handleCloseDialog}
//                     title="Select Vehicle No"
//                     onChange={onHandleSearch1}
//                     value={searchText1}
//                     onClickClear={triggerClearSearchTwice}
//                     id='getListForCreateScroll'
//                     cardData={
//                       <>
//                         <InfiniteScroll
//                           dataLength={
//                             searchText1.length === 0
//                               ? vehicle.length
//                               : filteredCard1.length
//                           }
//                           next={fetchMoreGetListForCreate}
//                           hasMore={hasMoreOpen1}
//                           loader={
//                             <BeatLoader
//                               color={
//                                 theme.palette.mode === "light"
//                                   ? "black"
//                                   : "white"
//                               }
//                             />
//                           }
//                           scrollableTarget="getListForCreateScroll"
//                           endMessage={
//                             <Typography textAlign={"center"}>
//                               No More Records
//                             </Typography>
//                           }
//                         >
//                           {(filteredCard1.length === 0
//                             ? vehicle
//                             : filteredCard1
//                           ).map((item) => (
//                             <CardComponent
//                               key={item.DocEntry}
//                               title={item.VehicleMakeId}
//                               subtitle={item.VehicleMfgYear}
//                               description={item.VehicleModeId}
//                               onClick={() => {
//                                 onSelectRequest(item);
//                               }}
//                             />
//                           ))}
//                         </InfiniteScroll>
//                       </>
//                     }
//                   />

//                   {/* --------------------------------------------------------------------------------------- */}
//                   {/* <Dialog
//                     style={{ margin: "auto" }}
//                     open={isDialogOpen}
//                     onClose={handleCloseDialog}
//                     scroll="paper"
//                   >

//                     <DialogTitle>
//                       <Grid item display={"flex"} justifyContent={"center"}>
//                         <PersonAddAlt1OutlinedIcon />
//                         <Typography textAlign={"center"} fontWeight={"bold"}>
//                           &nbsp; &nbsp;Select Vehicle No
//                         </Typography>
//                       </Grid>
//                     </DialogTitle>

//                     <Divider color="gray" />

//                     <DialogContent className="bg-light" sx={{ bgcolor: 'red'}}>
//                       <Grid
//                         container
//                         item
//                         width={"100%"}
//                         height={"80%"}
//                         border={"1px silver solid"}
//                         bgcolor={'pink'}
//                         sx={{
//                           backgroundColor:
//                             theme.palette.mode === "light"
//                               ? "#F5F6FA"
//                               : "#080D2B",
//                             margin: 0,
//                         }}
//                       >
//                         <Grid
//                           item
//                           md={12}
//                           sm={12}
//                           width={"100%"}
//                           height={`100%`}
//                           bgcolor={'yellow'}
//                         >
//                           <Box
//                             sx={{
//                               width: "100%",
//                               height: "100%",
//                               display: "flex",
//                               flexDirection: "column",
//                             }}
//                           >
//                             <Box
//                               sx={{
//                                 position: "sticky",
//                                 mt: 0,
//                                 zIndex: 10,
//                                 backgroundColor:
//                                   theme.palette.mode === "light"
//                                     ? "#F5F6FA"
//                                     : "#080D2B",
//                                 padding: 1,
//                               }}
//                             >
//                               <SearchInputField
//                                 onChange={onHandleSearch}
//                                 value={searchText}
//                                 onClickClear={triggeronClickClearSearchTwice}
//                               />
//                             </Box>

//                             <Box
//                               sx={{
//                                 overflowY: "auto", // Enable vertical scrolling
//                                 flex: 1, // Allow this box to fill the remaining space
//                                 padding: 1,
//                                 maxHeight: "calc(100%)", // Adjust based on SearchInputField height
//                               }}
//                             >
//                               <InfiniteScroll
//                                 style={{ textAlign: "center" }}
//                                 dataLength={
//                                   searchText === ""
//                                     ? card.length
//                                     : filteredCard.length
//                                 }
//                                 // next={fetchMoreData}
//                                 hasMore={hasMoreOpen}
//                                 loader={<BeatLoader />}
//                                 scrollableTarget="ListScroll"
//                                 endMessage={
//                                   <Typography>No More Records</Typography>
//                                 }
//                               >
//                                 {(filteredCard.length === 0
//                                   ? vehicle
//                                   : filteredCard
//                                 ).map((item) => (
//                                   <CardComponent
//                                     key={item.DocEntry}
//                                     title={item.VehicleMakeId}
//                                     subtitle={item.VehicleMfgYear}
//                                     description={item.VehicleModeId}
//                                     onClick={() => {
//                                       // setDocNumberListData(item.DocEntry);
//                                     }}
//                                   />
//                                 ))}
//                               </InfiniteScroll>
                         
//                             </Box>
//                           </Box>
//                         </Grid>
//                       </Grid>
//                     </DialogContent>

//                     <DialogActions sx={{ justifyContent: "flex-end", pb: 2 }}>
//                       <Button
//                         variant="contained"
//                         color="error"
//                         name="Close"
//                         onClick={handleCloseDialog} // Make sure to use the correct close function
//                         size="small"
//                       >
//                         close
//                       </Button>
//                     </DialogActions>
                    
//                   </Dialog> */}
//                   {/* --------------------------------------------------------------------------------------- */}

//                   <Grid item md={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="VehicleMakeId"
//                       control={control}
//                       rules={{
//                         required: "Vehicle Name is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VEHICLE NAME"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="Remark"
//                       control={control}
//                       // rules={{
//                       //   required: "Vehicle Maker is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="REMARK"
//                           type="text"
//                           {...field}
//                           // error={!!error} // Pass error state to the FormComponent if needed
//                           // helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={4} xs={12} textAlign="center">
//                     <Button
//                       variant="contained"
//                       size="small"
//                       color="success"
//                       onClick={handleOpen}
//                       sx={{
//                         color: "white",
//                         height: "40px",
//                         alignItems: "center",
//                         alignContent: "center",
//                         alignSelf: "center",
//                         ml: 3,
//                         mt: 1,
//                       }}
//                       endIcon={<SearchOutlinedIcon />}
//                     >
//                       SEARCH
//                     </Button>
//                   </Grid>
//                   {/* ---------------------------------------------------- Model ---------------------------------------------------------------------------------- */}
//                   <Modal open={open} onClose={handleClose}>
//                     <Paper
//                       style={{
//                         padding: "20px",
//                         height: "70%",
//                         width: "85%",
//                         margin: "auto",
//                         marginTop: "200px",
//                       }}
//                     >
//                       <Grid container spacing={2} style={{ marginTop: "20px" }}>
//                         <Grid item xs={12}>
//                           <Paper
//                             style={{
//                               padding: "10px",
//                               height: "550px", // Set a fixed height
//                               overflow: "hidden", // Prevent overflow of the Paper
//                             }}
//                           >
//                             <div style={{ height: "100%", overflow: "auto" }}>
//                               <DataGrid
//                                 columns={columns1}
//                                 rows={rows1}
//                                 columnHeaderHeight={35}
//                                 rowHeight={45}
//                                 pagination={false}
//                                 hideFooter
//                                 disableColumnMenu
//                                 autoHeight={false} // Prevents auto height adjustment
//                               />
//                             </div>
//                           </Paper>
//                         </Grid>
//                       </Grid>
//                     </Paper>
//                   </Modal>
//                   {/* ---------------------------------------------------- Model ---------------------------------------------------------------------------------- */}

//                   {/* -------------------------------------------------------------------------------------------------------------------------------------- */}
//                   <Grid item md={4} xs={12} container justifyContent="center">
//                     <Grid item minWidth={220}>
//                       <Controller
//                         name="Status" // The field name used in the form
//                         control={control} // Control object from useForm
//                         defaultValue={false} // Optional: Set default value
//                         rules={{
//                           required: "please select Vehicle Part Type", // Field is required
//                         }}
//                         render={({ field, fieldState: { error } }) => (
//                           <FormControlLabel
//                             control={
//                               <Checkbox
//                                 {...field} // Spread the field props to connect the input with the form
//                                 checked={field.value} // Bind the checked state to the form's value
//                               />
//                             }
//                             label="Active"
//                             sx={{ width: "100%" }}
//                           />
//                         )}
//                       />
//                     </Grid>
//                   </Grid>
//                   {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

//                   <Divider
//                     sx={{ mt: 1, width: "100%", color: "gray", mb: 2 }}
//                   />
//                 </Grid> 
//               </Box>

//               <Grid
//                 container
//                 item
//                 width={"100%"}
//                 p={2}
//                 pt={0}
//                 my={2}
//                 minHeight={"300px"}
//                 maxHeight={"580px"}
//                 component={Paper}
//                 style={{
//                   overflowX: "hidden",
//                   fontWeight: "700",
//                   fontSize: "12px",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     height: "100%", // Use full height of the parent Grid
//                     width: "100%",
//                     "& .MuiDataGrid-root": {
//                       border: "none",
//                       overflowX: "hidden", // Prevent horizontal scroll
//                     },
//                     "& .MuiDataGrid-columnHeaders": {
//                       position: "sticky",
//                       top: 0,
//                       backgroundColor: "white",
//                       zIndex: 1,
//                     },
//                     "& .MuiDataGrid-virtualScroller": {
//                       overflowY: "auto", // Allow vertical scroll
//                       maxHeight: "500px", // Ensure this is less than the Box height
//                     },
//                     "& .MuiDataGrid-footer": {
//                       display: "none",
//                     },
//                   }}
//                 >
//                   <DataGrid
//                     className="datagrid-style"
//                     columns={columns}
//                     rows={rows}
//                     columnHeaderHeight={35}
//                     rowHeight={45}
//                     pagination={false}
//                     hideFooter
//                     // style={{ height: "100%" }} // Ensure it takes the full height of the Box
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
//                 </Box>
//               </Grid>
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
//               <Button
//                 variant="contained"
//                 type="submit"
//                 name={SaveUpdateName}
//                 color="success"
//                 sx={{ color: "white" }}
//               >
//                 {SaveUpdateName}
//               </Button>
//               <Button
//                 variant="contained"
//                 disabled={SaveUpdateName === "SAVE"}
//                 color="error"
//                 onClick={handleOnDelete}
//               >
//                 DELETE
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* Drawer for smaller screens */}
//     </>
//   );
// }
