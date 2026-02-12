import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import {
  InputFields,
  InputTextSearchButton,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

const columns = [
  {
    field: "ACTION",
    headerName: "STATUS",
    width: 90,
  },
  { field: "ITEM_CODE", headerName: "ITEM CODE", width: 100 },
  {
    field: "ITEM_NAME",
    headerName: "ITEM NAME",
    width: 120,
  },
  {
    field: "POQTY",
    headerName: "PO QTY",
    width: 100,
  },
  {
    field: "OPENQTY",
    headerName: "OPEN QTY",
    width: 100,
  },
  {
    field: "DOC_DATE",
    headerName: " ETA DATE",
    width: 120,
  },
  {
    field: "SHIP_TYPE",
    headerName: " SHIP TYPE",
    width: 120,
  },
  {
    field: "ETAQTY",
    headerName: "ETA QTY",
    width: 100,
  },
  { field: "DOC_NUM", headerName: "DOC ENTRY", width: 100 },
];

const rows = [
  {
    id: 1,
    DOC_NUM: "DOC12345",
    DOC_DATE: "2024-08-25",
    ITEM_CODE: "IT5264",
    ITEM_NAME: "Sample Item",
    SHIP_TYPE: "BY ROAD",
    OPENQTY: "25",
    ETAQTY: "20",
    QTY: "10",
    ACTION: "Update",
    POQTY: "30",
  },
  {
    id: 2,
    DOC_NUM: "DOC12346",
    DOC_DATE: "2024-08-26",
    ITEM_CODE: "IT6974",
    SHIP_TYPE: "BY AIR",
    ITEM_NAME: "Another Item",
    ETAQTY: "15",
    OPENQTY: "35",
    QTY: "5",
    ACTION: "Update",
    POQTY: "25",
  },
  {
    id: 3,
    DOC_NUM: "DOC12347",
    DOC_DATE: "2024-08-27",
    SHIP_TYPE: "BY ROAD",
    OPENQTY: "20",
    ITEM_CODE: "IT7297",
    ITEM_NAME: "Different Item",
    ETAQTY: "10",
    QTY: "8",
    ACTION: "Update",
    POQTY: "20",
  },
];

export default function ProcurementETA() {
   const perms = usePermissions(140);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleInputChange = () => {
    setIsDialogOpen(true);
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
            aria-label="add"
            sx={{
              position: "absolute",
              right: "10px",
            }}
          >
            <AddIcon />
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
              Procurement ETA
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
              position={"relative"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid container item>
                    <Grid item xs={12} sm={6} md={3} lg={4} textAlign={"center"}>
                      <InputTextSearchButton
                        label="SEARCH"
                        onClick={handleInputChange}
                        value={""}
                        onChange={handleInputChange}
                      />
                      <SearchModel
                        open={isDialogOpen}
                        onClose={handleCloseDialog}
                        onCancel={handleCloseDialog}
                        title="SELECT VENDOR"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={4} textAlign={"center"}>
                      <InputFields
                        label="DOC ENTRY"                      
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={4} textAlign={"center"}>
                      <InputFields label="PO DOC ENTRY" name="customer_id" />
                    </Grid>
                  </Grid>
                  <Grid container item mt={2}>
                    <Grid item style={{ width: "100%", height: "100%" }}>
                      <Paper sx={{ width: "100%", height: "100%" }}>
                        <DataGrid
                          className="datagrid-style"
                          sx={{
                            "& .MuiDataGrid-columnHeaders": {
                              width: "100%",
                              height: "calc(100% - 1px)",
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
                }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ color: "white" }}
                  >
                    SAVE
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="error">
                    CANCEL
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
