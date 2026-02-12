// import React, { useState, useRef, useEffect } from "react";
// import {
//   Box,
//   Button,
//   Grid,
//   IconButton,
//   Typography,
//   FormControl,
//   Tabs,
//   Tab,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerFields,
//   InputSelectFields,
//   InputTextAreaFields,
//   InputTextField,
//   InputTextSearchField,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";
// // import MenuOpenIcon from "@mui/icons-material/MenuOpen";
// import MenuIcon from "@mui/icons-material/Menu";
// import SignatureCanvas from "react-signature-canvas";
// import SearchModel from "../Components/SearchModel";
// import { TabContext, TabPanel } from "@mui/lab";
// import InfiniteScroll from "react-infinite-scroll-component";
// import CloseIcon from "@mui/icons-material/Close";
// import { Controller, useForm } from "react-hook-form";
// import dayjs from "dayjs";

// import { BeatLoader } from "react-spinners";
// import axios from "axios";
// import { BASE_URL } from "../Api/Constant";

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
//     RequestDate: "",
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
//   // modal
//   const { control } = useForm({
//     defaultValues: initialFormData,
//   });
//   const theme = useTheme();
//   const [openPosts,setOpenPosts] = useState([]); // State for Open posts
//   const [openSearchPosts,setOpenSearchPosts] = useState([]); // State for Open posts
//   const [closeSearchPosts] = useState([]); // State for Open posts
//   const [closedPosts] = useState([]);
//   const [openPage, setOpenPage] = useState(0); // Pagination for Open posts
//   // const [closePage, setClosePage] = useState(0);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [tab, settab] = useState("0");
//   const [ setHasMoreOpen] = useState(true);
//   // const [hasMoreClose, setHasMoreClose] = useState(true);
//   const [searchTextOpen] = useState("");
//   const [searchTextClose] = useState("");
//   const [searchTextGetListForCreate] = useState("");
//   const [getListData] = useState([]);
//   const [getListSearchData] = useState([]); // State for Open posts
//   const [hasMoreGetListForCreate] = useState(true);
//   // const [getListPage, setGetListPage] = useState(0);

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const signatureRef = useRef(null);

  
//   useEffect(() => {
//     getAllOpenList();
//   //  getAllCloseList();
//    // getListForCreate();
//    // getAllWMSStaffList();
//     console.log("=================test===================");
//     // console.log(user);
//     console.log("====================================");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//   // for Open Request
//   const getAllOpenList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/VehInward/pages/0/1`,
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
//           url: `${BASE_URL}/matissue/pages/${page}/1`,
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
//           url: `${BASE_URL}/MatIssue/search/${searchTextOpen}/0/${page}`,
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

//   const clearSignature = () => {
//     signatureRef.current.clear();
//   };
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
//   const openDialog = () => {
//     setIsDialogOpen(true);
//   };
//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//   };
//   const handleTabChangeRight = (e, newvalue1) => {
//     settab(newvalue1);
//   };

//   const carddata = [
//     {
//       id: 1,
//       name: "ABC",
//     },
//   ];

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
//           Inward Vehicle List
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
//         //sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
//         sx={{
//           backgroundColor:
//             theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//         }}
//       >
//          <Grid
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
//                    // onChange={onHandleSearchOpen}
//                     value={searchTextOpen}
//                    // onClickClear={triggeronClickClearOpenSearchTwice}
//                   />
//                 </Grid>
//                 <InfiniteScroll
//                   style={{ textAlign: "center", justifyContent: "center" }}
//                   dataLength={
//                     searchTextOpen === ""
//                       ? openPosts.length
//                       : openSearchPosts.length
//                   }
//                  next={fetchMoreOpenListData}
//                 // hasMore={hasMoreOpen}
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
//                        // setOldOpenListData(item.DocEntry);
//                        // handleCardClick(true);
//                       }}
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
//                    // onChange={getCloseSearchList}
//                     value={searchTextClose}
//                     // onClickClear={triggeronClickClearCloseSearchTwice}
//                   />
//                 </Grid>
//                 <InfiniteScroll
//                   style={{ textAlign: "center" }}
//                   dataLength={
//                     searchTextClose === ""
//                       ? closedPosts.length
//                       : closeSearchPosts.length
//                   }
//                   // next={fetchMoreCloseListData}
//                   // hasMore={hasMoreClose}
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
//                       subtitle={item.RequestNo}
//                       description={item.PhoneNumber1}
//                       onClick={() => {
//                         // handleCardClick();
//                         // setOldOpenListData(item.DocEntry);
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
//   return (
//     <>
//       <SearchModel
//         open={isDialogOpen}
//         onClose={handleCloseDialog}
//         onCancel={handleCloseDialog}
//         title="Select Request"
//         // onChange={onHandleSearchGetListForCreate}
//         value={searchTextGetListForCreate}
//         //   onClickClear={triggerClearSearchTwice}
//         cardData={
//           <>
//             <InfiniteScroll
//               dataLength={
//                 getListData.length === 0
//                   ? getListSearchData.length
//                   : getListData.length
//               }
//               // next={fetchMoreGetListForCreate}
//               hasMore={hasMoreGetListForCreate}
//               loader={
//                 <BeatLoader
//                 color={theme.palette.mode === "light" ? "black" : "white"}
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
//                   onClick={() => {}}
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
//         // onSubmit={handleSubmit(handleSubmitForm)}
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
//           // onClick={handleOnSubmit}
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
//             // onClick={ClearForm}
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
//               Inward Vehicle Details
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
//               textTransform={'uppercase'}
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
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <Controller
//                       name="So No"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextSearchField
//                           label="So No"
//                           type="text"
//                           onClick={openDialog}
//                           {...field}
//                           error={!!error} // Pass error state to the FormComponent if needed
//                           helperText={error ? error.message : null} // Show the validation message
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Job Work At"
//                       name="Job Work At"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Veh Mileage"
//                       name="Veh Mileage"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputDatePickerFields
//                       label="Appointment Date"
//                       name="Date"
//                       value={dayjs(undefined)}
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Chassis No"
//                       name="Chassis No"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Contact No"
//                       name="Contact No"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid
//                     item
//                     sm={6}
//                     md={6}
//                     lg={4}
//                     xs={12}
//                     textAlign="center"
//                     mt={1}
//                   >
//                     <InputSelectFields
//                       label="select vehile"
//                       data={carddata.map((d) => ({
//                         key: d.id,
//                         value: d.name,
//                       }))}
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Registration No"
//                       name="Registration No"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Contact No"
//                       name="Contact No"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextAreaFields
//                       label="Job Work Details"
//                       name="Job Work Details"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextField
//                       label="Order Type"
//                       name="Order Type"
//                       value=""
//                     />
//                   </Grid>

//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
//                     <InputTextAreaFields
//                       label="Inspection Remarks"
//                       name="Inspection Remarks"
//                       value=""
//                     />
//                   </Grid>
//                 </Grid>
//                 <hr />
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
//                     <InputTextField
//                       label="Inward No"
//                       name="Inward No"
//                       value=""
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
//                     <InputDatePickerFields
//                       label="Inward  Date"
//                       name="Date"
//                       value={dayjs(undefined)}
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
//                     <InputTextField
//                       label="Inward Time"
//                       name="Inward Time"
//                       value=""
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
//                     mr={0}
//                   >
//                     <InputTextField
//                       label="Job-card No"
//                       name="Job-card No"
//                       value=""
//                     />
//                   </Grid>
//                   <Grid
//                     container
//                     item
//                     columnSpacing={2}
//                     width="100%"
//                     px={3}
//                     pt={3}
//                   >
//                     <Grid item width="100%" textAlign="center">
//                       <label>Signature</label> &nbsp;&nbsp;
//                       <IconButton size="small" onClick={clearSignature}>
//                         X
//                       </IconButton>
//                       <FormControl fullWidth style={{ marginBottom: 3 }}>
//                         <SignatureCanvas
//                           ref={signatureRef}
//                           penColor="black"
//                           canvasProps={{
//                             style: {
//                               background: "white",
//                               height: 100,
//                             },
//                           }}
//                         />
//                       </FormControl>
//                     </Grid>
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
//                 // type="submit"
//               >
//                 Save
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
