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
// import dayjs from "dayjs";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { BeatLoader } from "react-spinners";
// import Swal from "sweetalert2";
// import Spinner from "../../Loaders/Spinner";
// import CardComponent from "../Components/CardComponent";
// import {
//   InputDatePickerField,
//   InputSelectTextField,
//   InputTextArea,
//   InputTextField,
// } from "../Components/formComponents";
// import SearchInputField from "../Components/SearchInputField";
// import apiClient from "../../services/apiClient";

// const initial = {
//   DocEntry: "",
//   FromDate: undefined,
//   ToDate: undefined,
//   Status: true,
//   SalesTargetValue: "",
//   SalesType: "",
//   Remarks: "",
//   SaveUpdateName: "SAVE",
// };

// export default function UserCreation() {
//   const theme = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [card, setCard] = useState([]);
//   const [hasMoreOpen, setHasMoreOpen] = useState(true);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCard, setFilteredCard] = useState([]);
//   const [openPage, setOpenPage] = useState(0);
//   const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
//   const [DocEntry, setDocEntry] = useState("");

//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: initial,
//   });

//   const toggleDrawer = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   const onHandleSearch = (event) => {
//     const text = event.target.value;
//     setSearchText(text);
//     setFilteredCard([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);

//     if (!text.trim()) {
//       setHasMoreOpen(false);
//       return;
//     }

//     apiClient
//       .get(`/SalesTarget?SearchText=${text.trim()}page=0`)
//       .then((response) => {
//         const values = response?.data?.values || [];
//         setFilteredCard(values);
//         if (values.length < 20) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.error("Search error:", error);
//       });
//   };

//   const getAllSalesTargetList = () => {
//     apiClient
//       .get(`/SalesTarget?page=0`)
//       .then((response) => {
//         const values = response.data.values || [];
//         setCard(values);
//         if (values.length < 20) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   useEffect(() => {
//     getAllSalesTargetList();
//   }, []);

//   const oldSalesTargetSelection = (DocEntry) => {
//     if (!DocEntry) return;
//     apiClient
//       .get(`/SalesTarget/${DocEntry}`)
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
//     setDocEntry("");
//   };

//   const onClickClearSearch = () => {
//     setSearchText("");
//     setFilteredCard([]);
//     setCard([]);
//     setOpenPage(0);
//     setHasMoreOpen(true);
//     setTimeout(() => {
//       getAllSalesTargetList();
//     }, 100);
//   };

//   const triggeronClickClearSearchTwice = () => {
//     onClickClearSearch();
//   };

//   const fetchMoreData = () => {
//     const page = openPage + 1;
//     const endpoint =
//       searchText === ""
//         ? `/SalesTarget?page=${page}`
//         : `/SalesTarget?SearchText=${searchText}&page=${page}`;

//     apiClient
//       .get(endpoint)
//       .then((response) => {
//         const values = response.data.values || [];
//         if (searchText === "") {
//           setCard((prev) => [...prev, ...values]);
//         } else {
//           setFilteredCard((prev) => [...prev, ...values]);
//         }
//         setOpenPage(page);
//         if (values.length === 0) {
//           setHasMoreOpen(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const handleSubmitForm = (data) => {
//     const salesTarget = {
//       UserId: sessionStorage.getItem("UserId") || "1",
//       CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
//       SalesTargetValue: String(data.SalesTargetValue),
//       SalesType: String(data.SalesType),
//       FromDate: data.FromDate
//         ? dayjs(data.FromDate).format("YYYY-MM-DD HH:mm:ss")
//         : null,
//       ToDate: data.ToDate
//         ? dayjs(data.ToDate).format("YYYY-MM-DD HH:mm:ss")
//         : null,
//       Remarks: data.Remarks || "",
//       Status: data.Status ? "1" : "0",
//     };

//     if (SaveUpdateName === "SAVE") {
//       setLoading(true);
//       apiClient
//         .post(`/SalesTarget`, salesTarget)
//         .then((resp) => {
//           setLoading(false);
//           if (resp.data.success) {
//             getAllSalesTargetList();
//             clearFormData();
//             Swal.fire({
//               title: "Success!",
//               text: "SalesTarget Added ",
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
//         .catch(() => {
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
//         text: `Do You Want Update "${DocEntry}"`,
//         icon: "question",
//         confirmButtonText: "YES",
//         showCancelButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setLoading(true);
//           apiClient
//             .put(`/SalesTarget/${DocEntry}`, salesTarget)
//             .then((response) => {
//               setLoading(false);
//               if (response.data.success) {
//                 getAllSalesTargetList();
//                 clearFormData();
//                 Swal.fire({
//                   title: "Success!",
//                   text: "SalesTarget Updated",
//                   icon: "success",
//                   confirmButtonText: "Ok",
//                   timer: 1000,
//                 });
//               } else {
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
//         }
//       });
//     }
//   };

//   const handleOnDelete = () => {
//     Swal.fire({
//       text: `Do You Want Delete "${DocEntry}"`,
//       icon: "question",
//       confirmButtonText: "YES",
//       showCancelButton: true,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLoading(true);
//         apiClient
//           .delete(`/SalesTarget/${DocEntry}`)
//           .then((resp) => {
//             setLoading(false);
//             if (resp.data.success) {
//               clearFormData();
//               getAllSalesTargetList();
//               Swal.fire({
//                 text: "SalesTarget Deleted",
//                 icon: "success",
//                 toast: true,
//                 showConfirmButton: false,
//                 timer: 1000,
//               });
//             } else {
//               Swal.fire({
//                 title: "Error",
//                 text: resp.data.message,
//                 icon: "info",
//                 toast: true,
//                 showConfirmButton: false,
//                 timer: 1500,
//               });
//             }
//           })
//           .catch(() => setLoading(false));
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
//           Sales Target List
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
//                 zIndex: 1,
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
//               {(filteredCard.length === 0 && searchText === ""
//                 ? card
//                 : filteredCard
//               ).map((item) => (
//                 <CardComponent
//                   key={item.DocEntry}
//                   title={item.SalesType}
//                   subtitle={`${dayjs(
//                     item.FromDate,
//                     "YYYY-MM-DD HH:mm:ss",
//                   ).format("YYYY-MMM-DD")}`}
//                   description={`${dayjs(
//                     item.ToDate,
//                     "YYYY-MM-DD HH:mm:ss",
//                   ).format("YYYY-MMM-DD")}`}
//                   onClick={() => {
//                     oldSalesTargetSelection(item.DocEntry);
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
//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             onClick={toggleDrawer}
//             sx={{
//               display: { lg: "none" },
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
//               Defines Sales Target
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
//                   width: "100%",
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="DocEntry"
//                       control={control}
//                       render={({ field }) => (
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
//                       name="SalesTargetValue"
//                       control={control}
//                       rules={{
//                         required: "Sales Target Value is required",
//                       }}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputTextField
//                           label="SALES TARGET VALUE"
//                           type="text"
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                           inputProps={{ style: { textAlign: "right" } }}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="FromDate"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputDatePickerField
//                           label="Form Date"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                           onChange={(date) =>
//                             field.onChange(
//                               date ? date.toISOString() : undefined,
//                             )
//                           }
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="SalesType"
//                       rules={{
//                         required: "Please Select Role",
//                       }}
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputSelectTextField
//                           label="ROLE"
//                           data={[
//                             { key: "PART SALE", value: "PART SALE" },
//                             { key: "WORKSHOP SALE", value: "WORKSHOP SALE" },
//                           ]}
//                           {...field}
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} textAlign={"center"}>
//                     <Controller
//                       name="ToDate"
//                       control={control}
//                       render={({ field, fieldState: { error } }) => (
//                         <InputDatePickerField
//                           label="End Date"
//                           name={field.name}
//                           value={field.value ? dayjs(field.value) : undefined}
//                           onChange={(date) =>
//                             field.onChange(
//                               date ? date.toISOString() : undefined,
//                             )
//                           }
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
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
//                           error={!!error}
//                           helperText={error ? error.message : null}
//                         />
//                       )}
//                     />
//                   </Grid>

//                   <Grid item md={6} xs={12} container justifyContent="center">
//                     <Grid item minWidth={220}>
//                       <Controller
//                         name="Status"
//                         control={control}
//                         render={({ field }) => (
//                           <FormControlLabel
//                             control={
//                               <Checkbox
//                                 {...field}
//                                 checked={!!field.value}
//                                 onChange={(e) =>
//                                   field.onChange(e.target.checked)
//                                 }
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
//                 paddingBottom: "8px",
//               }}
//             >
//               <Button
//                 variant="contained"
//                 type="submit"
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

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import Spinner from "../../Loaders/Spinner";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTextArea,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import apiClient from "../../services/apiClient";

const initial = {
  DocEntry: "",
  FromDate: null, // Changed from undefined to null for better compatibility
  ToDate: null,
  Status: true,
  SalesTargetValue: "",
  SalesType: "",
  Remarks: "",
  SaveUpdateName: "SAVE",
};

export default function UserCreation() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [card, setCard] = useState([]);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredCard, setFilteredCard] = useState([]);
  const [openPage, setOpenPage] = useState(0);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onHandleSearch = (event) => {
    const text = event.target.value;
    setSearchText(text);
    setFilteredCard([]);
    setOpenPage(0);
    setHasMoreOpen(true);

    if (!text.trim()) {
      setHasMoreOpen(false);
      return;
    }

    apiClient
      .get(`/SalesTarget?SearchText=${text.trim()}&page=0`)
      .then((response) => {
        const values = response?.data?.values || [];
        setFilteredCard(values);
        if (values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.error("Search error:", error);
      });
  };

  const getAllSalesTargetList = () => {
    apiClient
      .get(`/SalesTarget?page=0`)
      .then((response) => {
        const values = response.data.values || [];
        setCard(values);
        if (values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getAllSalesTargetList();
  }, []);

  const oldSalesTargetSelection = (DocEntry) => {
    if (!DocEntry) return;
    apiClient
      .get(`/SalesTarget/${DocEntry}`)
      .then((response) => {
        toggleDrawer();
        const data = response.data.values;
        reset({ ...data, Status: data.Status === "1" ? true : false });
        setSaveUpdateName("UPDATE");
        setDocEntry(DocEntry);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
  };

  const onClickClearSearch = () => {
    setSearchText("");
    setFilteredCard([]);
    setCard([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    setTimeout(() => {
      getAllSalesTargetList();
    }, 100);
  };

  const triggeronClickClearSearchTwice = () => {
    onClickClearSearch();
  };

  const fetchMoreData = () => {
    const page = openPage + 1;
    const endpoint =
      searchText === ""
        ? `/SalesTarget?page=${page}`
        : `/SalesTarget?SearchText=${searchText}&page=${page}`;

    apiClient
      .get(endpoint)
      .then((response) => {
        const values = response.data.values || [];
        if (searchText === "") {
          setCard((prev) => [...prev, ...values]);
        } else {
          setFilteredCard((prev) => [...prev, ...values]);
        }
        setOpenPage(page);
        if (values.length === 0) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSubmitForm = (data) => {
    const salesTarget = {
      UserId: sessionStorage.getItem("UserId") || "1",
      CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
      ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
      SalesTargetValue: String(data.SalesTargetValue),
      SalesType: String(data.SalesType),
      DocDate: "",
      FromDate: data.FromDate
        ? dayjs(data.FromDate).format("YYYY-MM-DD HH:mm:ss")
        : null,
      ToDate: data.ToDate
        ? dayjs(data.ToDate).format("YYYY-MM-DD HH:mm:ss")
        : null,
      Remarks: data.Remarks || "",
      Status: data.Status ? "1" : "0",
    };

    if (SaveUpdateName === "SAVE") {
      setLoading(true);
      apiClient
        .post(`/SalesTarget`, salesTarget)
        .then((resp) => {
          setLoading(false);
          if (resp.data.success) {
            getAllSalesTargetList();
            clearFormData();
            Swal.fire({
              title: "Success!",
              text: "SalesTarget Added ",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: resp.data.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        })
        .catch(() => {
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: "something went wrong",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      Swal.fire({
        text: `Do You Want Update "${DocEntry}"`,
        icon: "question",
        confirmButtonText: "YES",
        denyButtonText: "NO",
        showDenyButton: true,
        showCancelButton: false,
      }).then((result) => {
        if (result.isConfirmed) {
          setLoading(true);
          apiClient
            .put(`/SalesTarget/${DocEntry}`, salesTarget)
            .then((response) => {
              setLoading(false);
              if (response.data.success) {
                getAllSalesTargetList();
                clearFormData();
                Swal.fire({
                  title: "Success!",
                  text: "SalesTarget Updated",
                  icon: "success",
                  confirmButtonText: "Ok",
                  timer: 1000,
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.message,
                  icon: "warning",
                  confirmButtonText: "Ok",
                });
              }
            })
            .catch(() => {
              setLoading(false);
              Swal.fire({
                title: "Error!",
                text: "something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        }
      });
    }
  };

  const handleOnDelete = () => {
    Swal.fire({
      text: `Do You Want Delete "${DocEntry}"`,
      icon: "question",
      confirmButtonText: "YES",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        apiClient
          .delete(`/SalesTarget/${DocEntry}`)
          .then((resp) => {
            setLoading(false);
            if (resp.data.success) {
              clearFormData();
              getAllSalesTargetList();
              Swal.fire({
                text: "SalesTarget Deleted",
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: resp.data.message,
                icon: "info",
                toast: true,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          })
          .catch(() => setLoading(false));
      }
    });
  };

  const sidebarContent = (
    <>
      <Grid
        item
        width={"100%"}
        py={0.5}
        alignItems={"center"}
        border={"1px solid silver"}
        borderBottom={"none"}
        position={"relative"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          Sales Target List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setDrawerOpen(false)}
          sx={{
            position: "absolute",
            right: "10px",
            top: "0px",
            display: { lg: "none", xs: "block" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid
        container
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              px: 1,
              overflow: "scroll",
              overflowX: "hidden",
              typography: "body1",
            }}
            id="ListScroll"
          >
            <Grid
              item
              padding={1}
              md={12}
              sm={12}
              width={"100%"}
              sx={{
                position: "sticky",
                top: "0",
                zIndex: 1,
                backgroundColor:
                  theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
              }}
            >
              <SearchInputField
                onChange={onHandleSearch}
                value={searchText}
                onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={searchText === "" ? card.length : filteredCard.length}
              next={fetchMoreData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader />}
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {(filteredCard.length === 0 && searchText === ""
                ? card
                : filteredCard
              ).map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.SalesType}
                  subtitle={
                    dayjs(item.FromDate).format("YYYY-MMM-DD") +
                    ` TO ` +
                    dayjs(item.ToDate).format("YYYY-MMM-DD")
                  }
                  onClick={() => {
                    oldSalesTargetSelection(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      <Spinner open={loading} />
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          height="100%"
          sm={12}
          md={6}
          lg={3}
          className="sidebar"
          sx={{
            position: { lg: "relative", xs: "absolute" },
            top: 0,
            left: 0,
            transition: "left 0.3s ease",
            zIndex: 1000,
            display: { lg: "block", xs: `${drawerOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{
              display: { lg: "none" },
              position: "absolute",
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearFormData}
            sx={{
              position: "absolute",
              right: "10px",
            }}
          >
            <RefreshIcon />
          </IconButton>

          <Grid
            item
            width={"100%"}
            py={0.5}
            alignItems={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              Defines Sales Target
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
          >
            <Grid
              container
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="DocEntry"
                      control={control}
                      render={({ field }) => (
                        <InputTextField
                          label="SALES TARGET ID"
                          type="text"
                          readOnly
                          {...field}
                          //   inputProps={{ readOnly: true }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SalesTargetValue"
                      control={control}
                      rules={{
                        required: "Sales Target Value is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="SALES TARGET VALUE"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          inputProps={{ style: { textAlign: "right" } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="FromDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputDatePickerField
                          label="Form Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => {
                            const formatted =
                              date && dayjs(date).isValid()
                                ? dayjs(date).toISOString()
                                : null;
                            field.onChange(formatted);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SalesType"
                      rules={{
                        required: "Please Select Part Sale",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="PART SALE"
                          data={[
                            { key: "PART SALE", value: "PART SALE" },
                            { key: "WORKSHOP SALE", value: "WORKSHOP SALE" },
                          ]}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="ToDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputDatePickerField
                          label="End Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => {
                            const formatted =
                              date && dayjs(date).isValid()
                                ? dayjs(date).toISOString()
                                : null;
                            field.onChange(formatted);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextArea
                          label="REMARKS"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} container justifyContent="center">
                    <Grid item minWidth={220}>
                      <Controller
                        name="Status"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={!!field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            }
                            label="Active"
                            sx={{ width: "100%" }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
                paddingBottom: "8px",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE"}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
