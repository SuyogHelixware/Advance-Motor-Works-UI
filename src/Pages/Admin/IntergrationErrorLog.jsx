import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  InputSelectTextField,
  InputTextSearchField,
} from "../Components/formComponents";
import { useState } from "react";
import useAuth from "../../Routing/AuthContext";

const columns = [
  { field: "OrderNo", headerName: "ID", width: 120, sortable: false },
  {
    field: "transtype",
    headerName: "TRANSTYPE",
    width: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: "sapdoc",
    headerName: "SAPDOC",
    width: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: "posdoc",
    headerName: "POSDOC",
    width: 100,
    sortable: false,
  },
  {
    field: "CardName",
    headerName: "CREATEDTIME",
    width: 120,
    flex: 1,
    sortable: false,
  },
  {
    field: "updatedtime",
    headerName: "UPDATEDTIME",
    width: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: "intgype",
    headerName: "INTGYPE",
    width: 120,
    flex: 1,
    sortable: false,
  },
  {
    field: "poscode",
    headerName: "POSCODE",
    width: 120,
    flex: 1,
    sortable: false,
  },
  {
    field: "soursys",
    headerName: "SOURCE SYSTEM",
    width: 120,
    flex: 1,
    sortable: false,
  },
];

const rows = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
];

export default function IntergrationErrorLog() {
  const { user } = useAuth();
  const getPermissionsByMenuId = (menuId) => {
    const matchedMenu = user?.SubMenus?.flatMap((sub) =>
      sub.Menus.filter((menu) => menu.MenuId === menuId),
    )[0];
    return (
      matchedMenu || {
        IsRead: false,
        IsAdd: false,
        IsEdit: false,
        IsDelete: false,
      }
    );
  };
  // getPermissionsByMenuId(MenuID)
  const perms = getPermissionsByMenuId(13);
  const [Disbled, setdisbled] = useState(perms.IsAdd);
  const theme = useTheme();

  return (
    <>
      <Grid
        container
        xs={12}
        md={12}
        sx={{ border: "1px silver solid" }}
        height="calc(100vh - 90px)"
      >
        {/* <Grid item xs={12} md={12} height={"40px"}>
          

        </Grid> */}

        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{
            display: {},
            position: "absolute",
            right: "10px",
          }}
        >
          <RefreshIcon />
        </IconButton>

        <Grid
          item
          xs={12}
          md={12}
          height={`calc(100vh-100px)`}
          position={"relative"}
        >
          <Typography
            alignContent={"center"}
            sx={{
              // bgcolor: "gainsboro",
              width: "100%",
              height: "40px",
              textAlign: "center",
              borderBottom: "1px solid silver",
            }}
          >
            {/* <PageSubTitle title="Daily Inward Sheet" /> */}
            Integration Error Log Details
          </Typography>
          <Grid
            container
            item
            xs={12}
            md={12}
            justifyContent={"center"}
            py={2}
            columnGap={2}
            rowGap={2}
            sx={{}}
          >
            <Box
              width={"100%"}
              sx={{
                "& .MuiTextField-root": { m: 1 },
              }}
              noValidate
              autoComplete="off"
              position={"relative"}
            >
              <Grid container>
                <Grid item md={4} xs={12} textAlign={"center"}>
                  <InputTextSearchField
                    label="ACCOUNT NO"
                    type="text"
                    // onClick={handleOpen}
                  />
                </Grid>
                <Grid item md={4} xs={12} textAlign={"center"}>
                  <InputSelectTextField
                    label="TRANS TYPE"
                    name="Ttrantype"
                    value=""
                    data={[
                      { key: "1", value: "INVOICE" },
                      { key: "2", value: "SALES EMP" },
                      { key: "3", value: "WAREHOUSE" },
                      { key: "4", value: "ITEM MASTER" },
                      { key: "5", value: "SALES OREDR" },
                      { key: "6", value: "BIN LOCATION" },
                      { key: "7", value: "BUSINESS PARTNER" },
                      { key: "8", value: "INVENTORY TRANSFER" },
                      { key: "9", value: "A/R DOWN PAYMENT" },
                    ]}
                  />
                </Grid>

                <Grid item md={4} xs={12} textAlign={"center"}>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    sx={{
                      color: "white",
                      height: "40px",
                      alignItems: "center",
                      alignContent: "center",
                      alignSelf: "center",
                      ml: 3,
                      mt: 1,
                    }}
                    startIcon={<SearchOutlinedIcon />}
                  >
                    SEARCH
                  </Button>
                </Grid>
              </Grid>

              <Grid
                container
                item
                width={"100%"}
                p={2}
                pt={0}
                my={2}
                minHeight={"300px"}
                maxHeight={"690px"}
                overflow={"scroll"}
                component={Paper}
                style={{
                  overflowX: "hidden",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <Box
                  sx={{
                    height: 600, // Adjust this height as needed
                    width: "100%",
                    "& .MuiDataGrid-root": {
                      border: "none",
                      overflowX: "scroll",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      overflowY: "auto",
                    },
                    "& .MuiDataGrid-footer": {
                      display: "none",
                    },
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    columns={columns}
                    rows={rows}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    pagination={false}
                    hideFooter
                    disableColumnMenu
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                      "& .MuiDataGrid-cell": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell:focus": {
                        outline: "none",
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
