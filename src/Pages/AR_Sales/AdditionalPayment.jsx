// import CloseIcon from "@mui/icons-material/Close";
// import MenuIcon from "@mui/icons-material/Menu";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import {
//   Box,
//   Button,
//   Divider,
//   Grid,
//   IconButton,
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
// import React, { useEffect, useState } from "react";

// import SearchInputField from "../Components/SearchInputField";

// import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// import { TabContext, TabPanel } from "@mui/lab";
// import dayjs from "dayjs";
// import {
//   InputDatePickerField,
//   InputDatePickerFields,
//   InputFields,
//   InputSelectFields,
//   InputTextField,
//   InputTextSearchButton,
//   RadioButtonsField,
//   SmallInputTextField,
// } from "../Components/formComponents";

// import axios from "axios";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import { BASE_URL } from "../Api/Constant";
// import CardComponentTwo from "../Components/CardComponentTwo";
// import SearchModel from "../Components/SearchModel";
// const InitialObj = {
//   OrderNo: "",
//   CardCode: "",
//   CashAmount:"",
//   CardName: "",
//   PaidAmount:"",
//   PaidDueAmount:""
// };

// export default function AdditionalPayment() {
//   const [tabvalue, settabvalue] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tab, settab] = useState("1");
//   const theme = useTheme();
//   const [bankData, setBankData] = useState([]);
//   const [openmodel, setOpenModal] = useState(false);
//   const [openPosts, setOpenPosts] = useState([]);
//   const [hasMoreOPen, setHasMoreOpen] = useState(true);

//   const [getListData, setGetListData] = useState([]);
//   const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
//   const [searchTextGetListForCreate, setsearchTextGetListForCreate] =
//     useState("");
//     const [getListPage, setGetListPage] = useState(0);
//   const [getListSearchData, setGetListSearchData] = useState([]);



//   const addRow = () => {
//     const newData = {
//       myRadioGroup: getValues("myRadioGroup"),
//       AuthCode: getValues("AuthCode"),
//       Creditno: getValues("Creditno"),
//       Amount: getValues("Amount"),
//     };

//     setBankData((prevData) => [...prevData, newData]);
//     reset();
//   };

//   const removeTableRow1 = (index) => {
//     const updatedData = bankData.filter((_, i) => i !== index);
//     setBankData(updatedData);
//   };
//   const { handleSubmit, control, trigger, getValues, reset, watch } = useForm({
//     mode: "onChange",
//     defaultValues: InitialObj,
//   });

// const PaidAmount=watch('PaidAmount',0)
// console.log("PAId amount",PaidAmount)

// const CashAmount=watch('CashAmount',0)
// console.log("Cash amount",CashAmount)
// const deuamount= (PaidAmount -  CashAmount)

// console.log("Total Deuamount ", deuamount)
 
//   const handleTabChangeRight = (e, newvalue1) => {
//     settab(newvalue1);
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const onHandleSearch = () => {
//     alert("");
//   };

//   const handleTabChange = (event, newValue) => {
//     settabvalue(newValue);
//   };

//   const OpenDailog = () => {
//     setOpenModal(true);
//   };

//   const ModelClose = () => {
//     setOpenModal(false);
//   };
//   //  OpenTab API Binding

//   // Open tab Data Binding
//   const getAllOpenList = () => {
//     axios
//       .request({
//         method: "get",
//         url: `${BASE_URL}/DownPayment/pages/0/1`,
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

//   const SetOpenoldData = (item) => {
//     console.log(item);
//     reset(item);
//   };


//   const ClearFormData=()=>{
//     reset(InitialObj)
//   }


  
//   // Model Data Bind
//   const getListForCreate = () => {
//     fetchDataGetListForCreate(
//       `${BASE_URL}/DownPayment/GetListForCreate/0`,
//       setGetListData
//     );
//   };

//   const fetchDataGetListForCreate = (url, setData, append = false) => {
//     axios
//       .get(url, { headers: { "Content-Type": "application/json" } })
//       .then((response) => {
//         console.log("Additional payment ",response.data.values.length)
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
//       ? `${BASE_URL}/DownPayment/GetListForCreate/Search/${searchTextGetListForCreate}/${page}`
//       : `${BASE_URL}/DownPayment/GetListForCreate/${page}`;
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
//         `${BASE_URL}/DownPayment/GetListForCreate/search/${searchText}/0`,
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



//   useEffect(() => {
//     getAllOpenList();
//     getListForCreate();
//     triggerClearSearchTwice()
//   }, []);

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
//           Down Payment
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
//                   <SearchInputField />
//                 </Grid>
//                 <InfiniteScroll
//                   style={{ textAlign: "center" }}
//                   dataLength={openPosts.length}
//                   // next={fetchMoreOpenListData}
//                   hasMore={hasMoreOPen}
//                   loader={
//                     <BeatLoader
//                       color={theme.palette.mode === "light" ? "black" : "white"}
//                     />
//                   }
//                   scrollableTarget="ListScroll"
//                   endMessage={<Typography>No More Records</Typography>}
//                 >
//                   {openPosts.map((item) => (
//                     <CardComponentTwo
//                       key={item.DocNum}
//                       title={item.OrderNo}
//                       subtitle={item.CardName}
//                       onClick={() => SetOpenoldData(item)}
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
//                   <SearchInputField onChange={onHandleSearch} />
//                 </Grid>
//                 {/* <InfiniteScroll
//                   style={{ textAlign: "center" }}
//                   dataLength={CloseDownPayment.length}
//                   next={fetchMoreCloseListData}
//                   hasMore={HasMoreClose}
//                   loader={
//                     <BeatLoader
//                       color={theme.palette.mode === "light" ? "black" : "white"}
//                     />
//                   }
//                   scrollableTarget="ListScrollClosed"
//                   endMessage={<Typography>No More Records</Typography>}
//                 >
//                   {CloseDownPayment.map((itemclose) => (
//                     <CardComponent
//                       key={itemclose.DocNum}
//                       title={itemclose.OrderNo}
//                       subtitle={itemclose.CardName}
//                     />
//                   ))}
//                 </InfiniteScroll> */}
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
//         onSubmit={handleSubmit}
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
//               Additional Down Payment
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
//                 // component="form"
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="OrderNo"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextSearchButton
//                           label="JOB CARD/SO NO"
//                           onClick={() => {
//                             OpenDailog();
//                           }}
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />

//                     <SearchModel
//                       open={openmodel}
//                       onClose={ModelClose}
//                       onCancel={ModelClose}
//                       title="JOB Card/So No"
//                       onChange={onHandleSearchGetListForCreate}
//                       value={searchTextGetListForCreate}
//                       onClickClear={triggerClearSearchTwice}
//                       cardData={
//                         <>
//                           <InfiniteScroll
//                             dataLength={
//                               getListData.length === 0
//                                 ? getListSearchData.length
//                                 : getListData.length
//                             }
//                             next={fetchMoreGetListForCreate}
//                             hasMore={hasMoreGetListForCreate}
//                             loader={
//                               <BeatLoader
//                                 color={
//                                   theme.palette.mode === "light"
//                                     ? "black"
//                                     : "white"
//                                 }
//                               />
//                             }
//                             scrollableTarget="getListForCreateScroll"
//                             endMessage={
//                               <Typography textAlign={"center"}>
//                                 No More Records
//                               </Typography>
//                             }
//                           >
//                             {(getListSearchData.length === 0
//                               ? getListData
//                               : getListSearchData).map((item, i) => (
//                               <CardComponentTwo
//                                 key={i}
//                                 title={item.OrderNo}
//                                 subtitle={item.CardName}
//                               />
//                             ))}
//                           </InfiniteScroll>
//                         </>
//                       }
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name=""
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="TOTAL SO AMOUNT"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name="Customer Balance"
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="CUSTOMER BALANCE"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name="CardCode"
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="CUSTOMER ID"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name="PaidAmount"
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="DOWN PAYMENT PAID"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name="balance due"
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="BALANCE DUE"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6} sm={6} lg={4} textAlign={"center"}>
//                     <Controller
//                       name="CardName"
//                       rules={{ required: "this field is requered" }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="CUSTOMER NAME"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           rows={1}
//                         />
//                       )}
//                     />
//                   </Grid>
//                 </Grid>

//                 <Grid container>
//                   <Grid item width="100%" m={1} border="1px solid grey">
//                     <Tabs
//                       value={tabvalue}
//                       onChange={handleTabChange}
//                       aria-label="disabled tabs example"
//                     >
//                       <Tab value={0} label="Cash" />
//                       <Tab value={1} label="Credit card" />
//                       <Tab value={2} label="Bank Transfer" />
//                     </Tabs>
//                     <Divider />
//                     {tabvalue === 0 && (
//                       <>
//                         <Grid container>
//                           <Grid
//                             item
//                             sm={5}
//                             md={6}
//                             lg={4}
//                             xs={12}
//                             textAlign={"center"}
//                           >
//                             <Controller
//                               name="CashAmount"
//                               control={control}
//                               rules={{
//                                 required: "Total Deu Amount is Required",
//                               }}
//                               render={({ field, fieldState: { error } }) => (
//                                 <InputTextField
//                                   label="CASH PAID"
//                                   type="text"
//                                   {...field}
//                                   error={!!error}
//                                   helperText={error ? error.message : null}
//                                 />
//                               )}
//                             />
//                           </Grid>
//                           <Grid
//                             item
//                             sm={5}
//                             md={6}
//                             lg={4}
//                             xs={12}
//                             textAlign={"center"}
//                           >
//                             <Controller
//                               name=""
//                               disabled
//                               control={control}
//                               render={({ field, fieldState: { error } }) => (
//                                 <InputTextField
//                                   label="CASH ACCOUNT"
//                                   type="text"
//                                   {...field}
//                                   error={!!error} // Pass error state to the FormComponent if needed
//                                   helperText={error ? error.message : null} // Show the validation message
//                                 />
//                               )}
//                             />
//                           </Grid>
//                           <Grid
//                             item
//                             sm={5}
//                             md={6}
//                             lg={4}
//                             xs={12}
//                             textAlign="center"
//                             key="VehInward-Date"
//                           >
//                             <Controller
//                               name="VehInwardDate"
//                               control={control}
//                               render={({ field, fieldState: { error } }) => (
//                                 <InputDatePickerField
//                                   label="RECEIPT DATE"
//                                   name={field.name}
//                                   value={dayjs(undefined)}
//                                   onChange={(date) =>
//                                     field.onChange(
//                                       date ? date.toISOString : undefined
//                                     )
//                                   }
//                                   error={!!error}
//                                   helperText={error ? error.message : null}
//                                 />
//                               )}
//                             />
//                           </Grid>
//                         </Grid>
//                       </>
//                     )}
//                     {tabvalue === 1 && (
//                       <>
//                         <Grid container>
//                           <Grid
//                             container
//                             item
//                             lg={6}
//                             xs={12}
//                             md={6}
//                             sm={6}
//                             textAlign={"center"}
//                           >
//                             <RadioButtonsField
//                               control={control}
//                               name="myRadioGroup"
//                               data={[
//                                 { value: "KNET", label: "KNET" },
//                                 { value: "MASTER", label: "MASTER" },
//                                 { value: "VISA", label: "VISA" },
//                                 { value: "MF", label: "MF" },
//                                 { value: "TABBY", label: "TABBY" },
//                                 { value: "TAMARA", label: "TAMARA" },
//                               ]}
//                             />

//                             <Grid
//                               item
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="Creditno"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="Credit Card No"
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
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="Amount"
//                                 control={control}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <SmallInputTextField
//                                     label="Amount"
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
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Controller
//                                 name="AuthCode"
//                                 control={control}
//                                 rules={{
//                                   required: "Authorization code is required",

//                                   maxLength: {
//                                     value: 10,
//                                     message:
//                                       "Authorization code must be exactly 10 digits",
//                                   },
//                                 }}
//                                 render={({ field, fieldState: { error } }) => (
//                                   <InputTextField
//                                     label="AUTHORIZATION CODE"
//                                     type="text"
//                                     {...field}
//                                     error={!!error}
//                                     helperText={error ? error.message : null}
//                                     onChange={(e) => {
//                                       const value = e.target.value;
//                                       field.onChange(value); // Update the field value
//                                       trigger("AuthCode"); // Trigger validation
//                                     }}
//                                   />
//                                 )}
//                               />
//                             </Grid>

//                             <Grid
//                               item
//                               sm={12}
//                               md={6}
//                               lg={6}
//                               xs={12}
//                               textAlign={"center"}
//                             >
//                               <Button
//                                 variant="contained"
//                                 color="success"
//                                 sx={{ px: 5, mt: 1 }}
//                                 onClick={addRow}
//                               >
//                                 ADD
//                               </Button>
//                             </Grid>
//                           </Grid>
//                           <Grid item lg={6} xs={12} md={6} sm={6}>
//                             <TableContainer
//                               // component={Paper}
//                               sx={{ overflow: "auto" }}
//                             >
//                               <Table
//                                 stickyHeader
//                                 size="small"
//                                 // className="table-style"
//                               >
//                                 <TableHead>
//                                   <TableRow>
//                                     <TableCell>A/C CODE</TableCell>
//                                     <TableCell>CARD NAME</TableCell>
//                                     <TableCell>CARD NO</TableCell>
//                                     <TableCell>AMOUNT</TableCell>
//                                     <TableCell></TableCell>
//                                   </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                   {bankData.map((data, index) => (
//                                     <TableRow key={index}>
//                                       <TableCell component="th" scope="row">
//                                         {data.AuthCode}
//                                       </TableCell>
//                                       <TableCell>{data.myRadioGroup}</TableCell>
//                                       <TableCell>{data.Creditno}</TableCell>
//                                       <TableCell>{data.Amount}</TableCell>
//                                       <TableCell>
//                                         <IconButton
//                                           onClick={() => removeTableRow1(index)}
//                                         >
//                                           <RemoveCircleIcon
//                                             sx={{ color: "red" }}
//                                           />
//                                         </IconButton>
//                                       </TableCell>
//                                     </TableRow>
//                                   ))}
//                                 </TableBody>
//                               </Table>
//                             </TableContainer>
//                           </Grid>
//                         </Grid>
//                       </>
//                     )}

//                     {tabvalue === 2 && (
//                       <>
//                         <Grid container>
//                           <Grid item xs={12}>
//                             <InputFields label="TRANSFER SUM" />
//                             <InputFields label="TRANSFER REF NO" />
//                             <InputSelectFields
//                               label="TRANSFER ACCOUNT"
//                               data={[{ key: "1", value: "idfc" }]}
//                             />
//                             <InputDatePickerFields
//                               label="TRANSFER DATE"
//                               value={dayjs(undefined)}
//                             />
//                           </Grid>
//                         </Grid>
//                       </>
//                     )}
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
//               <Grid item>
//                 <Button
//                   variant="contained"
//                   color="success"
//                   sx={{ color: "white" }}
//                   type="submit"
//                 >
//                   SAVE
//                 </Button>
//               </Grid>
//               <Grid item>
//                 <Controller
//                   name="CashAmount"
//                   control={control}
//                   render={({ field, fieldState: { error } }) => (
//                     <InputTextField
//                       label="PAID AMT"
//                       type="text"
//                       {...field}
//                       error={!!error} // Pass error state to the FormComponent if needed
//                       helperText={error ? error.message : null} // Show the validation message
//                     />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* Drawer for smaller screens */}
//     </>
//   );
// }
