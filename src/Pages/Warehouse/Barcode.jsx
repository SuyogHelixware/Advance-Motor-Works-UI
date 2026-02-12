// import React, { useState } from "react";

// import { Box, Grid, IconButton, Typography } from "@mui/material";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import { InputSearchButton } from "../Components/formComponents";

// import { DataGrid } from "@mui/x-data-grid";
// import { useTheme } from "@mui/material/styles";

// export default function IssueMaterial() {
//   //const [phone, setPhone] = useState("");
//   const theme = useTheme();

//   // data grid Table
//   const columns = [
//     {
//       field: "SN",
//       headerName: "SN",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "ITEM CODE",
//       headerName: "ITEM CODE",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "ITEM DESCRIPTION",
//       headerName: "ITEM DESCRIPTION",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "QUANTITY",
//       headerName: "QUANTITY	",
//       width: 200,
//       editable: true,
//     },
//     {
//       field: "PRINT",
//       headerName: "PRINT	",
//       width: 200,
//       editable: true,
//     },
//   ];

//   const rows = [
//     { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
//     { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//     { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//     { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
//     { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
//   ];

//   const [drawerOpen, setDrawerOpen] = useState(false);

//   const toggleDrawer = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   // const onHandleSearch = () => {
//   //   alert();
//   // };

//   // const [age, setAge] = React.useState("");

//   // const handleChange = (event) => {
//   //   setAge(event.target.value);
//   // };

//   return (
//     <>
//       <Grid container height="calc(100vh - 110px)">
//         <Grid
//           container
//           item
//           width="100%"
//           height="100%"
//           sm={12}
//           md={12}
//           lg={12}
//           component="form"
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
//               },
//               position: "absolute",
//               left: "10px",
//             }}
//           >

//           </IconButton>

//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="menu"
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
//               Barcode Print
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
//                 component="form"
//                 sx={{
//                   "& .MuiTextField-root": { m: 1 },
//                   width: "100%",
//                 }}
//                 noValidate
//                 autoComplete="off"
//               >
//                 <Grid container>
//                   <Grid item sm={6} md={6} lg={2} xs={12} textAlign={"center"}>
//                     <InputSearchButton />
//                   </Grid>
//                 </Grid>
//                 <Grid
//                   container
//                   sx={{
//                     // px: 2,
//                     overflow: "auto",
//                     width: "100%",
//                     //backgroundColor: "#f2f2f2",
//                     height: "80%",
//                   }}
//                 >
//                   {/* Data grid table start */}
//                   <DataGrid
//                     rows={rows}
//                     columns={columns}
//                     initialState={{
//                       pagination: {
//                         paginationModel: {
//                           pageSize: 5,
//                         },
//                       },
//                     }}
//                     sx={{
//                       backgroundColor:
//                         theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
//                     }}
//                     pageSizeOptions={[5]}
//                     disableRowSelectionOnClick
//                   />
//                 </Grid>
//               </Box>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// }

// src/App.js

// import { Autocomplete, TextField } from "@mui/material";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { BASE_URL } from "../Api/Constant";

// const App = () => {
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [WMSStaff, setWMSStaff] = useState([]);

//   useEffect(() => {
//     getAllWMSStaffList();
//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           "https://jsonplaceholder.typicode.com/users"
//         );
//         const result = await response.json();
//         setData(result);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredData = data.filter((item) => {
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return (
//       item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
//       item.phone.toLowerCase().includes(lowerCaseSearchTerm) || // Example: searching by phone
//       item.username.toLowerCase().includes(lowerCaseSearchTerm) // Example: searching by username
//     );
//   });

//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   const dataname = [
//     { label: "Helixware"},
//     { label: "hw"},
//     { label: "orp"},
//     { label: "kwt"},
//     { label: "Ketan"},
//     { label: "sagar"},
//     { label: "Fiction"},

//   ];

//   return (
//     <>
//       <div>
//         <Autocomplete
//           size="small"
//           disablePortal
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label="GL ACCOUNT"
//               style={{ width: "300px" }}
//             />
//           )}
//           style={{ width: "300px" }}
//         />
//       </div>
//       <div>
//         <h1>Search Users</h1>
//         <input
//           type="text"
//           placeholder="Search by name, phone, or username..."
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//         <ul>
//           {filteredData.map((item) => (
//             <li key={item.id}>
//               Name: {item.name}, Phone: {item.phone}, Username: {item.username}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// };

// export default App;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Autocomplete, TextField } from "@mui/material";
// import { BASE_URL } from "../Api/Constant";

// const Gl = () => {
//   const [wmsStaff, setWMSStaff] = useState([]);

//   const getAllWMSStaffList = () => {
//     axios
//       .get(`${BASE_URL}/Technician/All`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         console.log("API Response:", response.data);
//         setWMSStaff(response.data.values);
//       })
//       .catch((error) => {
//         console.log("Error fetching WMS staff:", error);
//       });
//   };

//   useEffect(() => {
//     getAllWMSStaffList();
//   }, []);

//   console.log("WMS Staff:", wmsStaff);

//   return (
//     <Autocomplete
//       size="small"
//       disablePortal
//       options={wmsStaff}
//       getOptionLabel={(option) => option.name || "No Name"}
//       renderInput={(params) => (
//         <TextField {...params} label="GL ACCOUNT" style={{ width: "300px" }} />
//       )}
//       style={{ width: "300px" }}
//     />
//   );
// };

// export default Gl;
