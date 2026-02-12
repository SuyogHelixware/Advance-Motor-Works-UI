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
// import { BASE_URL } from "../Api/Constant";
// import CardComponent from "../Components/CardComponent";
// import { InputTextField } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";

// const initial = {
//   DocEntry: "",
//   TechnicianName: "",
//   Status: true,
//   HW_WMSStaff: false,
// };

// export default function TechnicianMaster() {
//   const theme = useTheme();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [card, setCard] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [openPage, setOpenPage] = useState(0);
//   const [DocEntry, setDocEntry] = useState("");
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");

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
//           url: `${BASE_URL}/Technician/search/${searchText}/0`,
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
//         url: `${BASE_URL}/Technician/pages`,
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

//   const setTechnicialListData = (DocEntry) => {
//     if (!DocEntry) {
//       return;
//     }
//     axios
//       .get(`${BASE_URL}/Technician/${DocEntry}`)
//       .then((response) => {
//         toggleDrawer();
//         const data = response.data.values;
//         console.log(data);
        
//         reset({
//           ...data,
//           HW_WMSStaff: data.HW_WMSStaff === "Y" ? true : false,
//         });
//         // setSidebarOpen(false);
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

//   const fetchMoreData = () => {
//     if (searchText === "") {
//       const page = openPage + 1;
//       axios
//         .request({
//           method: "get",
//           url: `${BASE_URL}/Technician/pages/${page}`,
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
//           url: `${BASE_URL}/Technician/search/${searchText}/${page}`,
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
//     const technician = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ONLINE",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ONLINE",
//       TechnicianName: data.TechnicianName,
//       DocEntry: String(data.DocEntry),
//       Status: data.Status ? "1" : "0",
//       HW_WMSStaff: data.HW_WMSStaff ? "Y" : "N",
//     };
//     console.log("====================================");
//     console.log(technician);
//     console.log("====================================");

//     if (SaveUpdateName === "SAVE") {
//       axios
//         .post(`${BASE_URL}/Technician`, technician)
//         .then((resp) => {
//           if (resp.data.success) {
//             getVehicalDataList();
//             clearFormData();
//             Swal.fire({
//               title: "Success!",
//               text: "Technician Added ",
//               icon: "success",
//               confirmButtonText: "Ok",
//               timer: 1000,
//             });
//           } else {
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
//         text: `Do You Want Update "${technician.TechnicianName}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         cancelButtonText: "No",
//         showConfirmButton: true,
//         showDenyButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           axios
//             .put(`${BASE_URL}/Technician/${DocEntry}`, technician)
//             .then((response) => {
//               if (response.data.success) {
//                 getVehicalDataList();
//                 clearFormData();
//                 Swal.fire({
//                   title: "Success!",
//                   text: "Technician Updated",
//                   icon: "success",
//                   confirmButtonText: "Ok",
//                   timer: 1000,
//                 });
//               } else {
//                 // handleBackdrop(false);
//                 Swal.fire({
//                   title: "Error!",
//                   text: response.data.message,
//                   icon: "warning",
//                   confirmButtonText: "Ok",
//                 });
//               }
//             })
//             .catch(() => {
//               // handleBackdrop(false);
//               Swal.fire({
//                 title: "Error!",
//                 text: "something went wrong",
//                 icon: "warning",
//                 confirmButtonText: "Ok",
//               });
//             });
//         } else {
//           // handleBackdrop(false);
//           Swal.fire({
//             text: "Technician Not Updated",
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
//         // handleBackdrop(true);

//         axios.delete(`${BASE_URL}/Technician/${DocEntry}`).then((resp) => {
//           if (resp.data.success === true) {
//             clearFormData();
//             getVehicalDataList();
//             Swal.fire({
//               text: "Technician Deleted",
//               icon: "success",
//               toast: true,
//               showConfirmButton: false,
//               timer: 1000,
//             });
//           } else {
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
//         Swal.fire({
//           text: "Technician Not Deleted",
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
//           Technician List
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
//                   title={item.TechnicianName}
//                   subtitle={item.DocEntry}
//                   // description={item.VehicleMfgYear}
//                   onClick={() => {
//                     setTechnicialListData(item.DocEntry);
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
//               Technician Creation
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
//               <Grid
//                 container
//                 noValidate
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//               >
//                 <Grid item md={4} xs={4}></Grid>

//                 <Grid item md={4} xs={4} textAlign={"center"}>
//                   <Controller
//                     name="DocEntry"
//                     control={control}
//                     render={({ field, fieldState: { error } }) => (
//                       <InputTextField
//                         label="TECHNICIAN ID"
//                         type="text"
//                         {...field}
//                         inputProps={{ readOnly: true }}
//                       />
//                     )}
//                   />
//                   <Controller
//                     name="TechnicianName"
//                     control={control}
//                     rules={{
//                       required: "Technician NAME is required", // Field is required
//                     }}
//                     render={({ field, fieldState: { error } }) => (
//                       <InputTextField
//                         label="TECHNICIAN NAME"
//                         type="text"
//                         {...field}
//                         error={!!error} // Pass error state to the FormComponent if needed
//                         helperText={error ? error.message : null} // Show the validation message
//                       />
//                     )}
//                   />
//                   <Grid
//                     item
//                     sx={{
//                       width: "100%",
//                       textAlign: "center",
//                       display: "flex",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <Controller
//                       name="Status" // The field name used in the form
//                       control={control} // Control object from useForm
//                       defaultValue={false} // Optional: Set default value
//                       rules={{
//                         required: "please select Technician Type", // Field is required
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               {...field} // Spread the field props to connect the input with the form
//                               checked={field.value} // Bind the checked state to the form's value
//                             />
//                           }
//                           label="Active"
//                         />
//                       )}
//                     />
//                     <Controller
//                       name="HW_WMSStaff" // The field name used in the form
//                       control={control} // Control object from useForm
//                       defaultValue={false} // Optional: Set default value
//                       render={({ field, fieldState: { error } }) => (
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               {...field} // Spread the field props to connect the input with the form
//                               checked={field.value} // Bind the checked state to the form's value
//                             />
//                           }
//                           label="WMS staff"
//                         />
//                       )}
//                     />
//                   </Grid>
//                 </Grid>

//                 <Grid item md={4} xs={4}></Grid>
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
//     </>
//   );
// }
