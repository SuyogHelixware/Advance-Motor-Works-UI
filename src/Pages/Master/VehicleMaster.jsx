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
// import {
//   InputSelectTextField,
//   InputTextArea,
//   InputTextField,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";

// const initial = {
//   DocEntry: "",
//   vehicleid: "",
//   VehicleMakeId: "",
//   VehicleModeId: "",
//   VehicleMfgYear: "",
//   VehicleType: "",
//   Remark: "",
//   Status: true,
//   Doors: "",
//   VehicleMasterLoadCountL: 0,
// };

// export default function VehicleMaster() {
//   const theme = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [card, setCard] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [openPage, setOpenPage] = useState(0);
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [DocEntry, setDocEntry] = useState("");

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
//           url: `${BASE_URL}/Vehicle/search/${searchText}/0`,
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

//   const getVehicalDataList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/Vehicle/pages/0`,
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
//     getVehicalDataList();
//   }, []);

//   const setVehicleListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/Vehicle/${DocEntry}`)
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

//         axios.delete(`${BASE_URL}/Vehicle/${DocEntry}`).then((resp) => {
//           if (resp.data.success) {
//             clearFormData();
//             getVehicalDataList();
//             setLoading(false);
//             Swal.fire({
//               text: "Vehicle Deleted",
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
//           text: "Vehicle Not Deleted",
//           icon: "info",
//           toast: true,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
//   };

//   const fetchMoreData = () => {
//     if (searchText === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/Vehicle/pages/${page}`,
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
//           url: `${BASE_URL}/Vehicle/search/${searchText}/${page}`,
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

//   const onClickClearSearch = () => {
//     setSearchText("");
//     setFilteredCard([]);
//     setCard([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getVehicalDataList();
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
//     const vehicle = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       VehicleMakeId: data.VehicleMakeId,
//       VehicleModeId: data.VehicleModeId,
//       VehicleMfgYear: data.VehicleMfgYear,
//       VehicleType: data.VehicleType,
//       Remark: data.Remark || "",
//       Status: data.Status ? "1" : "0",
//       Doors: data.Doors,
//     };

//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       axios
//         .post(`${BASE_URL}/Vehicle`, vehicle)
//         .then((resp) => {
//           if (resp.data.success) {
//             getVehicalDataList();
//             clearFormData();
//             setLoading(false);

//             Swal.fire({
//               title: "Success!",
//               text: "Vehicle Added ",
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
//         text: `Do You Want Update "${vehicle.VehicleMakeId}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setLoading(true);

//           axios
//             .put(`${BASE_URL}/Vehicle/${DocEntry}`, vehicle)
//             .then((response) => {
//               if (response.data.success) {
//                 getVehicalDataList();
//                 clearFormData();
//                 setLoading(false);

//                 Swal.fire({
//                   title: "Success!",
//                   text: "Vehicle Updated",
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
//             text: "Vehicle Not Updated",
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
//         }}      >
//         <Typography
//           textAlign={"center"}
//           alignContent={"center"}
//           height={"100%"}
//         >
//           Vehicle Master List
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
//                   title={item.VehicleMakeId}
//                   subtitle={item.VehicleModeId}
//                   description={item.VehicleMfgYear}
//                   onClick={() => {
//                     setVehicleListData(item.DocEntry);
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
//               position: "absolute",
//               left: "10px",
//               display: {
//                 lg: "none",
//                 xs: "block",
//               },
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
//               Vehicle Master
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
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="DocEntry"
//                       control={control}
//                       rules={{
//                         required: "Vehicle Id is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VEHICLE ID"
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
//                       name="VehicleMakeId"
//                       control={control}
//                       rules={{
//                         required: "Vehicle Maker is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VEHICLE MAKE"
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
//                       name="VehicleModeId"
//                       control={control}
//                       rules={{
//                         required: "Vehicle Model is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VEHICLE MODEL"
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
//                       name="VehicleMfgYear"
//                       control={control}
//                       rules={{
//                         required: "Vehicle Year is required", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="VEHICLE YEAR"
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
//                       name="Doors"
//                       rules={{
//                         required: "please select door", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="SELECT DOOR"
//                           data={[
//                             { key: "2D", value: "2D" },
//                             { key: "4D", value: "4D" },
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
//                       name="Remark"
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

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="VehicleType"
//                       rules={{
//                         required: "please select Vehicle Type", // Field is required
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="VEHICLE TYPE"
//                           data={[
//                             { key: "SMALL", value: "SMALL" },
//                             { key: "MEDIUM", value: "MEDIUM" },
//                             { key: "LARGE", value: "LARGE" },
//                           ]}
//                           {...field}
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
//                   >
//                     <Grid item  minWidth={220} >
//                       <Controller
//                         name="Status" // The field name used in the form
//                         control={control} // Control object from useForm
//                         defaultValue={false} // Optional: Set default value
//                         rules={{
//                           required: "please select Vehicle Type", // Field is required
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
