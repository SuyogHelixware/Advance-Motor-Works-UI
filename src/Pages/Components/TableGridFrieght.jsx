import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import useAuth from "../../Routing/AuthContext";
import { ValueFormatter } from "./ValueFormatter";
import { useRef } from "react";
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
  processRowUpdate,
  apiRef,
  onCellKeyDown,
  onRowSelectionModelChange,
}) => {
  const theme = useTheme();
  const { companyData } = useAuth();
  const saveBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { control, setValue, handleSubmit, getValues } = useForm({
    defaultValues: {
      TaxOnExp: "",
      TaxOnExpSc: "",
      TaxOnExpFc: "",
      GRSAMT: "",
      oExpLines: [],
    },
  });
  // const handleFreightKeyDown = (params, event) => {
  //   const api = apiRef.current;
  //   if (!api) return;

  //   const visibleColumns = api.getVisibleColumns();
  //   const rowIds = api.getSortedRowIds();

  //   const colIndex = visibleColumns.findIndex(
  //     (c) => c.field === params.field
  //   );
  //   const rowIndex = rowIds.indexOf(params.id);

  //   let nextRow = rowIndex;
  //   let nextCol = colIndex;

  //   const isFirstRow = rowIndex === 0;
  //   const isLastRow = rowIndex === rowIds.length - 1;
  //   const isFirstCol = colIndex === 0;
  //   const isLastCol = colIndex === visibleColumns.length - 1;

  //   const NAV_KEYS = [
  //     "Tab",
  //     "Enter",
  //     "ArrowRight",
  //     "ArrowLeft",
  //     "ArrowDown",
  //     "ArrowUp",
  //   ];
  //   if (!NAV_KEYS.includes(event.key)) return;

  //   event.preventDefault();

  //   // ✅ Commit edit safely
  //   if (api.getCellMode(params.id, params.field) === "edit") {
  //     api.stopCellEditMode({ id: params.id, field: params.field });
  //   }

  //   switch (event.key) {
  //     /* ================= TAB ================= */
  //     case "Tab":
  //       if (event.shiftKey) {
  //         // ⬅️ SHIFT + TAB
  //         nextCol--;

  //         if (nextCol < 0) {
  //           nextCol = visibleColumns.length - 1;
  //           nextRow--;
  //         }

  //         // 🔁 Loop: first cell → last cell
  //         if (nextRow < 0) {
  //           nextRow = rowIds.length - 1;
  //           nextCol = visibleColumns.length - 1;
  //         }
  //       } else {
  //         // ➡️ TAB
  //         nextCol++;

  //         if (nextCol >= visibleColumns.length) {
  //           nextCol = 0;
  //           nextRow++;
  //         }

  //         // 🔁 Last cell → Save button
  //         if (nextRow >= rowIds.length) {
  //           saveBtnRef.current?.focus();
  //           return;
  //         }
  //       }
  //       break;

  //     /* ================= ENTER ================= */
  //     case "Enter":
  //       // ENTER behaves like ArrowDown
  //       if (isLastRow && isLastCol) {
  //         saveBtnRef.current?.focus();
  //         return;
  //       }
  //       nextRow++;
  //       break;

  //     /* ================= ARROWS ================= */
  //     case "ArrowDown":
  //       nextRow++;
  //       break;
  //     case "ArrowUp":
  //       nextRow--;
  //       break;
  //     case "ArrowRight":
  //       nextCol++;
  //       break;
  //     case "ArrowLeft":
  //       nextCol--;
  //       break;
  //     default:
  //       return;
  //   }

  //   // ❌ Prevent invalid focus
  //   if (
  //     nextRow < 0 ||
  //     nextRow >= rowIds.length ||
  //     nextCol < 0 ||
  //     nextCol >= visibleColumns.length
  //   )
  //     return;

  //   const nextId = rowIds[nextRow];
  //   const nextField = visibleColumns[nextCol].field;

  //   // ✅ Scroll + focus
  //   api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
  //   api.setCellFocus(nextId, nextField);
  // };

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
        (line) => parseFloat(line.LineTotal) > 0,
      ),
    };
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
          //   width: isFullScreen
          //     ? "95%"
          //     : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
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
              height: "50vh",
            }}
          >
            <Paper
              sx={{
                height: "48vh",
                display: "flex",
                overflow: "hidden",
                width: "auto",
                mt: "5px",
              }}
            >
              <DataGrid
                className="datagrid-style"
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                // onRowSelectionModelChange={onRowSelectionModelChange}........

                columnHeaderHeight={35}
                rowHeight={45}
                editMode="cell"
                apiRef={apiRef}
                processRowUpdate={processRowUpdate}
                onCellKeyDown={(params, event) => onCellKeyDown(params, event)}
                // onCellKeyDown={handleFreightKeyDown}

                onProcessRowUpdateError={(e) => console.error(e)}
                experimentalFeatures={{ newEditingApi: true }}
                isRowSelectable={(params) => params.row.Status === "0"}
                getRowClassName={(params) =>
                  params.row.Status === "0" || params.row.Status === "3"
                    ? "disabled-row"
                    : ""
                }
                sx={{
                  // backgroundColor:
                  //   theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  // "& .MuiDataGrid-cell": { border: "none" },
                  // "& .MuiDataGrid-cell:focus": { outline: "none" },
                  // "& .disabled-row .MuiDataGrid-cell": {
                  //   backgroundColor:
                  //     theme.palette.mode === "light"
                  //       ? "#f0f0f0 !important"
                  //       : "#080D2B",
                  //   opacity: 0.6,
                  //   pointerEvents: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    // backgroundColor:
                    //   theme.palette.custome?.datagridcolor ||
                    //   theme.palette.grey[10],
                    // minHeight: "45px !important",
                    // maxHeight: "45px !important",
                    // lineHeight: "50px !important",
                    borderBottom: "2px solid",
                    borderColor: theme.palette.divider,
                  },

                  "& .MuiDataGrid-columnHeader": {
                    padding: "0 8px",
                    borderRight: "1px solid",
                    borderColor: theme.palette.divider,
                    "&:focus, &:focus-within": {
                      outline: "none",
                    },
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  },
                  "& .disabled-cell": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                    color: theme.palette.text.disabled,
                    cursor: "not-allowed",
                  },
                  "& .disabled-row .MuiDataGrid-cell[data-field='taxCategory']":
                    {
                      pointerEvents: "auto",
                      backgroundColor:
                        theme.palette.mode === "light" ? "#F5F6FA" : "#101840",
                    },
                  /* ===== Readonly row (NO blur) ===== */
                  "& .readOnly-row": {
                    pointerEvents: "none", // prevent editing
                    opacity: 1, // 🔑 keep normal look
                    filter: "none",
                  },

                  "& .readOnly-row .MuiDataGrid-cell[data-field='taxCategory']":
                    {
                      pointerEvents: "auto", // allow interaction
                      opacity: 1,
                      filter: "none",
                      backgroundColor:
                        theme.palette.mode === "light" ? "#F5F6FA" : "#dcdde3",
                    },
                  "& .MuiDataGrid-columnSeparator": {
                    visibility: "visible",
                    color: theme.palette.divider,
                  },

                  // ========== CELL ==========
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid",
                    borderRight: "1px solid",
                    borderColor: theme.palette.divider,
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    "&:focus, &:focus-within": {
                      outline: "2px solid",
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: "-2px",
                    },
                  },

                  // ========== ROW ==========
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(0,0,0,0.04)"
                        : "rgba(255,255,255,0.08)",
                  },

                  "& .MuiDataGrid-row:nth-of-type(even)": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(0,0,0,0.02)"
                        : "rgba(255,255,255,0.02)",
                  },

                  // ========== FOOTER ==========
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "2px solid",
                    borderColor: theme.palette.divider,
                    minHeight: "52px",
                  },
                  // "& .error-row": {
                  //   backgroundColor: "rgba(255, 0, 0, 0.08)",
                  // },
                  // "& .error-row:hover": {
                  //   backgroundColor: "rgba(255, 0, 0, 0.15)",
                  // },
                  // ========== OUTER ==========
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                  borderRadius: "4px",
                  overflow: "hidden",
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
                      : TotalExpFC,
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
                      : TaxOnExpFc,
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
            ref={saveBtnRef}
            variant="contained"
            size="small"
            color="success"
            type="submit"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handleSubmitFright)();
                closeBtnRef.current?.focus();
              }
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            ref={closeBtnRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                closeModel();
              }
            }}
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
