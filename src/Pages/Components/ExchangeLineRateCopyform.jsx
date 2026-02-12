import { Box, Button, Divider, Grid, Modal, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { InputTextField, ModelInputText } from "./formComponents";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  clearCacheDate,
  fetchExchangeRateStore,
} from "../../slices/exchangeRateSlice";

const ExchangeLineRateCopyform = ({
  open,
  closeModel,
  data,
  title,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    setRows(data); // load initial data
  }, [data]);

  const handleChange = (newRate, id) => {
    const updated = rows.map((item) =>
      item.Currency === id ? { ...item, Rate: newRate } : item
    );
    setRows(updated); // ⭐ Update rows so UI refreshes
  };

  const CurrencyColumn = [
     {
      field: "Type",
      headerName: "Type",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography sx={{ textAlign: "center", width: "100%" }}>
          {params.value }
        </Typography>
      ),
    },
    {
      field: "RateDate",
      headerName: "Date",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography sx={{ textAlign: "center", width: "100%" }}>
          {params.value ? dayjs(params.value).format("DD-MM-YYYY") : ""}
        </Typography>
      ),
    },
    {
      field: "Currency",
      headerName: "Currency Code",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography sx={{ textAlign: "center", width: "100%" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "Rate",
      headerName: "Rate",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ModelInputText
          type="number"
          value={params.value}
          onChange={(e) => handleChange(e.target.value, params.row.Currency)}
        />
      ),
    },
  ];
  const dispatchRedux = useDispatch();

  const handleSubmit = async () => {
    try {
      // rows = latest edited currency list
      console.log("Final Updated Rates:", rows);
      // Prepare payload
      const obj = rows.map((item) => ({
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
        <Typography
          textAlign="center"
          sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}
        >
          {title}
        </Typography>
        <Divider />

        <Grid container>
          <Grid item xs={12} mt={2} sx={{ height: "300px", width: "700px" }}>
            <DataGrid
              className="datagrid-style"
              columns={CurrencyColumn}
              rows={rows}
              getRowId={(row) => row?.Currency ?? row.id}
              hideFooter
              disableRowSelectionOnClick
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
              py: 1,
              borderTop: "1px solid #ccc",
            }}
          >
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ExchangeLineRateCopyform;
