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
// import dayjs from "dayjs";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import Spinner from "../../Loaders/Spinner";
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTextArea,
//   InputTextField
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";

// const initial = {
//   SalesTargetID: "",
//   CardName: "",
//   DocEntry: "",
//   TargetDate: null,
//   TargetValue: "",
//   Supplier: "",
//   Remarks: "",
//   Status: true,
// };

// export default function UserCreation() {
//   const theme = useTheme();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [card, setCard] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [openPage, setOpenPage] = useState(0);
//   const [DocEntry, setDocEntry] = useState("");
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [loading, setLoading] = useState(false);

//   const toggleDrawer = () => {
//     setSidebarOpen(!sidebarOpen);
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
//           url: `${BASE_URL}/SuppSalesTarget/search/${searchText}/0`,
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

//   const getSupSalesTargetListData = () => {
//     axios
//       .get(`${BASE_URL}/SuppSalesTarget/pages/0`)
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
//     getSupSalesTargetListData();
//   }, []);

//   const setSupSalesTargetListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/SuppSalesTarget/${DocEntry}`)
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
//       getSupSalesTargetListData();
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
//           url: `${BASE_URL}/SuppSalesTarget/pages/${page}`,
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
//           url: `${BASE_URL}/SuppSalesTarget/search/${searchText}/${page}`,
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

//         axios.delete(`${BASE_URL}/SuppSalesTarget/${DocEntry}`).then((resp) => {
//           if (resp.data.success) {
//             clearFormData();
//             getSupSalesTargetListData();
//             setLoading(false);
//             Swal.fire({
//               text: "Suppiler Sales Target Deleted",
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
//           text: "Suppiler Sales Target Not Deleted",
//           icon: "info",
//           toast: true,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
//   };

//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: initial,
//   });

//   const handleSubmitForm = (data) => {
//     const suppSalTarget = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       CardName: data.CardName,
//       TargetDate: dayjs(data.TargetDate).format("YYYY-MM-DD HH:mm:ss"),
//       TargetValue: String(data.TargetValue),
//       Remarks: data.Remarks,
//       Status: data.Status ? "1" : "0",
//     };

//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       axios
//         .post(`${BASE_URL}/SuppSalesTarget`, suppSalTarget)
//         .then((response) => {
//           if (response.data.success) {
//             getSupSalesTargetListData();
//             clearFormData();
//             setLoading(false);

//             Swal.fire({
//               title: "Success!",
//               text: "Sales Target Added",
//               icon: "success",
//               confirmButtonText: "Ok",
//               timer: 1000,
//             });
//           } else {
//             setLoading(false);
//             Swal.fire({
//               title: "warning !",
//               text: response.data.message,
//               icon: "warning",
//               confirmButtonText: "Ok",
//             });
//           }
//         })
//         .catch((error) => {
//           setLoading(false);
//           Swal.fire({
//             title: "Error!",
//             text: "something went wrong",
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//         });
//     } else {
//       Swal.fire({
//         text: `Do You Want Update this record ?`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((results) => {
//         if (results.isConfirmed) {
//           setLoading(true);

//           axios
//             .put(`${BASE_URL}/Suppsalestarget/${DocEntry}`, suppSalTarget)
//             .then((response) => {
//               if (response.data.success === true) {
//                 getSupSalesTargetListData();
//                 clearFormData();
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Success!",
//                   text: "Sales Target Updated",
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
//             .catch((error) => {
//               setLoading(false);

//               Swal.fire({
//                 title: "Error !",
//                 text: "something went wrong",
//                 icon: "warning",
//                 confirmButtonText: "Ok",
//               });
//             });
//         } else {
//           setLoading(false);

//           Swal.fire({
//             text: "Sales Target Not Updated",
//             icon: "info",
//             toast: true,
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         }
//       });
//     }
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
//         >
//         <Typography
//           textAlign={"center"}
//           alignContent={"center"}
//           height={"100%"}
//         >
//           Supplier Sales List
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
//                   title={item.CardName}
//                   subtitle={`${dayjs(item.CreatedDate).format("YYYY-MMM-DD")}`}
//                   description={`${dayjs(item.TargetDate).format(
//                     "YYYY-MMM-DD"
//                   )}`}
//                   onClick={() => {
//                     setSupSalesTargetListData(item.DocEntry);
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
//               Supplier Sales Target
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
//                     <Controller
//                       name="DocEntry"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SALES TARGET ID"
//                           type="text"
//                           {...field}
//                           readOnly
//                           inputProps={{ readOnly: true }}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="TargetValue"
//                       control={control}
//                       rules={{
//                         required: "Target Value is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SALES TARGET VALUE"
//                           type="text"
//                           {...field}
//                           inputProps={{
//                             style: { textAlign: "right" }, // Corrected property name
//                           }}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
                      
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="CardName"
//                       rules={{
//                         required: "please select door", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="SELECT SUPPLIER"
//                           data={[
//                             {
//                               key: "ARB CORPORATIONLTD",
//                               value: "ARB CORPORATIONLTD",
//                             },
//                             { key: "BAJA KITS", value: "BAJA KITS" },
//                             { key: "BILSTEIN", value: "BILSTEIN" },
//                             {
//                               key: "CUSTOM WHEEL HOUSE",
//                               value: "CUSTOM WHEEL HOUSE",
//                             },
//                             {
//                               key: "FOX FACTORY INC",
//                               value: "FOX FACTORY INC",
//                             },
//                             { key: "KC HILITES INC", value: "KC HILITES INC" },
//                             { key: "RHINO-RACK", value: "RHINO-RACK" },
//                             {
//                               key: "WARN INDUSTRIES",
//                               value: "WARN INDUSTRIES",
//                             },
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
//                         name="TargetDate"
//                         control={control}
//                         render={({ field, fieldState: { error } }) => (
//                           <InputDatePickerField
//                             label="TARGET DATE"
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
//                       name="Remarks"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextArea
//                           label="REMARKS"
//                           type="text"
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   {/* -------------------------------------------------------------- */}
//                   <Grid
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
//                           required: "please select Suppiler Sales Type", // Field is required
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
//                   {/* -------------------------------------------------------------- */}
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
