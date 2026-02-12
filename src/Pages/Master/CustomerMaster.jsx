// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";
// import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// import {
//   Box,
//   Button,
//   Checkbox,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import React, { useEffect, useState } from "react";

// import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
// import { PhoneNumber } from "../Components/PhoneNumber";
// import {
//   InputSelectFields,
//   InputTextField,
// } from "../Components/formComponents";

// import SearchInputField from "../Components/SearchInputField";

// import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import Spinner from "../../Loaders/Spinner";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";

// const initial = {
//   DocEntry: "",
//   CountryCode: "",
//   PhoneNumber1: "",
//   PhoneNumber2: "",
//   CountryName: "",
//   SalesHistory: "",
//   CardCode: "",
//   CardName: "",
//   Email: "",
//   Status: "true",
// };

// export default function CustomerMaster() {
//   const [formData, setFormData] = useState({
//     AddressId: "",
//     Address1: "",
//     Address2: "",
//     City: "",
//     Zipcode: "",
//     Country: "",
//     Status: false,
//   });

//   const theme = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [card, setCard] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [openPage, setOpenPage] = useState(0);
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [DocEntry, setDocEntry] = useState("");
//   const [oLines, setoLines] = useState([]);

//   // const [phone, setPhone] = useState("");
//   const [open, setOpen] = React.useState(false);

//   const handleClickOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);

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
//           url: `${BASE_URL}/BP/search/${searchText}/0`,
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

//   const removeTableRow = (index) => {
//     // if (oLines.length === 1) {
//     //   Swal.fire({
//     //     text: "At least One Item Required",
//     //     icon: "warning",
//     //     toast: true,
//     //     showConfirmButton: false,
//     //     timer: 2000,
//     //     timerProgressBar: true,
//     //   });
//     // } else
//     // {
//     // Create a new array excluding the item at the specified index
//     const updatedOLines = [...oLines];
//     updatedOLines.splice(index, 1);

//     // Update the state with the new array
//     setoLines(updatedOLines);
//     // }
//   };

//   const columns = [
//     {
//       field: "action",
//       headerName: "Action",
//       width: 100,
//       renderCell: (params) => (
//         <IconButton onClick={() => removeTableRow(params.row.AddressId)}>
//           <RemoveCircleIcon sx={{ color: "red" }} />
//         </IconButton>
//       ),
//     },
//     { field: "AddressId", headerName: "Address ID", width: 130 },
//     { field: "Address1", headerName: "Address 1", width: 130 },
//     { field: "Address2", headerName: "Address 2", width: 130 },
//     { field: "City", headerName: "City", width: 130 },
//     { field: "Zipcode", headerName: "Zipcode", width: 130 },
//     { field: "Country", headerName: "Country", width: 130 },
//     {
//       field: "Status",
//       headerName: "Status",
//       width: 100,
//       renderCell: (params) => (params.value ? "Active" : "Inactive"),
//     },
//   ];

//   const getCustomerDataList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/BP/pages/0`,
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

//   // const getCountryrDataList = () => {
//   //   axios
//   //     .request({
//   //       method: "get",
//   //       url: `${BASE_URL}/country/pages/0`,
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //     })
//   //     .then((response) => {
//   //       setCard(response.data.values);

//   //       if (response.data.values.length < 20) {
//   //         setHasMoreOpen(false);
//   //       }
//   //     })
//   //     .catch((error) => {
//   //       console.log(error);
//   //     });
//   // };

//   useEffect(() => {
//     getCustomerDataList();
//     // getCountryrDataList();
//   }, []);

//   const clearFormData = () => {
//     reset(initial);
//     setSaveUpdateName("SAVE");
//     setFormData(formData);
//   };

//   const onClickClearSearch = () => {
//     setSearchText("");
//     setFilteredCard([]);
//     setCard([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getCustomerDataList();
//     }, 100);
//   };

//   const triggeronClickClearSearchTwice = () => {
//     onClickClearSearch();
//     setTimeout(() => {
//       onClickClearSearch();
//     }, 10);
//   };

//   const setCustomerListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/BP/${DocEntry}`)
//       .then((response) => {
//         toggleDrawer();
//         const data = response.data.values[0];
//         console.log(data)
//         reset(data);
//         setSaveUpdateName("UPDATE");
//         setDocEntry(DocEntry);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   const fetchMoreData = () => {
//     if (searchText === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/BP/pages/${page}`,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//         .then((response) => {
//           setCard((prevPosts) => [...prevPosts, ...response.data.values]);
//           setOpenPage(page);
//           if (response.data.values.length === 0) {
//             setHasMoreOpen(false);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } 
//     else {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/BP/search/${searchText}/${page}`,
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

//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: initial,
//   });

//   const handleSubmitForm = (data) => {
//     const customer = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       CardCode: data.CardCode,
//       CardName: data.CardName,
//       SAPDocEntry: data.SAPDocEntry,
//       SAPDocNum: data.SAPDocNum,
//       SalesHistory: data.SalesHistory,
//       Remarks: data.Remarks || "",
//       CardType: "C",
//       GroupCode: "100",
//       Status: data.Status ? "1" : "0",
//       oLines: oLines.map((addr) => ({
//         UserId: sessionStorage.getItem("UserId"),
//         CreatedBy: sessionStorage.getItem("CreatedBy"),
//         CardCode: data.CustomerID,
//         Address1: addr.Address1,
//         Address2: addr.Address2,
//         AddressId: addr.AddressId,
//         City: addr.City,
//         Country: addr.Country,
//         State: addr.State,
//         Zipcode: addr.Zipcode,
//         Status: addr.Status ? "1" : "0",
//         AddressType: addr.AddressType,
//         ModifiedBy: sessionStorage.getItem("CreatedBy"),
//       })),
//     };

//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       axios
//         .post(`${BASE_URL}/BP`, customer)
//         .then((resp) => {
//           if (resp.data.success) {
//             getCustomerDataList();
//             clearFormData();
//             setLoading(false);

//             Swal.fire({
//               title: "Success!",
//               text: "Customer Added ",
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
//         text: `Do You Want Update "${customer.CardName}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setLoading(true);

//           axios
//             .put(`${BASE_URL}/BP/${DocEntry}`, customer)
//             .then((response) => {
//               if (response.data.success) {
//                 getCustomerDataList();
//                 clearFormData();
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Success!",
//                   text: "Customer Updated",
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
//             text: "Customer Not Updated",
//             icon: "info",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         }
//       });
//     }
//   };

//   const handleChange = (event) => {
//     const { name, value, type, checked } = event.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const onSubmit = () => {
//     setoLines((prev) => [...prev, formData]);
//     setFormData({
//       Type: "",
//       AddressId: "",
//       Address1: "",
//       Address2: "",
//       City: "",
//       Zipcode: "",
//       Country: "",
//       Status: false,
//     });
//     setOpen(false);
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
//           Customer Master List
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
//                   title={item.CardCode}
//                   subtitle={item.CardName}
//                   description={item.PhoneNumber1}
//                   onClick={() => {
//                     setCustomerListData(item.DocEntry);
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
//               Customer Master
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
//               width={"100%"}
//             >
//               <Box
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//                 noValidate
//                 autoComplete="off"
//                 width={"100%"}
//               >
//                 <Grid container>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="CardCode"
//                       control={control}
//                       // rules={{
//                       //   required: "Customer Id is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="CUSTOMER ID"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                   <Controller
//                       name="PhoneNumber1"
//                       control={control}
//                       defaultValue=""
//                       render={({ field }) => (
//                         <PhoneNumber
//                           defaultCountry="kw"
//                           label="PHONE 1"
//                           value={field.value}
//                           onChange={(phone) => field.onChange(phone)}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="SalesHistory"
//                       control={control}
//                       // rules={{
//                       //   required: "Sales History is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SALES HISTORY"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="CardName"
//                       control={control}
//                       // rules={{
//                       //   required: "Sales History is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="CUSTOMER NAME"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="PhoneNumber2"
//                       control={control}
//                       defaultValue=""
//                       render={({ field }) => (
//                         <PhoneNumber
//                           defaultCountry="kw"
//                           label="PHONE 2"
//                           value={field.value}
//                           onChange={(phone) => field.onChange(phone)}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="Email"
//                       control={control}
//                       // rules={{
//                       //   required: "Customer Email is required", // Field is required
//                       // }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="EMAIL"
//                           type="text"
//                           {...field}
//                           // error={!!error} // Pass error state to the FormComponent if needed
//                           // helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid
//                     container
//                     item
//                     sm={6}
//                     md={6}
//                     lg={4}
//                     xs={12}
//                     justifyContent={"center"}
//                   >
//                     <Grid item minWidth={220}>
//                       <Controller
//                         name="Status" // The field name used in the form
//                         control={control} // Control object from useForm
//                         defaultValue={false} // Optional: Set default value
//                         rules={{
//                           required: "please select Customer Type", // Field is required
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
//                 </Grid>

//                 <Grid item width={"100%"}>
//                   <IconButton
//                     size="small"
//                     style={{
//                       backgroundColor: "green",
//                       borderRadius: "20%",
//                       color: "white",
//                       // marginLeft: "2px",
//                       // display: "flex",
//                       // marginBottom: "5px",
//                     }}
//                     onClick={handleClickOpen}
//                   >
//                     <AddOutlinedIcon />
//                   </IconButton>

//                   <Grid
//                     item
//                     lg={12}
//                     md={12}
//                     sm={12}
//                     minHeight={"300px"}
//                     maxHeight={"500px"}
//                     spacing={2}
//                     justifyContent={"center"}
//                     width={"100%"}
//                     overflow={"scroll"}
//                     sx={{ overflowX: "scroll" }}
//                   >
//                     <DataGrid
//                       className="datagrid-style"
//                       columns={columns}
//                       rows={oLines}
//                       getRowId={(row) => row.AddressId}
//                       columnHeaderHeight={35}
//                       rowHeight={45}
//                       pagination={false}
//                       hideFooter
//                       sx={{
//                         backgroundColor:
//                           theme.palette.mode === "light"
//                             ? "#F5F6FA"
//                             : "#080D2B",
//                         "& .MuiDataGrid-cell": {
//                           border: "none",
//                         },
//                         "& .MuiDataGrid-cell:focus": {
//                           outline: "none",
//                         },
//                       }}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             {/* ---------------------*MODEL*----------------------------------------------------------- */}
//             <Grid container md={2}>
//               <Dialog
//                 style={{ margin: "auto" }}
//                 open={open}
//                 onClose={handleClose}
//                 scroll="paper"
//                 onSubmit={onSubmit}
//               >
//                 <DialogTitle>
//                   <Grid item display={"flex"} justifyContent={"center"}>
//                     <PersonAddAlt1OutlinedIcon />
//                     <Typography textAlign={"center"} fontWeight={"bold"}>
//                       &nbsp; &nbsp;Add Address Form
//                     </Typography>
//                   </Grid>
//                 </DialogTitle>
//                 <Divider color="gray" />
//                 <DialogContent className="bg-light">
//                   <Grid
//                     container
//                     // gap={1}
//                     spacing={2}
//                     style={{
//                       height: "100%",
//                       width: "100%",
//                       overflow: "auto",
//                       padding: 0,
//                     }}
//                     id="ListScrollV"
//                   >
//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputSelectFields
//                         label="TYPE"
//                         name="Type"
//                         data={[
//                           { key: "1", value: "SHIPPING" },
//                           { key: "3", value: "BILLING" },
//                         ]}
//                         value={formData.Type}
//                         onChange={handleChange}
//                       />
//                     </Grid>

//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputTextField
//                         label="Address ID"
//                         name="AddressId"
//                         error={!formData.AddressId}
//                         helperText={
//                           !formData.AddressId ? "Address ID is required" : null
//                         }
//                         value={formData.AddressId}
//                         onChange={handleChange}
//                       />
//                     </Grid>

//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputTextField
//                         label="Address 1"
//                         name="Address1"
//                         error={!formData.Address1}
//                         helperText={
//                           !formData.Address1 ? "Address 1 is required" : null
//                         }
//                         value={formData.Address1}
//                         onChange={handleChange}
//                       />
//                     </Grid>

//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputTextField
//                         label="Address 2"
//                         name="Address2"
//                         value={formData.Address2}
//                         onChange={handleChange}
//                       />
//                     </Grid>

//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputTextField
//                         label="City"
//                         name="City"
//                         error={!formData.City}
//                         helperText={!formData.City ? "City is required" : null}
//                         value={formData.City}
//                         onChange={handleChange}
//                       />
//                     </Grid>

//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputTextField
//                         label="Zipcode"
//                         name="Zipcode"
//                         error={!formData.Zipcode}
//                         helperText={
//                           !formData.Zipcode ? "Zipcode is required" : null
//                         }
//                         value={formData.Zipcode}
//                         onChange={handleChange}
//                       />
//                     </Grid>
//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <InputSelectFields
//                         label="Country"
//                         name="Country"
//                         data={[
//                           { key: "1", value: "Bulgaria" },
//                           { key: "2", value: "Netherlands" },
//                           { key: "3", value: "France" },
//                           { key: "4", value: "United Kingdom" },
//                         ]}
//                         value={formData.Country}
//                         onChange={handleChange}
//                       />
//                     </Grid>
//                     <Grid item md={4} xs={12} textAlign={"center"}>
//                       <FormControlLabel
//                         control={
//                           <Checkbox
//                             name="Status"
//                             checked={formData.Status}
//                             onChange={handleChange}
//                           />
//                         }
//                         label="Active"
//                       />
//                     </Grid>
//                   </Grid>
//                 </DialogContent>
//                 <DialogActions sx={{ justifyContent: "space-between", pb: 2 }}>
//                   <Button
//                     variant="contained"
//                     color="success"
//                     onClick={onSubmit}
//                   >
//                     Save
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={() => setOpen(false)}
//                   >
//                     Close
//                   </Button>
//                 </DialogActions>
//               </Dialog>
//             </Grid>
//             {/* -------------------------------------------------------------------------------- */}

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
//                 // onClick={handleOnDelete}
//               >
//                 DELETE
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* <Dialog open={open} onClose={handleClose} maxWidth="md">
//         <DialogTitle >Add Users</DialogTitle>
//         <DialogContent>
//           <AddUserForm onAddUsers={addUsers} handleClose={handleClose} />
//         </DialogContent>
//       </Dialog> */}

//       {/* Drawer for smaller screens */}
//     </>
//   );
// }
