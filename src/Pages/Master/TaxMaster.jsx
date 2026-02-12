// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import {
//   Box,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import Spinner from "../../Loaders/Spinner";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import { InputSelectTextField, InputTextField } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";

// export default function TaxMaster() {
//   const theme = useTheme();
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [card, setCard] = useState([]);
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [openPage, setOpenPage] = useState(0);
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [DocEntry, setDocEntry] = useState("");
//   const [loading, setLoading] = useState(false);


//   const initial = {
//     TaxName: "",
//     Description: "",
//     TaxPer: "",
//     CountryCode: "",
//     Status: true,
//     CountryList:[],
//   }

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
//           url: `${BASE_URL}/Tax/search/${searchText}/0`,
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

//   const getTaxDataList = () => { 
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/Tax/pages/0`,
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

//   useEffect(() => {
//     getTaxDataList();
//   }, []);

//   const setTaxDataList = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/Tax/${DocEntry}`)
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

//   const clearFormData = () => {
//     reset(initial);
//     setSaveUpdateName("SAVE");
//   };

//   const onClickClearSearch = () => {
//     setSearchText("");
//     setFilteredCard([]);
//     setCard([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getTaxDataList();
//     }, 100);
//   };

//   const triggeronClickClearSearchTwice = () => {
//     onClickClearSearch();
//     setTimeout(() => {
//       onClickClearSearch();
//     }, 10);
//   };

//   const fetchMoreData = () => {
//     if (searchText === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/Tax/pages/${page}`,
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
//     } else {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/Tax/search/${searchText}/${page}`,
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
//     const Tax = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       TaxName: data.TaxName,
//       Description: data.Description,
//       CountryCode: data.CountryCode,
//       TelCode: data.TelCode,
//       TaxPer: String(data.TaxPer),
//       Status: data.Status ? "1" : "0",
//     };

//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       axios
//         .post(`${BASE_URL}/Tax`, Tax)
//         .then((resp) => {
//           if (resp.data.success) {
//             getTaxDataList();
//             clearFormData();
//             setLoading(false);

//             Swal.fire({
//               title: "Success!",
//               text: "Tax is Added ",
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
//         text: `Do You Want Update "${initial.TaxName}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setLoading(true);

//           axios
//             .put(`${BASE_URL}/Vehicle/${DocEntry}`, Tax)
//             .then((response) => {
//               if (response.data.success) {
//                 getTaxDataList();
//                 clearFormData();
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Success!",
//                   text: "Tax Updated",
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
//             text: "Tax is Active state",
//             icon: "info",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         }
//       });
//     }
//   };

//   const handleOnDelete = () => {
//     Swal.fire({
//       text: `Do You Want Delete "${DocEntry}"`,
//       icon: "question",
//       confirmButtonText: "YES",
//       cancelButtonText: "No",
//       showConfirmButton: true,
//       showDenyButton: true,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLoading(true);

//         axios.delete(`${BASE_URL}/Tax/${DocEntry}`).then((resp) => {
//           if (resp.data.success) {
//             clearFormData();
//             getTaxDataList();
//             setLoading(false);
//             Swal.fire({
//               text: "Tax Deleted",
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
//           text: "Tax Not Deleted",
//           icon: "info",
//           toast: true,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
//   };


//   // const sidebarContent = (
//   //   <>
//   //     <Grid
//   //       item
//   //       width={"100%"}
//   //       py={0.5}
//   //       alignItems={"center"}
//   //       border={"1px solid silver"}
//   //       borderBottom={"none"}
//   //       position={"relative"}
//   //       sx={{
//   //         backgroundColor:
//   //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//   //       }}      
//   //       >
//   //       <Typography
//   //         textAlign={"center"}
//   //         alignContent={"center"}
//   //         height={"100%"}
//   //       >
//   //         Vat Master List
//   //       </Typography>
//   //       <IconButton
//   //         edge="end"
//   //         color="inherit"
//   //         aria-label="close"
//   //         onClick={() => setDrawerOpen(false)}
//   //         sx={{
//   //           position: "absolute",
//   //           right: "10px",
//   //           top: "0px",
//   //           display: { lg: "none", xs: "block" },
//   //         }}
//   //       >
//   //         <CloseIcon />
//   //       </IconButton>
//   //     </Grid>

//   //     <Grid
//   //       container
//   //       item
//   //       width={"100%"}
//   //       height={"100%"}
//   //       border={"1px silver solid"}
//   //       sx={{
//   //         backgroundColor:
//   //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//   //       }}      
//   //       >
//   //       <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
//   //         <Box
//   //           sx={{
//   //             width: "100%",
//   //             height: "100%",
//   //             px: 1,
//   //             overflow: "scroll",
//   //             overflowX: "hidden",
//   //             typography: "body1",
//   //           }}
//   //           id="ListScroll"
//   //         >
//   //           <Grid
//   //             item
//   //             padding={1}
//   //             md={12}
//   //             sm={12}
//   //             width={"100%"}
//   //             sx={{
//   //               position: "sticky",
//   //               top: "0",
//   //               backgroundColor:theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//   //             }}
//   //           >
//   //             <SearchInputField
//   //               onChange={onHandleSearch}
//   //               value={searchText}
//   //               onClickClear={triggeronClickClearSearchTwice}
//   //             />
//   //           </Grid>
//   //           <InfiniteScroll
//   //             style={{ textAlign: "center" }}
//   //             dataLength={searchText === "" ? card.length : filteredCard.length}
//   //             next={fetchMoreData}
//   //             hasMore={hasMoreOpen}
//   //             loader={<BeatLoader />}
//   //             scrollableTarget="ListScroll"
//   //             endMessage={<Typography>No More Records</Typography>}
//   //           >
//   //             {(filteredCard.length === 0 ? card : filteredCard).map((item) => (
//   //               <CardComponent
//   //                 key={item.DocEntry}
//   //                 title={item.TaxName}
//   //                 subtitle={item.Description}
//   //                 description={item.TaxPer}
//   //                 onClick={() => {
//   //                   setTaxDataList(item.DocEntry);
//   //                 }}
//   //               />
//   //             ))}
//   //           </InfiniteScroll>
//   //         </Box>
//   //       </Grid>
//   //     </Grid>
//   //   </>
//   // );

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

//         {/* <Grid
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
//         </Grid> */}

//         {/* User Creation Form Grid */}

//         <Grid
//           container
//           item
//           width="100%"
//           height="100%"
//           sm={12}
//           md={12}
//           lg={12}
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
//               Vat Master
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
//                 width={"100%"}
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="TaxName"
//                       control={control}
//                       rules={{
//                         required: "Vat Name is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VAT NAME"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   {/* <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="TaxPer"
//                       control={control}
//                       rules={{
//                         required: "Vat Percentage is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VAT PERCENTAGE"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid> */}

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="Description"
//                       control={control}
//                       rules={{
//                         required: "Description is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="DESCRIPTION"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   {/* <Grid item md={6} xs={12} textAlign={"center"}>
                    
//                     <Controller
//                       name="CountryCode"
//                       rules={{
//                         required: "Select Vat Code is required", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="SELECT VAT CODE"
//                           data={[
//                             { key: "KW", value: "KW" },
//                             { key: "OMN", value: "OMN" },
//                             { key: "BAH", value: "BAH" },
//                             { key: "KSA", value: "KSA" },
//                             { key: "QAT", value: "QAT" },
//                             { key: "AE", value: "AE" },
//                           ]}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid> */}

//                   {/* --------------------------------------------------------------------- */}
//                   {/* <Grid
//                     item
//                     md={6}
//                     xs={12}
//                     container
//                     justifyContent="center"
//                     alignItems="center"
//                   >
//                     <Grid item minWidth={220} >
//                       <Controller
//                         name="Status" // The field name used in the form
//                         control={control} // Control object from useForm
//                         defaultValue={false} // Optional: Set default value
//                         rules={{
//                           required: "please select Country Type", // Field is required
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
//                   </Grid> */}
//                   {/* --------------------------------------------------------------------- */}

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
//               <Button
//                 variant="contained"
//                 type="submit"
//                 name={SaveUpdateName}
//                 color="success"
//                 sx={{ color: 'white'}}
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
