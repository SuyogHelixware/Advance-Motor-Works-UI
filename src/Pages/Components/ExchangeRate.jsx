import { Box, Button, Divider, Grid, Modal, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { InputTextField } from "./formComponents";
import { useDispatch } from "react-redux";
import {
  clearCacheDate,
  fetchExchangeRateStore,
} from "../../slices/exchangeRateSlice";

const ExchangeRate = ({ open, closeModel, data, title, onSubmit }) => {
  const [CurrencyList, setCurrencyList] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    if (data) {
      const { DocDate, Currency, DocRate, DocEntryCur } = data;
      setCurrencyList([
        {
          id: "1", // unique id for DataGrid
          DocEntry: String(DocEntryCur),
          Status: "1",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          RateDate: dayjs(DocDate).format("YYYY-MM-DD"),
          Currency: Currency,
          Rate: DocRate,
        },
      ]);
    }
  }, [user.UserId, user.UserName, data]);
  const CurrencyColumn = [
    {
      field: "RateDate",
      headerName: "Date",
      width: 150,
      sortable: false,
      align: "center", // Centers cell content
      headerAlign: "center", // Centers header text
      renderCell: (params) => (
        <Typography variant="p" sx={{ textAlign: "center", width: "100%" }}>
          {params.value ? dayjs(params.value).format("DD-MM-YYYY") : ""}
        </Typography>
      ),
    },
    {
      field: "Currency",
      headerName: "Currency Code",
      width: 150,
      editable: false,
      align: "center", // Centers cell content
      headerAlign: "center", // Centers header text
    },
    {
      field: "Rate",
      headerName: "Rate",
      width: 150,
      sortable: true,
      editable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <InputTextField
          name="Quantity"
          type="number"
          value={params.value}
          //  onChange={(e) => handleChange(e, params.row)}
        />
      ),
    },
  ];
  const dispatchRedux = useDispatch();

const handleSubmit = async () => {
   try {
        // rows = latest edited currency list
        console.log("Final Updated Rates:", CurrencyList);
        // Prepare payload
        const obj = CurrencyList.map((item) => ({
          ...item,
          Status: "1",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          DocEntry: String(item.DocEntry),
        }));
        const hasInvalidRate = obj.some(
          (item) => !item.Rate || parseFloat(item.Rate) <= 0
        );
  
        if (hasInvalidRate) {
          Swal.fire({
            title: "Invalid Rate",
            text: "Rate must be greater than 0 and cannot be empty.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return; // stop submission
        }
        // Send to API
        const response = await apiClient.post(
          `/ExchangeRatesandIndexes/Bulk`,
          obj
        );
        console.log("API Response:", response.data);
        const formattedDate = obj[0].RateDate; // "YYYY-MM-DD"
        dispatchRedux(clearCacheDate(formattedDate));
        dispatchRedux(fetchExchangeRateStore(formattedDate))
          .unwrap()
          .then((data) => {
            const values = data?.values || [];
            onSubmit(values);
          })
          .catch((error) => {
            console.log(error);
          });
  
        closeModel();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong: " + error,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
};


  return (
    <Modal
      open={open}
      //   onClose={closeModel}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* <IconButton
          onClick={toggleModalSize}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton> */}

        <Typography
          textAlign="center"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Divider />

        <Grid container>
          <Grid
            container
            item
            mt={2}
            sx={{
              ml: 2,
              width: "auto",
              height: "auto",
            }}
          >
            <DataGrid
              className="datagrid-style"
              columns={CurrencyColumn}
              rows={CurrencyList}
              getRowId={(row) => row.Currency}
              disableRowSelectionOnClick
              hideFooter
              experimentalFeatures={{ newEditingApi: true }}
              processRowUpdate={(newRow, oldRow) => {
                setCurrencyList((prev) =>
                  prev.map((row) =>
                    row.Currency === newRow.Currency ? newRow : row
                  )
                );
                return newRow;
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            mt={1}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              bottom: 0,
              backgroundColor: "background.paper",
              zIndex: 10,
              py: 1,
              borderTop: "1px solid #ccc",
            }}
          >
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save
            </Button>
            {/* <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button> */}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ExchangeRate;
