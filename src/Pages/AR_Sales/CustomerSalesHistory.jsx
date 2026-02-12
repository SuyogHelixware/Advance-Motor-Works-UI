
import RefreshIcon from "@mui/icons-material/Refresh";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { Box, Drawer, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";

import {
  InputFields,
  InputTextSearchButton,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";

const columns = [
  { field: "DOC_NUM", headerName: "DOC NUM", width: 120 },
  {
    field: "DOC_DATE",
    headerName: "DOC DATE",
    width: 120,
    editable: true,
  },
  {
    field: "ITEM_CODE",
    headerName: "ITEM CODE",
    width: 120,
    editable: true,
  },
  {
    field: "ITEM_NAME",
    headerName: "ITEM NAME",
    type: "number",
    width: 120,
    editable: true,
  },
  {
    field: "QTY",
    headerName: "QTY",
    sortable: false,
    width: 120,
  },
  {
    field: "unit_Price",
    headerName: "UNIT PRICE",
    width: 120,
    editable: true,
  },
  {
    field: "DIS",
    headerName: "DIS(%)",
    type: "number",
    width: 120,
    editable: true,
  },
  {
    field: "DIS_AMT",
    headerName: "DIS AMT",
    width: 120,
    editable: true,
  },
  {
    field: "AFTER_DIS",
    headerName: "AFTER DIS",
    width: 120,
    editable: true,
  },
  {
    field: "ACTION",
    headerName: "ACTION",
    width: 120,
    editable: true,
  },
];

const rows = [
  {
    id: 1,
    DOC_NUM: "DOC12345",
    DOC_DATE: "2024-08-25",
    ITEM_CODE: "ITEM001",
    ITEM_NAME: "Sample Item",
    QTY: "10",
    unit_Price: "50.00",
    DIS: "10%",
    DIS_AMT: "5.00",
    AFTER_DIS: "45.00",
    ACTION: "Update",
  },

  
  

];

export default function CustomerSalesHistory() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const theme = useTheme();

  const handleInputChange = () => {
    setIsDialogOpen(true); // Open the dialog when input changes
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>

      <Grid container width={"100%"} padding={1} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          component="form"
          position="relative"
        >
         

         <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={ClearFormData}
            sx={{
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

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
              Customer Sales History
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
              height="calc(100% - 5px)"
              // sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
             

             <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width:'100%'
                }}
                noValidate
                autoComplete="off"
              >


                <Grid
                  container
                 
                >
                  <Grid container item>
                  <Grid item xs={12} md={6} textAlign={"center"}>
                    <InputTextSearchButton
                      label="CONTACT NO"
                      onClick={handleInputChange}
                      value={""}
                      onChange={handleInputChange}
                    />
                    </Grid>
                  <Grid item xs={12} md={6} textAlign={"center"}>

                    <InputFields
                      label="CUSTOMER NAME"
                      name="customer_id"
                      value=""
                    />
                    {/* <SearchButtonModel
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      title=" Select Customersss"
                    /> */}
                    <SearchModel
                    
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      onCancel={handleCloseDialog}
                      title="Select Customer"
                      // onChangeListSearch={this.handleOnJCListSearchModal}
                      // onClickClear={this.onClickClear}
                      // hidden={this.state.searchText}
                      // value={this.state.searchText}
                      // cardData={
                      //   <>
                      //     <InfiniteScroll
                      //       dataLength={
                      //         this.state.FilteredIssueMatListData.length === 0
                      //           ? this.state.IssueMatList.length
                      //           : this.state.FilteredIssueMatListData.length
                      //       }
                      //       next={this.fetchMoreIssueMatForRtn}
                      //       hasMore={this.state.HasMoreIssueMatList}
                      //       loader={
                      //         <BeatLoader className="d-flex justify-content-center" />
                      //       }
                      //       scrollableTarget="ListScrollV"
                      //       endMessage={
                      //         <div className="text-center">
                      //           <SubTitle title="No More Records" />
                      //         </div>
                      //       }
                      //     >
                      //       {this.state.HasMoreIssueMatList &&
                      //       this.state.IssueMatList.length === 0 ? (
                      //         <>
                      //           <SkeletonLoader />
                      //           <SkeletonLoader />
                      //         </>
                      //       ) : (
                      //         (this.state.FilteredIssueMatListData.length === 0
                      //           ? this.state.IssueMatList
                      //           : this.state.FilteredIssueMatListData
                      //         ).map((MatReq) => (
                      //           <CardComponentList
                      //             key={MatReq.DocEntry}
                      //             name={MatReq.DocNum}
                      //             description={MatReq.CardName}
                      //             number={MatReq.PhoneNumber1}
                      //             onClick={() => this.handleJCSearchModalSubmit(MatReq)}
                      //           />
                      //         ))
                      //       )}
                      //     </InfiniteScroll>
                      //   </>
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={6} textAlign={"center"}>
                    <InputFields label="CUSTOMER ID" name="role id" value="" />
                   
                  </Grid>
                  <Grid item xs={12} md={6} textAlign={'center'}>
                  <InputFields
                      label="SALES HISTORY"
                      name="role name"
                      value=""
                    />
                  </Grid>

                </Grid>
           
               <Grid container item mt={2}>
              <Grid item style={{ width: "100%", }}>
                <Paper sx={{ width: "100%" }}>
                  <Grid item display={'flex'} sx={{ fontSize: 15, color: "#1976D2" }}>
                    <SystemUpdateAltIcon sx={{ fontSize: 20 }} />
                    &nbsp; EXPORT
                  </Grid>

                 
                      <DataGrid
                        columnHeaderHeight={35}
                        rowHeight={45}
                        className="datagrid-style"
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "light" ? "#fff" : "#373842",
                          "& .MuiDataGrid-cell": {
                            border: "none",
                          },
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },
                        }}
                        rows={rows}
                        columns={columns}
                        initialState={{
                          pagination: {
                            paginationModel: {
                              pageSize: 3,
                            },
                          },
                        }}
                        hideFooter
                        disableRowSelectionOnClick
                        pageSizeOptions={[3]}
                      />
                   
                </Paper>
              </Grid>
              </Grid>

                </Grid>
             </Box>
             
             
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { lg: "none" }, // Show only on smaller screens
          "& .MuiDrawer-paper": {
            top: "70px", // Adjust this value as needed
            width: "80vw",
          },
        }}
      ></Drawer>
    </>
  );
}
