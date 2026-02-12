import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  Paper,
  Typography,
  useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../Routing/AuthContext";
import { ValueFormatter } from "./ValueFormatter";
const FreightModal = ({
  open,
  closeModel,
  SelectFreight,
  onSubmit,
  isLoading,
  columns,
  getRowId,
  title,
  curSource,
  Currency,
  rows = [],
  onRowSelectionModelChange,
}) => {
  const theme = useTheme();
  const { companyData } = useAuth();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };
  const { control, setValue, handleSubmit, getValues } = useForm({
    defaultValues: {
      TaxOnExp: "",
      TaxOnExpSc: "",
      TaxOnExpFc: "",
      GRSAMT: "",
      oExpLines: [],
    },
  });

  // useEffect(() => {
  setValue("oExpLines", rows);
  // }, [ TaxOnExp,GRSAMT, setValue])

  const TaxOnExp = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.VatSum) || 0);
  }, 0);
  const TaxOnExpSc = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.VatSumSy) || 0);
  }, 0);
  const TaxOnExpFc = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.VatSumFrgn) || 0);
  }, 0);

  const TotalExpns = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.LineTotal) || 0);
  }, 0);
  const TotalExpSC = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.TotalSumSy) || 0);
  }, 0);
  const TotalExpFC = getValues("oExpLines").reduce((sum, current) => {
    return sum + (parseFloat(current.TotalFrgn) || 0);
  }, 0);
  setValue("TaxOnExp", ValueFormatter(TaxOnExp));
  setValue("TaxOnExpSc", ValueFormatter(TaxOnExpSc));
  setValue("TaxOnExpFc", ValueFormatter(TaxOnExpFc));
    const GrsAmt =
    curSource === "L"
      ? getValues("oExpLines").reduce((sum, current) => {
          return sum + (parseFloat(current.GrsAmount) || 0);
        }, 0)
      : curSource === "S"
      ? getValues("oExpLines").reduce((sum, current) => {
          return sum + (parseFloat(current.GrsSC) || 0);
        }, 0)
      : Currency === companyData.MainCurncy
      ? getValues("oExpLines").reduce((sum, current) => {
          return sum + (parseFloat(current.GrsAmount) || 0);
        }, 0)
      : getValues("oExpLines").reduce((sum, current) => {
          return sum + (parseFloat(current.GrsFC) || 0);
        }, 0);
        
  setValue("GRSAMT", ValueFormatter(GrsAmt));
  const disabledBtn = rows.some((row) => row.Status === "0");
  let handleSubmitFright = (data) => {
    console.log("=========", data);
    const dataEx = {
      ...data,
      oExpLines: data.oExpLines.filter(
        (line) => parseFloat(line.LineTotal) > 0
      ),
    };
    console.log("====dataEx=====", dataEx);
    onSubmit(dataEx);
  };
  return (
    <Modal
      open={open}
      onClose={closeModel}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: isFullScreen
            ? "95%"
            : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
          maxHeight: "100vh",
          overflowY: "auto",
          padding: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitFright)}
      >
        {/* <IconButton
          onClick={toggleModalSize}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            // "&:hover": {
            //   bgcolor: "darkred",
            // },
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
        <Button
          variant="contained"
          color="success"
          size="small"
          disabled={disabledBtn}
          sx={{
            color: "white",
            alignSelf: "start",
            textAlign: "center",
            width: "140px",
            // mr: 5,
            mt: 0.5,
            mb: 0.5,
          }}
          onClick={SelectFreight}
        >
          Select Freight
        </Button>
        <Grid item>
          {/* ✅ Main DataGrid */}
          <Grid
            
            item
            sx={{
              // ml: { xs: 0, sm: 2 }, // Responsive left margin
              overflow: "auto",
              height: isFullScreen ? "60vh" : "auto",
            }}
          >
            <Paper
              sx={{
                height: isFullScreen ? "60vh" : "50vh",
                display: "flex",
                // flexDirection: "column",
                overflow: "auto",
                            width: "100%",
                            mt: "5px",
              }}
            >
              <DataGrid
                className="datagrid-style"
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                onRowSelectionModelChange={onRowSelectionModelChange}
                // initialState={{
                //   pagination: { paginationModel: { pageSize: 10 } },
                // }}
                columnHeaderHeight={35}
                  hideFooter
                            disableRowSelectionOnClick
                isRowSelectable={(params) => params.row.Status === "0"}
                getRowClassName={(params) =>
                  params.row.Status === "0" || params.row.Status === "3"
                    ? "disabled-row"
                    : ""
                }
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  "& .MuiDataGrid-cell": { border: "none" },
                  "& .MuiDataGrid-cell:focus": { outline: "none" },
                  "& .disabled-row .MuiDataGrid-cell": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "#f0f0f0 !important"
                        : "#080D2B",
                    opacity: 0.6,
                    pointerEvents: "none",
                  },
                }}
              />
            </Paper>
          </Grid>

          <Grid
            container
            item
            sx={{
              borderTop: "1px solid #ddd",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#0A1238",
              height: "45px", // Matches rowHeight
              mt: 1,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)", // Equal-width columns
              gap: 1,
            }}
          >
            {/* Empty space for checkbox column */}

            {/* Total In Stock */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                backgroundColor: "#d0f0c0",
                color: "#06470c",
                borderRadius: 1,
              }}
            >
              TOTAL:{" "}
              {ValueFormatter(
                curSource === "L"
                  ? TotalExpns
                  : curSource === "S"
                  ? TotalExpSC
                  : Currency === companyData.MainCurncy
                  ? TotalExpns
                  : TotalExpFC
              )}
            </Box>

            {/* Tax */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                backgroundColor: "#d0f0c0",
                color: "#06470c",
                borderRadius: 1,
              }}
            >
              Tax:{" "}
              {ValueFormatter(
                curSource === "L"
                  ? TaxOnExp
                  : curSource === "S"
                  ? TaxOnExpSc
                  : Currency === companyData.MainCurncy
                  ? TaxOnExp
                  : TaxOnExpFc
              )}
            </Box>

            {/* Gross Amount */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                backgroundColor: "#d0f0c0",
                color: "#06470c",
                borderRadius: 1,
              }}
            >
              Gross Amount: {ValueFormatter(GrsAmt)}
            </Box>
          </Grid>
        </Grid>

        {/* <Grid
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2, // spacing between children
            mt: 2,
          }}
        >
          <Controller
            // name="TaxOnExp"
            name={
              curSource === "LC"
                ? "TotalExpns"
                : curSource === "SC"
                ? "TotalExpSC"
                : Currency === companyData.MainCurncy
                ? "TotalExpns"
                : "TotalExpFC"
            }
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Total"
                {...field}
                readOnly={true}
                rows={1}
              />
            )}
          />
          <Controller
            // name="TaxOnExp"
            name={
              curSource === "LC"
                ? "TaxOnExp"
                : curSource === "SC"
                ? "TaxOnExpSc"
                : Currency === companyData.MainCurncy
                ? "TaxOnExp"
                : "TaxOnExpFc"
            }
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Total Tax Amt"
                {...field}
                readOnly={true}
                rows={1}
              />
            )}
          />
          <Controller
            name="GRSAMT"
            control={control}
            render={({ field }) => (
              <InputTextField label="Gross Amt" {...field} readOnly />
            )}
          />
        </Grid> */}
        <Grid
          item
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
            px: 1,
          }}
        >
          <Button
            variant="contained"
            size="small"
            color="success"
            type="submit"
          >
            Save
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={closeModel}
          >
            Close
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
};

export default FreightModal;
