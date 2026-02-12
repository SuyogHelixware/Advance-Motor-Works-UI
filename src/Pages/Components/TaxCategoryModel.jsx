import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
const TaxCategoryModel = ({
  open,
  columns,
  getRowId,
  title,
  rows,
  closeModel,
  oLines,
  rowCount,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
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
            ? "70%"
            : { xs: "65%", sm: "65%", md: "65%", lg: "60%" },
          maxHeight: "100vh",
          overflowY: "auto",
          padding: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <IconButton
          onClick={toggleModalSize}
          sx={{
            position: "absolute",
            top: 8,
            right: 50,
            // "&:hover": {
            //   bgcolor: "darkred",
            // },
          }}
        >
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
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
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={closeModel}
          sx={{
            position: "absolute",
            right: "12px",
            top: "0px",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Grid
          container
          // component={"form"}
          // onSubmit={handleSubmit("onSubmitDownPayment ")}
        >
          <Grid
            container
            item
            mt={2}
            sx={{
              ml: 2,
              overflow: "auto",
              width: isFullScreen
                ? "100%"
                : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
              height: isFullScreen ? "65vh" : "auto",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={4}>
                <Box
                  textAlign="center"
                  p={1}
                  bgcolor="primary.light"
                  borderRadius={1}
                >
                  <Typography variant="body2" color="white" fontWeight="bold">
                    Tax Code : {rows?.[0]?.VatGroup ?? "--"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4}>
                <Box
                  textAlign="center"
                  p={1}
                  bgcolor="primary.light"
                  borderRadius={1}
                >
                  <Typography variant="body2" color="white" fontWeight="bold">
                    Tax Rate : {rows?.[0]?.TaxRateHeader ?? "--"}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Paper
              sx={{
                width: isFullScreen
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreen ? "55vh" : "40vh",
                mt: 1,
              }}
            >
              {/* <Box sx={{ flexGrow: 1, overflow: "hidden" }}> */}
              <DataGrid
                className="datagrid-style"
              
                sx={{
                  height: "100%",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: (theme) =>
                      theme.palette.custome?.datagridcolor ||
                      theme.palette.grey[100],
                  },
                  "& .MuiDataGrid-row:hover": {
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                  },
                  "& .selected-row": (theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark" ? green[900] : green[100],
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? green[800] : green[200],
                    },
                  }),
                }}
                rows={rows}
                columns={columns}
                pagination
                paginationMode="server"
                getRowId={getRowId}
                rowCount={rowCount}
    hideFooter // 👈 No pagination footer

                initialState={{
                  pagination: { paginationModel: { pageSize: 8 } },
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: [],
                    },
                  },
                }}
              />
            </Paper>
            {/* </Box> */}
          </Grid>

          <Grid
            item
            mt={1}
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
            {/* <Button
              variant="contained"
              color="success"
              type="submit"
              onClick={onSubmit}
            >
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button> */}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default TaxCategoryModel;
