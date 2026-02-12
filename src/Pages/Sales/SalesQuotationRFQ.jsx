import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";

import {
  Box,
  Button,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  // InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchModel from "../Components/SearchModel";

export default function SalesQuotationRFQ() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");


  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  //=====================================get List State====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [SalesQuotationRFQRows, setSalesQuotationRFQRows] = useState([]);

  const timeoutRef = useRef(null);
  const { user,companyData } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initial = {
    DocEntry: "",
    Ref: "",
    DocDueDate: "",
    Address: "",
    Address2: "",
    CntctCode: "",
    DeliveryDate: "",
    CompanyName:""
  };
  const setbusinessPartner = async (CardCode, selectedCntctCode) => {
    try {
      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;
  
      if (response.success === true) {  
        // ✔ Find matching CP line either by LineNum or by CntctCode
        const matchedCP = response.values.oCPLines?.find(
          cp =>
            cp.LineNum === selectedCntctCode ||  // match by LineNum
            cp.CntctCode === selectedCntctCode   // match by CntctCode
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
  const Items = [
    {
      id: 1,
      field: "LineNum",
      headerName: "LINE NO",
      width: 100,
      renderCell: (params) => <span>{params.id + 1}</span>,
    },
    { field: "ItemCode", headerName: "ITEM CODE", width: 100 },
    {
      field: "ItemName",
      headerName: "ITEM NAME",
      width: 150,
      sortable: false,
    },
     {
      field: "UomCode",
      headerName: "UOM Code",
      sortable: false,
      width: 150,
      editable: false,
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
                // onChange={(e) => {
                //   field.onChange(e);
                //   handleChange(e, params.row);
                // }}
                disabled
                error={!!error}
                helperText={error?.message}
                // onClick={() => {
                //   if (!isDisabled) OumCodeListData(params.row.UomEntry2);
                // }}
                // InputProps={{
                //   endAdornment: (
                //     <InputAdornment position="end">
                //       <IconButton
                //         // onClick={() => {
                //         //   setValue("selectedRowIndex", params.row.id);
                //         //   setUomcodeOpen(true);
                //         // }}
                //         disabled={isDisabled}
                //         size="small"
                //         color="primary"
                //         style={{
                //           backgroundColor: "green",
                //           borderRadius: "10%",
                //           color: "white",
                //           padding: 2,
                //         }}
                //       >
                //         <ViewListIcon />
                //       </IconButton>
                //     </InputAdornment>
                //   ),
                // }}
              />
            )}
          />
        );
      },
    },
      {
          field: "shipDate",
          headerName: "Delivery Date",
          width: 150,
          editable: false,
          renderCell: (params) => (
            <InputDatePickerField
              name="shipDate"
              value={params.value ? dayjs(params.value) : undefined}
              // onChange={(date) =>
              //   handleChange(
              //     {
              //       target: {
              //         name: "shipDate",
              //         value: dayjs(date),
              //       },
              //     },
              //     params.row
              //   )
              // }
            />
          ),
        },
        {
          field: "Quantity",
          headerName: "Delivery Qty.",
          width: 140,
          editable: false,
          renderCell: (params) => (
            <InputTextField
              name="Quantity"
              type="number"
              value={params.value}
              // onChange={(e) => handleChange(e, params.row)}
              disabled={
                params.row.Status === "0" ||
                params.row.Quantity !== params.row.OpenQuantity
              }
            />
          ),
        },
   
   
    {
         field: "Price",
         headerName: "PRICE",
         sortable: false,
         width: 200,
         editable: false,
         renderCell: (params) => (
           <InputTextField
             name="PriceBefDi"
             type="number"
             value={params.value}
            //  onChange={(e) => handleChange(e, params.row)}
             disabled={
               params.row.Status === "0" ||
               params.row.Quantity !== params.row.OpenQuantity
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
          field: "CustReqDate",
          headerName: "Required Date",
          width: 150,
          editable: false,
          renderCell: (params) => (
            <InputDatePickerField
              name="CustReqDate"
              value={params.value ? dayjs(params.value) : undefined}
              // onChange={(date) =>
              //   handleChange(
              //     {
              //       target: {
              //         name: "shipDate",
              //         value: dayjs(date),
              //       },
              //     },
              //     params.row
              //   )
              // }
            />
          ),
        },
         {
          field: "ReqQuantity",
          headerName: "Required Qty.",
          width: 140,
          editable: false,
          renderCell: (params) => (
            <InputTextField
              name="ReqQuantity"
              type="number"
              value={params.value}
              // onChange={(e) => handleChange(e, params.row)}
             
            />
          ),
        },
{
          field: "ReqPrice",
          headerName: "Price",
          width: 140,
          editable: false,
          renderCell: (params) => (
            <InputTextField
              name="Price"
              type="number"
              value={params.value}
              // onChange={(e) => handleChange(e, params.row)}
             
            />
          ),
        },
  ];


  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/SalesQuotation/Search/${searchTerm}/1/${pageNum}/20`
        : `/SalesQuotation/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const parseSAPDate = (dateStr) => {
      if (!dateStr) return null;
      const [datePart] = dateStr.split(" ");
      const [month, day, year] = datePart.split("/");
      return dayjs(`${year}-${month}-${day}`);
    };
 const onSelectSalesQuotation = async(item) => {
    SearchModelClose();
    setValue("DocEntry", item.DocEntry);
    setValue("Ref", item.DocNum);
    setValue("DocDueDate", dayjs(item.DocDueDate));
    setValue("Address", item.Address);
    setValue("Address2", item.Address2);
    setValue("CntctCode", item.CntctCode);
    setValue("DocDate", dayjs(item.DocDate));
    setValue("CardCode", item.CardCode);
    setValue("CardName", item.CardName);
setValue("CompanyName",companyData.CompnyName);
    await setbusinessPartner(item.CardCode, item.CntctCode);

    const mappedRows = item.oLines.map((line, index) => ({
      id: index,
      DocEntry: line.DocEntry,
      LineNum: line.LineNum,
      ItemCode: line.ItemCode,
      ItemName: line.ItemName,
      Quantity: line.Quantity,
      Price: line.Price,
      Discount: line.Discount,
      LineTotal: line.LineTotal,
      UomCode: line.UomCode,
      PQTReqQty: line.PQTReqQty,
      shipDate: parseSAPDate(line.shipDate),
      PQTReqDate: parseSAPDate(line.PQTReqDate),
    }));

    setSalesQuotationRFQRows(mappedRows);
  };
  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchGetListData(0); // Load first page on mount
  }, []);

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

  // ==============useForm====================================

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const { isDirty } = useFormState({ control });
 
  const fetchSalesQuotationRFQsByItemCode = async (itemCode) => {
    if (!itemCode) {
      setSalesQuotationRFQRows([]);
      return;
    }

    try {
      const url = `/SalesQuotationRFQ?Status=1&Page=0&SearchText=${itemCode}&Limit=100`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        const rows = (response.data.values || []).map((x, index) => ({
          id: index + 1, // DataGrid row ID
          DocEntry: x.DocEntry, // ALWAYS present
          ...x,
        }));

        setSalesQuotationRFQRows(rows);
      }
    } catch (e) {
      console.error("SalesQuotationRFQ fetch error:", e);
    }
  };

  const ItemCode = watch("ItemCode");


  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: data.DocEntry || 0,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate:
        dayjs(data.CreatedDate).format("YYYY-MM-DD") ||
        dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      ItemCode: String(data.ItemCode),
      BcdCode: String(data.BcdCode),
      BcdName: String(data.BcdName),
      UgpEntry: data.UgpEntry,
      UomEntry: data.UomEntry,
      Status: 1,
    };

    try {
      if (SaveUpdateName === "SAVE") {
        setLoading(true);

        const resp = await apiClient.post(`/SalesQuotationRFQ`, obj);

        if (resp.data.success) {
          fetchSalesQuotationRFQsByItemCode(watch("ItemCode"));
         
          Swal.fire({
            title: "Success!",
            text: "SalesQuotationRFQ is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: resp.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.BcdName}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          setLoading(true);
          const response = await apiClient.put(
            `/SalesQuotationRFQ/${DocEntry}`,
            obj
          );
          setLoading(false);
          if (response.data.success) {
            clearFormData();
           

            Swal.fire({
              title: "Success!",
              text: "SalesQuotationRFQ Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "SalesQuotationRFQ is Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
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

  // ===============Delete API ===================================

  const handleOnDelete = async (data) => {
    const result = await Swal.fire({
      text: `Do You Want to Delete ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await apiClient.delete(
          `/SalesQuotationRFQ/${DocEntry}`
        );
        const { success, message } = response.data;
        if (success) {
          clearFormData();
      
          Swal.fire({
            text: "SalesQuotationRFQ Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            text: "SalesQuotationRFQ not Deleted",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting SalesQuotationRFQ:", error);
        Swal.fire({
          text: "An error occurred while deleting the service.",
          icon: "error",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        text: "SalesQuotationRFQ Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      {/* <Spinner open={loading} /> */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{
              display: {
                lg: "none",
              }, // Show only on smaller screens
              position: "absolute",
              // top: "10px",
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearFormData}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              // top: "10px",
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
              Sales Quotation RFQ
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
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
              <Box
                width={"100%"}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                    {" "}
                    <Controller
                      name="Ref"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="REFERENCE"
                          readOnly={true}
                          // disabled={!!DocEntry}
                          onClick={() => {
                            OpenDailog();
                          }}
                          onChange={OpenDailog}
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                    <SearchModel
                      open={searchmodelOpen}
                      onClose={SearchModelClose}
                      onCancel={SearchModelClose}
                      title="Select Sales Quotation"
                      onChange={(e) => handleGetListSearch(e.target.value)}
                      value={getListquery}
                      onClickClear={handleGetListClear}
                      cardData={
                        <>
                          <InfiniteScroll
                            style={{
                              textAlign: "center",
                              justifyContent: "center",
                            }}
                            dataLength={getListData.length}
                            next={fetchMoreGetListData}
                            hasMore={hasMoreGetList}
                            loader={
                              <BeatLoader
                                color={
                                  theme.palette.mode === "light"
                                    ? "black"
                                    : "white"
                                }
                              />
                            }
                            scrollableTarget="getListForCreateScroll"
                            endMessage={
                              <Typography textAlign={"center"}>
                                No More Records
                              </Typography>
                            }
                          >
                            {getListData.map((item, index) => (
                              <CardComponent
                                key={index}
                                title={item.DocNum}
                                // subtitle={item.CardName}
                                // description={item.Cellular}
                                searchResult={getListquery}
                                onClick={() => {
                                  onSelectSalesQuotation(item);
                                }}
                              />
                            ))}
                          </InfiniteScroll>
                        </>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocDueDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="VALID UNTIL"
                          name={field.name}
                          // value={dueDate}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) => setValue("DocDueDate", date)}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                                      <Controller
                                        name="CompanyName"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                          <InputTextField
                                            {...field}
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            label="COMPANY NAME"
                                           
                                          />
                                        )}
                                      /></Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                                              <Controller
                                                name="Address"
                                                control={control}
                                                render={({ field, fieldState: { error } }) => (
                                                  <InputTextField
                                                    label="BILL TO"
                                                    rows={3}
                                                    multiline
                                                    type="text"
                                                    readOnly={true}
                                                    {...field}
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    // InputProps={{
                                                    //   endAdornment: (
                                                    //     <InputAdornment position="top">
                                                    //       <IconButton
                                                    //         // onClick={DialogOpenPayto}
                                                    //         size="small"
                                                    //         style={{
                                                    //           backgroundColor: "green",
                                                    //           borderRadius: "10%",
                                                    //           color: "white",
                                                    //           padding: 1,
                                                    //           marginRight: -2,
                                                    //         }}
                                                    //       >
                                                    //         <ViewListIcon />
                                                    //       </IconButton>
                                                    //     </InputAdornment>
                                                    //   ),
                                                    // }}
                                                  />
                                                )}
                                              />
                                            </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Address2"
                      control={control}
                      rules={{ required: "this field is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          rows={3}
                          multiline
                          label="SHIP TO"
                          type="text"
                          {...field}
                          error={!!error}
                          readOnly={true}
                          helperText={error ? error.message : null}
                          // InputProps={{
                          //   endAdornment: (
                          //     <InputAdornment position="top">
                          //       <IconButton
                          //       //   onClick={DialogOpenCompany}
                          //         size="small"
                          //         style={{
                          //           backgroundColor: "green",
                          //           borderRadius: "10%",
                          //           color: "white",
                          //           padding: 1,
                          //           marginRight: -2,
                          //         }}
                          //       >
                          //         <ViewListIcon />
                          //       </IconButton>
                          //     </InputAdornment>
                          //   ),
                          // }}
                        />
                      )}
                    />
                  </Grid>
                   <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                                      <Controller
                                        name="CntctCode"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                          <InputTextField
                                            {...field}
                                            error={!!error}
                                            disabled
                                            helperText={error ? error.message : null}
                                            label="CONTACT PERSON"
                                           
                                          />
                                        )}
                                      />
                                    </Grid>
                                       <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                                                        <Controller
                                                          name="DelhiveryDate"
                                                          control={control}
                                                          rules={{ required: "Date is Required" }}
                                                          render={({ field, fieldState: { error } }) => (
                                                            <SelectedDatePickerField
                                                              label="DELIVERY DATE"
                                                              name={field.name}
                                                              value={field.value ? dayjs(field.value) : undefined}
                                                              // disabled={
                                                              //   allFormData.Status === "Closed" ||
                                                              //   allFormData.Status === "Cancelled"
                                                              // }
                                                              onChange={(newValue) => {
                                                                setValue("DelhiveryDate", newValue);
                                                              }}
                                                              error={!!error}
                                                              helperText={error ? error.message : null}
                                                            />
                                                          )}
                                                        />
                                                      </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  border={"1px solid silver"}
                  sx={{
                    flexGrow: 1,
                    marginTop: "15px",
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={SalesQuotationRFQRows}
                    columns={Items}
                    pageSize={5}
                    hideFooter
                    disableColumnMenu
                    disableColumnSelector
                    disableDensitySelector
                    getRowId={(row) => row.DocEntry} // important!
                    sx={{
                      height: "50vh",
                      "& .MuiDataGrid-virtualScroller": {
                        overflowY: "auto !important",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        position: "sticky",
                        top: 0,
                        backgroundColor: "white",
                        zIndex: 2,
                      },
                    }}
                  />
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              // md={12}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
              
              >
                {SaveUpdateName}
              </Button>
              {/* <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
