// import CloseIcon from "@mui/icons-material/Close";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import {
//   Box,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   Typography,
//   useTheme
// } from "@mui/material";
// import React, { useEffect, useState } from "react";



// import CardComponent from "../Components/CardComponent";

// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTextArea,
//   InputTextField
// } from "../Components/formComponents";


// import SearchInputField from "../Components/SearchInputField";

// import MenuIcon from "@mui/icons-material/Menu";
// import axios from "axios";
// import dayjs from "dayjs";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import { BASE_URL } from "../Api/Constant";
// import Spinner from "../../Loaders/Spinner";

// const initial = {
//     DocEntry:"",
//     TransactionID: "",
//     TransactionName: "",
//     FirstNo: "",
//     NextNo: "",
//     StartDate: null,
//     EndDate: null,
//     Prefix: "",
//     Status: true,
//     LastNo: "",
// }

// export default function UserCreation() {
//   const theme = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [card, setCard] = useState([]);
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [openPage, setOpenPage] = useState(0);
//   const [DocEntry, setDocEntry] = useState("");
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   // const [loading, setLoading] = useState(false);


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
//           url: `${BASE_URL}/Transaction/search/${searchText}/0`,
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

//   const getAllTransactionNames = () => {
//     axios
//       .get(`${BASE_URL}/Transaction/pages/0`)
//       .then((response) => {
//         setCard(response.data.values);

//         if (response.data.values.length < 20) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }

//   useEffect(()=>{
//     getAllTransactionNames();
//   },[])

//   const setAllTransactionNames = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/Transaction/${DocEntry}`)
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

// };

// const clearFormData = () => {
//   reset(initial);
//   setSaveUpdateName("SAVE");
// };

// const onClickClearSearch = () => {
//   setSearchText("");
//   setFilteredCard([]);
//   setCard([]);
//   setOpenPage(0);
//   setHasMoreOpen(true);
//   setTimeout(() => {
//     getAllTransactionNames();
//   }, 100);
// };

// const triggeronClickClearSearchTwice = () => {
//   onClickClearSearch();
//   setTimeout(() => {
//     onClickClearSearch();
//   }, 10);
// };

// const fetchMoreData = () => {
//   if (searchText === "") {
//     const page = openPage + 1;
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/Transaction/pages/${page}`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setCard((prevPosts) => [...prevPosts, ...response.data.values]);
//         setOpenPage(page);
//         if (response.data.values.length === 0) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   } else {
//     const page = openPage + 1;
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/Transaction/search/${searchText}/${page}`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         setFilteredCard((prevPosts) => [
//           ...prevPosts,
//           ...response.data.values,
//         ]);
//         setOpenPage(page);
//         if (response.data.values.length === 0) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }
// };

// const handleOnDelete = () => {
//   Swal.fire({
//     text: `Do You Want Delete "${DocEntry}"`,
//     icon: "question",
//     confirmButtonText: "YES",
//     cancelButtonText: "No",
//     showConfirmButton: true,
//     showDenyButton: true,
//   }).then((result) => {
//     if (result.isConfirmed) {
//       // setLoading(true);

//       axios.delete(`${BASE_URL}/Transaction/${DocEntry}`).then((resp) => {
//         if (resp.data.success) {
//           clearFormData();
//           getAllTransactionNames();
//           // setLoading(false);
//           Swal.fire({
//             text: "Transaction Number Generation Deleted",
//             icon: "success",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1000,
//           });
//         } else {
//           // setLoading(false);
//           Swal.fire({
//             title: resp.data.success,
//             text: resp.data.message,
//             icon: "info",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         }
//       });
//     } else {
//       // setLoading(false);
//       Swal.fire({
//         text: "Transaction Number Generation Not Deleted",
//         icon: "info",
//         toast: true,
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     }
//   });
// };

// const { control, handleSubmit, reset } = useForm({
//   defaultValues: initial,
// });

// const handleSubmitForm = (data) => {
//   const transaction = {
//     UserId: sessionStorage.getItem("UserId") || "1",
//     CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//     ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//     TransactionName: data.TransactionName,
//     FirstNo: String(data.FirstNo),
//     StartDate: dayjs(data.StartDate).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),
//     EndDate: dayjs(data.EndDate).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),
//     Prefix: data.Prefix,
//     lastNo: String(data.LastNo),
//     // Remark: data.Remark || "",
//     Status: data.Status ? "1" : "0",
//   };

//   if (SaveUpdateName === "SAVE") {
//     setLoading(true);
//     axios
//       .post(`${BASE_URL}/Transaction`, transaction)
//       .then((resp) => {
//         if (resp.data.success) {
//           getAllTransactionNames();
//           clearFormData();
//           setLoading(false);

//           Swal.fire({
//             title: "Success!",
//             text: "Transaction Number Added ",
//             icon: "success",
//             confirmButtonText: "Ok",
//             timer: 1000,
//           });
//         } else {
//           setLoading(false);
//           Swal.fire({
//             title: "Error!",
//             text: resp.data.message,
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//         }
//       })
//       .catch((err) => {
//         Swal.fire({
//           title: "Error!",
//           text: "something went wrong",
//           icon: "warning",
//           confirmButtonText: "Ok",
//         });
//       });
//   } else {
//     Swal.fire({
//       text: `Do You Want Update "${transaction.TransactionName}"`,
//       icon: "question",
//       confirmButtonText: "YES",
//       cancelButtonText: "No",
//       showConfirmButton: true,
//       showDenyButton: true,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLoading(true);

//         axios
//           .put(`${BASE_URL}/Transaction/${DocEntry}`, transaction)
//           .then((response) => {
//             if (response.data.success) {
//               getAllTransactionNames();
//               clearFormData();
//               setLoading(false);

//               Swal.fire({
//                 title: "Success!",
//                 text: "Transaction Number Updated",
//                 icon: "success",
//                 confirmButtonText: "Ok",
//                 timer: 1000,
//               });
//             } else {
//               setLoading(false);

//               Swal.fire({
//                 title: "Error!",
//                 text: response.data.message,
//                 icon: "warning",
//                 confirmButtonText: "Ok",
//               });
//             }
//           })
//           .catch(() => {
//             setLoading(false);

//             Swal.fire({
//               title: "Error!",
//               text: "something went wrong",
//               icon: "warning",
//               confirmButtonText: "Ok",
//             });
//           });
//       } else {
//         setLoading(false);

//         Swal.fire({
//           text: "Transaction is Active state",
//           icon: "info",
//           toast: true,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
//   }
// };

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
//         }}      >
//         <Typography
//           textAlign={"center"}
//           alignContent={"center"}
//           height={"100%"}
//         >
//           Transaction Number Generation List
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
//         >
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
//                 backgroundColor:theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
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
//                   title={item.TransactionName}
//                   subtitle={`${dayjs(item.StartDate,"YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY")}`}
//                   description={`${dayjs(item.EndDate,"YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY")}`}
//                   onClick={() => {
//                     setAllTransactionNames(item.DocEntry);
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
//               Transaction Number Generation
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
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                      <Controller
//                       name="DocEntry"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SALES TARGET ID"
//                           type="text"
//                           {...field}
//                           inputProps={{ readOnly: true }}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                         name="StartDate"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputDatePickerField
//                             label="START DATE"
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
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="TransactionName"
//                       rules={{
//                         required: "please select door", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="SELECT SUPPLIER"
//                           data={[
//                             { key: "APPOINTMENT", value: "APPOINTMENT" },
//                             { key: "DELIVERY", value: "DELIVERY" },
//                             { key: "INWARD", value: "INWARD" },
//                             { key: "ISSUE", value: "ISSUE" },
//                             { key: "JOBCARD", value: "JOBCARD" },
//                             { key: "OUTWARD", value: "OUTWARD" },
//                             { key: "QUOTATION", value: "QUOTATION" },
//                             { key: "REQUEST", value: "REQUEST" },
//                             { key: "RETURN", value: "RETURN" },
//                             { key: "SALESTARGET", value: "SALESTARGET" },
//                             { key: "INVOICE", value: "INVOICE" },
//                             { key: "CUSTOMER", value: "CUSTOMER" },
//                             { key: "INVOICE-B2B", value: "INVOICE-B2B" },
//                           ]}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                         name="EndDate"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputDatePickerField
//                             label="END DATE"
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
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="FirstNo"
//                       control={control}
//                       rules={{
//                         required: "First No is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="FIRST NO"
//                           type="text"
//                           {...field}
//                           inputProps={{
//                             style: { textAlign: 'right' } // Corrected property name
//                           }}                          
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="Prefix"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextArea
//                           label="PREFIX"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="NextNo"
//                       control={control}
//                       rules={{
//                         required: "Next No is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="NEXT NO"
//                           type="text"
//                           {...field}
//                           inputProps={{
//                             style: { textAlign: 'right' } // Corrected property name
//                           }}                          
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   {/* --------------------------------------------------------------------- */}
//                   <Grid
//                     item
//                     md={6}
//                     xs={12}
//                     container
//                     justifyContent="center"
//                     alignItems="center"
//                   >
//                     <Grid item minWidth={220}>
//                     <Controller
//                         name="Status" // The field name used in the form
//                         control={control} // Control object from useForm
//                         defaultValue={false} // Optional: Set default value
//                         // rules={{
//                         //   required: "please select Transaction Number Generation Type", // Field is required
//                         // }}
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
//                   {/* --------------------------------------------------------------------- */}

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="LastNo"
//                       control={control}
//                       rules={{
//                         required: "Next No is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="LAST NO"
//                           type="text"
//                           {...field}
//                           inputProps={{
//                             style: { textAlign: 'right' } // Corrected property name
//                           }}                          
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
//                 bottom: "0px",
//               }}
//             >
//               <Button
//                 variant="contained"
//                 type="submit"
//                 name={SaveUpdateName}
//                 color="success"
//                 sx={{ color: 'white' }}
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
