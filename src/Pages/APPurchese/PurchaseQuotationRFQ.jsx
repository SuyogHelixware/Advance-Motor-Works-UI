import {
  Box,
  Button,
  Drawer,
  // Checkbox,
  // FormControlLabel,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import DarkLogo from "../../assets/DarkLogo.png";
import Logo from "../../assets/Logo.png";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import {
  InputDatePickerField,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import { useNavigate, useSearchParams } from "react-router-dom";
export default function PurchaseQuotationRFQ() {
  const theme = useTheme();
  const { companyData } = useAuth();

  //=====================================get List State====================================================================
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearchByRef = async (docEntry) => {
    if (!docEntry || Number(docEntry) <= 0) {
      Swal.fire("Enter a valid DocEntry", "", "warning");
      return;
    }

    try {
      setLoading(true);

      const url = `/PurchaseQuotation/${docEntry}`;
      const resp = await apiClient.get(url);

      if (!resp.data.success || !resp.data.values) {
        clearFormData();
        return;
      }

      const item = resp.data.values;
      onSelectPurchaseQuotation(item);
    } catch (err) {
      console.error("Search error:", err);
      Swal.fire("Error", "Unable to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const initial = {
    DocEntry: "",
    Ref: "",
    RefSearch: "",
    DocDueDate: "",
    Address: "",
    Address2: "",
    CntctCode: "",
    DeliveryDate: "",
    oLines: [],
  };

  const updateLineValue = (lineNum, field, value) => {
    const rows = getValues("oLines");

    const updated = rows.map((row) =>
      row.LineNum === lineNum ? { ...row, [field]: value } : row,
    );

    setValue("oLines", updated);
  };

  const Items = [
    {
      id: 1,
      field: "LineNum",
      headerName: "LINE NO",
      width: 100,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 130,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "ItemName",
      headerName: "ITEM NAME",
      width: 170,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "Uomcode",
      headerName: "UOM Code",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Controller
            name={`UomCode_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputTextField
                {...field}
                name={`UomCode_${params.row.id}`}
                value={params.value}
                disabled
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        );
      },
    },

    {
      field: "PQTReqDate",
      headerName: "Required Date",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputDatePickerField
          sx={{ mt: -1 }}
          name={`PQTReqDate_${params.row.LineNum}`}
          value={params.value ? dayjs(params.value) : null}
          disabled
        />
      ),
    },

    {
      field: "PQTReqQty",
      headerName: "Required Qty",
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          name={`PQTReqQty_${params.row.LineNum}`}
          type="number"
          value={params.value}
          disabled
        />
      ),
    },

    {
      field: "Price",
      headerName: "PRICE",
      sortable: false,
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          name="Price"
          type="number"
          value={params.value}
          onChange={(e) =>
            updateLineValue(params.row.LineNum, "Price", e.target.value)
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {params.row.Currency}
              </InputAdornment>
            ),
          }}
        />
      ),
    },

    {
      field: "shipDate",
      headerName: "Delivery Date",
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputDatePickerField
          sx={{ mt: -1 }}
          name="shipDate"
          value={params.value ? dayjs(params.value) : null}
          onChange={(date) =>
            updateLineValue(params.row.LineNum, "shipDate", dayjs(date))
          }
        />
      ),
    },

    {
      field: "Quantity",
      headerName: "Delivery Qty",
      width: 140,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputTextField
          sx={{ mt: -1 }}
          name="Quantity"
          type="number"
          value={params.value}
          onChange={(e) =>
            updateLineValue(params.row.LineNum, "Quantity", e.target.value)
          }
        />
      ),
    },
    {
      field: "FreeTxt",
      headerName: "REMARK",
      sortable: false,
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const handleChange = (e) => {
          updateLineValue(params.row.LineNum, "FreeTxt", e.target.value);
        };

        return (
          <InputTextField
            name="FreeTxt"
            type="text"
            value={params.value || ""} // ensure it's not undefined
            onChange={handleChange}
            onKeyDown={(e) => e.stopPropagation()} // prevent DataGrid from interfering with space
          />
        );
      },
    },
  ];

  const parseSAPDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart] = dateStr.split(" ");
    const [month, day, year] = datePart.split("/");
    return dayjs(`${year}-${month}-${day}`);
  };

  const onSelectPurchaseQuotation = async (item) => {
    setValue("DocEntry", item.DocEntry);
    setValue("RefSearch", item.DocNum);
    setValue("DocDueDate", dayjs(item.DocDueDate));
    setValue("Address", item.Address);
    setValue("Address2", item.Address2);
    setValue("DocDate", dayjs(item.DocDate));
    setValue("CardCode", item.CardCode);
    setValue("ReqDate", item.ReqDate);
    setValue("Buyer", companyData?.CompnyName || "");
    setValue("CompanyName", `${item.CardCode}-${item.CardName}`);

    await setbusinessPartner(item.CardCode, item.CntctCode);

    const mappedRows = item.oLines.map((line, index) => ({
      id: index,
      DocEntry: line.DocEntry,
      LineNum: line.LineNum,
      ItemCode: line.ItemCode,
      ItemName: line.ItemName,
      Price: line.Price,
      Discount: line.Discount,
      LineTotal: line.LineTotal,
      Uomcode: line.Uomcode,
      PQTReqQty: line.PQTReqQty,
      PQTReqDate: parseSAPDate(line.PQTReqDate),
    }));
    console.log("Before:", getValues("RefSearch"));

    setTimeout(() => {
      console.log("After:", getValues("RefSearch"));
    }, 0);

    setValue("oLines", mappedRows);
  };

  const clearFormData = () => {
    reset(initial);
  };

  // ==============useForm====================================

  const { control, handleSubmit, reset, setValue, watch, getValues } = useForm({
    mode: "onSubmit",
    defaultValues: initial,
  });

  // const refValue = watch("RefSearch");
  // const [searchParams] = useSearchParams();
  const refValue = searchParams.get("DocEntry");
  useEffect(() => {
    if (!refValue || !companyData) return;

    const timer = setTimeout(() => {
      if (Number(refValue) > 0) {
        handleSearchByRef(refValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [refValue, companyData]);
  const oLines = watch("oLines") || [];

  const setbusinessPartner = async (CardCode, selectedCntctCode) => {
    try {
      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;

      if (response.success === true) {
        // ✔ Find matching CP line either by LineNum or by CntctCode
        const matchedCP = response.values.oCPLines?.find(
          (cp) =>
            cp.LineNum === selectedCntctCode || // match by LineNum
            cp.CntctCode === selectedCntctCode, // match by CntctCode
        );

        if (matchedCP) {
          // ✔ Set actual CP.CntctCode to the field
          setValue("CntctCode", matchedCP.CntctCode);
        } else {
          setValue("CntctCode", ""); // clear if not found
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const navigate = useNavigate();

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: Number(data.DocEntry),
      Lines: data.oLines.map((item) => ({
        LineNum: item.LineNum,
        ItemCode: item.ItemCode,
        ShipDate: item.shipDate,
        Quantity: item.Quantity,
        Price: item.Price,
        FreeTxt: item.FreeTxt,
      })),
    };
    console.log("obj", obj);
    // return; // Uncomment if testing
    try {
      setLoading(true);

      const resp = await apiClient.patch(
        `/PurchaseQuotation/PatchForPurQuot/${data.DocEntry}`,
        obj,
      );

      if (resp.data.success) {
        clearFormData();
        Swal.fire({
          title: "Success!",
          text: "Purchase Quotation is Updated",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        }).then(() => {
          // Attempt to close the tab/window
          try {
            window.close();
          } catch (e) {
            console.warn("Could not close tab:", e);
            // Fallback: Navigate to login or a blank page (doesn't close, but redirects)
            navigate("/"); // Or use window.location.href = "/"; for a hard redirect
          }
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resp.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });

      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const pageRef = useRef(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!pageRef.current) return;
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isLandscape = screenWidth > screenHeight;

      // Use A4 dimensions: Portrait (980w x 1123h) or Landscape (1123w x 980h)
      const pageWidth = isLandscape ? 1123 : 980;
      const pageHeight = isLandscape ? 980 : 1123;

      // Leave 10% margin on each side for breathing room
      const marginFactor = 0.9; // 90% of screen space for content
      const availableWidth = screenWidth * marginFactor;
      const availableHeight = screenHeight * marginFactor;

      const scaleX = availableWidth / pageWidth;
      const scaleY = availableHeight / pageHeight;
      let scale = Math.min(scaleX, scaleY);

      // Prevent scaling below 0.4 for readability, but allow smaller for landscape fit
      scale = Math.max(scale, isLandscape ? 0.3 : 0.5);

      pageRef.current.style.transform = `scale(${scale})`;
      pageRef.current.style.transformOrigin = "center"; // 🔑 Center the scaling
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []); // 🔑 Removed duplicate useEffect

  return (
    <>
      {" "}
      {loading && <Loader open={loading} />}
      <Box
        component="form"
        onSubmit={handleSubmit(handleSubmitForm)}
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f4f7f6",
          width: "100%",
        }}
      >
        {/* MAIN FORM CONTAINER */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            p: { xs: 1, md: 3 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1200px",
              borderTop: "1px solid #6c4373",
              borderRight: "1px solid #6c4373",
              borderLeft: "1px solid #6c4373",

              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* HEADER SECTION */}
            <Grid container sx={{ p: 4, borderBottom: "1px solid #eee" }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{ color: "#6c4373", letterSpacing: "-1px" }}
                >
                  PURCHASE QUOTATION RFQ
                </Typography>
                <Typography variant="h6" color="textSecondary" mt={1}>
                  Ref: {getValues("RefSearch") || "---"}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  textAlign: { xs: "left", md: "right" },
                  mt: { xs: 2, md: 0 },
                }}
              >
                <Box
                  sx={{
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <img
                    src={Logo}
                    alt="Logo"
                    style={{ height: "80px", objectFit: "contain" }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {companyData?.CompnyName || "PURCHASE DEPT"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: {dayjs().format("DD MMMM YYYY")}
                </Typography>
              </Grid>
            </Grid>

            {/* INFO CARDS - RE-DESIGNED VENDOR SECTION */}
            <Grid container spacing={0} sx={{ borderBottom: "1px solid #eee" }}>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: 4,
                  borderRight: { md: "1px solid #eee" },
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #fcfaff 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="overline"
                    fontWeight={800}
                    fontSize={12}
                    color="#6c4373"
                    sx={{ opacity: 0.8, letterSpacing: "1px" }}
                  >
                    VENDOR INFORMATION
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: "12px",
                      borderLeft: "4px solid #6c4373",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ color: "#2c3e50", lineHeight: 1.2 }}
                    >
                      {getValues("CompanyName") || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: "#6c4373",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      ID: {getValues("CntctCode") || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                {/* Decorative background element */}
                {/* <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "#6c4373", opacity: 0.03 }} /> */}
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: 4,
                  borderRight: { md: "1px solid #eee" },
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #fcfaff 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="overline"
                  fontWeight={700}
                  fontSize={15}
                  color="#6c4373"
                >
                  Shipping Address
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    whiteSpace: "pre-line",
                    color: "#555",
                    lineHeight: 1.6,
                    fontSize: 17,
                  }}
                >
                  {getValues("Address2") || "No address provided"}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: 4,
                  borderRight: { md: "1px solid #eee" },
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #fcfaff 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="overline"
                  fontWeight={700}
                  fontSize={15}
                  color="#6c4373"
                >
                  Quotation Details
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      borderBottom: "1px dashed #ddd",
                      pb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Valid Until:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {getValues("DocDueDate")
                        ? dayjs(getValues("DocDueDate")).format("DD/MM/YYYY")
                        : "---"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Required Date:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {getValues("ReqDate")
                        ? dayjs(getValues("ReqDate")).format("DD/MM/YYYY")
                        : "---"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* DATA GRID SECTION */}
            <Box sx={{ p: 4, flex: 1, minHeight: "400px" }}>
              <DataGrid
                rows={oLines}
                columns={Items}
                getRowId={(row) => row.LineNum}
                hideFooter
                sx={{
                  border: "1px solid #e0e0e0",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8f9fa",
                    color: "#6c4373",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-row:nth-child(even)": {
                    backgroundColor: "#f9f9f9", // Light gray background for odd rows; adjust color as needed
                  },
                  "& .MuiDataGrid-cell": {
                    textAlign: "center !important", // Horizontal centering
                    alignItems: "center", // Vertical centering
                  },
                }}
              />
            </Box>

            {/* ACTION FOOTER */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #eee",
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  reset(initial);
                  window.close();
                }}
              >
                Cancel & Close
              </Button>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: "#6c4373",
                    "&:hover": { backgroundColor: "#6c4373" },

                    px: 4,
                  }}
                >
                  Submit Quotation
                </Button>
              </Box>
            </Box>

            {/* POWERED BY FOOTER */}
            <Box
              sx={{
                backgroundColor: "#6c4373",
                color: "white",
                py: 1,
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ opacity: 0.8, fontWeight: 500 }}
              >
                Powered by
              </Typography>
              <Box
                sx={{
                  borderRadius: "4px",
                  p: 0.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={DarkLogo}
                  alt="Logo"
                  style={{ height: "35px", objectFit: "contain" }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
