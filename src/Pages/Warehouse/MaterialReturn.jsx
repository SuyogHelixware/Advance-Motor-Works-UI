import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import { useMemo } from "react";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTableSelectField,
  InputTableTextField,
  InputTextField,
  InputTextSearchButton,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";

export default function IssueMaterial() {
  const initialFormData = {
    DocEntry: "",
    DocNum: "",
    RequestDate: dayjs(new Date()),
    IssueQuantity: "0",
    JobCardNo: "",
    RegistrationNo: "",
    InwardNo: "",
    VehInwardDocEntry: "",
    RequestNo: "",
    OrderNo: "",
    JobWorkAt: "",
    JobWorkDetails: "",
    TotalItems: "",
    RequestedBy: "",
    TechnicianName: "",
    // HW_WMSStaff: "",
    IssueNo: "",
    ReturnBy: "",
    IssuedBy: "",
    ReturnNo: "",
    oLines: [],
  };

  const { control, register, getValues, handleSubmit, reset, watch, setValue } =
    useForm({
      defaultValues: initialFormData,
    });

  const theme = useTheme();
  const { user } = useAuth();
  const [openPosts, setOpenPosts] = useState([]);
  const [openSearchPosts, setOpenSearchPosts] = useState([]);
  const [closeSearchPosts, setCloseSearchPosts] = useState([]);
  const [closedPosts, setClosedPosts] = useState([]);
  const [openPage, setOpenPage] = useState(0);
  const [closePage, setClosePage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [searchTextOpen, setSearchTextOpen] = useState("");
  const [searchTextClose, setSearchTextClose] = useState("");
  const [searchTextGetListForCreate, setsearchTextGetListForCreate] =
    useState("");
  const [getListData, setGetListData] = useState([]);
  const [getListSearchData, setGetListSearchData] = useState([]);
  const [hasMoreGetListForCreate, setHasMoreGetListForCreate] = useState(true);
  const [getListPage, setGetListPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [Disabled, setDisabled] = useState(false);
  const [barcodeItem, setBarcodeItem] = useState("");
  const [WMSStaff, setWMSStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [oLines, setoLines] = useState([]);

  useEffect(() => {
    getAllOpenList();
    getAllCloseList();
    getListForCreate();
    getHW_WMSStaffList();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const getAllOpenList = () => {
    apiClient
      .get(`/MatRtn?Page=0&Status=1`)
      .then((response) => {
        setOpenPosts(response.data.values);

        if (response.data.values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAllCloseList = async () => {
    try {
      const response = await apiClient.get(`/MatRtn?Page=0&Status=0`);

      setClosedPosts(response.data.values);

      if (response.data.values.length === 0) {
        setHasMoreClose(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMoreOpenListData = async () => {
    try {
      const page = openPage + 1;
      const trimmedSearch = searchTextOpen?.trim() || "";
      const cleanSearch = trimmedSearch
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      let response;

      if (cleanSearch === "") {
        response = await apiClient.get(`/MatRtn?Page=${page}&Status=1`);

        setOpenPosts((prev) => [...prev, ...response.data.values]);
      } else {
        response = await apiClient.get(
          `/MatRtn?SearchText=${cleanSearch}&Status=1&Page=${page}`,
        );

        setOpenSearchPosts((prev) => [...prev, ...response.data.values]);
      }

      setOpenPage(page);

      if (response.data.values.length === 0) {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error("Fetch Open List Error:", error);
    }
  };

  const onHandleSearchOpen = async (event) => {
    try {
      const rawValue = event.target.value || "";
      const cleanSearch = rawValue
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      setOpenSearchPosts([]);
      setSearchTextOpen(cleanSearch);
      setOpenPage(0);

      if (!cleanSearch) return;

      const response = await apiClient.get(
        `/MatRtn?SearchText=${cleanSearch}&Status=1&Page=0`,
      );

      setOpenSearchPosts(response.data.values);

      if (response.data.values.length < 20) {
        setHasMoreOpen(false);
      } else {
        setHasMoreOpen(true);
      }
    } catch (error) {
      console.error("Search Open Error:", error);
    }
  };

  const removeTableRow = (rowId) => {
    if (oLines.length === 1) {
      Swal.fire({
        text: "At least One Item Required",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } else {
      // const updatedOLines = [...oLines];
      // updatedOLines.splice(index, 1);
      // setoLines(updatedOLines);
      const updatedOLines = oLines.filter(
        (row) => row.id !== rowId && row.ItemCode !== rowId,
      );
      setoLines(updatedOLines);
    }
  };

  const onClickClearOpenSearch = () => {
    setSearchTextOpen("");
    setOpenSearchPosts([]);
    setOpenPosts([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    setTimeout(() => {
      getAllOpenList();
    }, 100);
  };

  const triggeronClickClearOpenSearchTwice = () => {
    onClickClearOpenSearch();
    setTimeout(() => {
      onClickClearOpenSearch();
    }, 10);
  };

  const getCloseSearchList = async (event) => {
    try {
      const rawValue = event.target.value || "";
      const cleanSearch = rawValue
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ");

      setCloseSearchPosts([]);
      setSearchTextClose(cleanSearch);
      setClosePage(0);

      if (!cleanSearch) return;

      const response = await apiClient.get(
        `/MatRtn?SearchText=${cleanSearch}&Status=0&Page=0`,
      );

      setCloseSearchPosts(response.data.values);

      if (response.data.values.length < 20) {
        setHasMoreClose(false);
      } else {
        setHasMoreClose(true);
      }
    } catch (error) {
      console.error("Close Search Error:", error);
    }
  };

  const fetchMoreCloseListData = () => {
    const page = closePage + 1;

    if (searchTextClose === "") {
      apiClient
        .get(`/MatRtn?Page=/${page}&Status=0`)
        .then((response) => {
          setClosedPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);

          setClosePage(page);

          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      apiClient
        .get(`/MatRtn?SearchText=${searchTextClose}&Status=0&Page=${page}`)
        .then((response) => {
          setCloseSearchPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);

          setClosePage(page);

          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onClickClearCloseSearch = () => {
    setSearchTextClose("");
    setCloseSearchPosts([]);
    setClosedPosts([]);
    setClosePage(0);
    setHasMoreClose(true);
    setTimeout(() => {
      getAllCloseList();
    }, 100);
  };

  const triggeronClickClearCloseSearchTwice = () => {
    onClickClearCloseSearch();
    setTimeout(() => {
      onClickClearCloseSearch();
    }, 10);
  };
  const fetchDataGetListForCreate = (url, setData, append = false) => {
    apiClient
      .get(url, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        const values = response.data.values;
        setData((prevData) => (append ? [...prevData, ...values] : values));
        if (values.length === 0 || values.length < 20)
          setHasMoreGetListForCreate(false);
      })
      .catch((error) => console.log(error));
  };

  const getListForCreate = () => {
    fetchDataGetListForCreate(`/MatRtn/CopyFrom?Page=0`, setGetListData);
  };
  const fetchMoreGetListForCreate = () => {
    const page = getListPage + 1;

    const url = searchTextGetListForCreate
      ? `/MatRtn/CopyFrom?SearchText=${searchTextGetListForCreate}&Page=${page}`
      : `/MatRtn/CopyFrom?Page=${page}`;

    fetchDataGetListForCreate(
      url,
      searchTextGetListForCreate ? setGetListSearchData : setGetListData,
      true,
    );

    setGetListPage(page);
  };

  useEffect(() => {
    if (isDialogOpen === true) {
      getListForCreate(0);
    }
  }, [isDialogOpen]);

  const onHandleSearchGetListForCreate = (event) => {
    const searchText = event.target.value;
    setGetListSearchData([]);
    setsearchTextGetListForCreate(searchText);
    setGetListPage(0);
    if (searchText) {
      fetchDataGetListForCreate(
        `/MatRtn/CopyFrom?SearchText=${searchText}&Page=0`,
        setGetListSearchData,
      );
    }
  };
  const onClickClearGetListCreateSearch = () => {
    setsearchTextGetListForCreate("");
    setGetListSearchData([]);
    setGetListData([]);
    setGetListPage(0);
    getListForCreate();
  };

  const triggerClearSearchTwice = () => {
    onClickClearGetListCreateSearch();
    setTimeout(() => {
      onClickClearGetListCreateSearch();
    }, 10);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    setsearchTextGetListForCreate([]);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setsearchTextGetListForCreate([]);
  };

  const handleCardClick = () => {
    setDisabled(true);
  };

  const handleClick = () => {
    setDisabled(false);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const setOldOpenListData = async (DocEntry) => {
    setLoading(true);

    try {
      const res = await apiClient.get(`/MatRtn/${DocEntry}`);
      const data = res.data.values;

      if (!data) {
        Swal.fire({
          icon: "warning",
          text: "Record not found",
        });
        return;
      }

      if (res.data.success) {
        const transformed = {
          ...data,

          JobCardNo: "",
          SONo: data.OrderNo,
          IssueDate: dayjs(data.IssueDate),
          ReturnNo: data.DocNum,
          RequestNo: data.RequestNo,
          ReturnDate: dayjs(data.ReturnDate),
          IssueNo: data.IssueNo,
          JobWorkAt: data.JobWorkAt,
          ReturnBy: data.ReturnedBy,
          InventoryTransferNumber: data.InventoryTransferNumber,
          IssuedBy: data.IssuedBy,
          IssueDocEntry: data.IssueDocEntry,
          SAPDocNum: data.SAPDocNum,
          SAPDocEntry: data.SAPDocEntry,
          HW_WMSStaff: data.HW_WMSStaff,
        };
        const mappedOLines =
          data.oLines.map((line) => ({
            ItemCode: line.ItemCode,
            ItemName: line.ItemName,
            FromWHS: line.FromWHS,
            ToWHS: line.ToWHS,
            ToBin: line.ToBin,
            AvailQty: Number(line.InHandQuantity).toFixed(2),
            IssueQuantity: Number(line.IssueQuantity).toFixed(2),
            ReturnQuantity: line.ReturnQuantity,
            BinList: [{ BinCode: line.ToBin }],
          })) || [];

        reset(transformed);
        setValue("DocNum", data.DocNum);
        setoLines(mappedOLines);
        getHW_WMSStaffList(transformed.HW_WMSStaff);
        // CloseMatIssueModal();
        // getHW_WMSStaffList(transformed.HW_WMSStaff);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const ClearForm = () => {
    reset(initialFormData);
    setoLines([]);
    handleClick();
  };

  const onChangeTableData = (event, index) => {
    const { value, name } = event.target;

    console.log("Row index:", index);
    console.log("Selected value:", value);

    setoLines((prevLines) => {
      const updatedLines = [...prevLines];
      updatedLines[index] = {
        ...updatedLines[index],
        [name]: value,
      };
      return updatedLines;
    });
  };

  const handleBarcodeChange = (event) => {
    const value = event.target.value?.trim();
    setBarcodeItem(value);
    if (!value) return;

    let itemFound = false;

    const updatedItems = oLines.map((item) => {
      const formRows = structuredClone(getValues("oLines") || []);
      const itemCode = String(item.ItemCode || "").toUpperCase();
      const enteredCode = String(value).toUpperCase();

      if (itemCode === enteredCode) {
        itemFound = true;

        const maxReturnQty = parseFloat(item.IssueQuantity) || 0;
        const currentReturnQty = parseFloat(item.ReturnQuantity) || 0;

        if (currentReturnQty < maxReturnQty) {
          const newReturnQty = currentReturnQty + 1;

          const updatedFormRows = [...formRows];
          updatedFormRows[itemCode] = {
            ...updatedFormRows[itemCode],
            ReturnQuantity: newReturnQty,
          };
          setoLines(updatedFormRows, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          Swal.fire({
            text: "You can't return more than the issued quantity",
            icon: "warning",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          return item;
        }

        return {
          ...item,
          ReturnQuantity: maxReturnQty.toFixed(3),
        };
      }

      return item;
    });

    setoLines(updatedItems);
    setTimeout(() => {
      setBarcodeItem("");
    }, 300);
  };

  const getHW_WMSStaffList = () => {
    apiClient
      .get(`/Technician?HW_WMSStaff=Y`)
      .then((response) => {
        setWMSStaff(response.data.values);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const columns = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const copyText = (e) => {
          e.stopPropagation();

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(params.value)
              .then(() => {
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "success",
                  title: "Item Code Copied",
                  showConfirmButton: false,
                  timer: 1200,
                });
              })
              .catch((err) => {
                console.error("Failed to copy: ", err);
              });
          } else {
            // fallback for unsupported browsers
            const textArea = document.createElement("textarea");
            textArea.value = params.value;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand("copy");
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Item Code Copied",
                showConfirmButton: false,
                timer: 1200,
              });
            } catch (err) {
              console.error("Fallback: copy failed", err);
            }
            document.body.removeChild(textArea);
          }
        };

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={copyText}
          >
            <Typography variant="body2">{params.value}</Typography>

            <Tooltip title="Copy Item Code">
              <IconButton size="small" onClick={copyText}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      minWidth: 390,
    },
    {
      field: "FromWHS",
      headerName: "From WHS",
      width: 100,
      type: "number",
    },
    {
      field: "ToWHS",
      headerName: "TO WHS",
      width: 100,
      type: "number",
    },
    {
      field: "ToBin",
      headerName: "TO BIN",
      width: 140,
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title={params.row.ToBin} arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <InputTableSelectField
              name="ToBin"
              value={params.row.ToBin}
              onChange={(e) => onChangeTableData(e, params.id)}
              data={(Array.isArray(params.row.BinList)
                ? params.row.BinList
                : []
              ).map((BinLocation) => ({
                key: BinLocation.BinCode,
                value: BinLocation.BinCode,
              }))}
              readOnly={Disabled}
            />
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "AvailQty",
      headerName: "IN-HAND QTY",
      width: 130,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span>{Number(params.value).toFixed(0) || ""} </span>
      ),
    },
    {
      field: "IssueQuantity",
      headerName: "ISS QTY",
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span> {Number(params.value).toFixed(0) || ""} </span>
      ),
    },
    {
      field: "ReturnQuantity",
      headerName: "RTN QTY",
      width: 120,
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <InputTableTextField
            value={Number(params.value || 0).toFixed(0)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={(e) => clareissueqty(e, params.row.ItemCode)}
                  disabled={Disabled}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            }
          />
        );
      },
    },
    {
      field: "Action",
      headerName: "Action",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          onClick={() => {
            removeTableRow(params.row.ItemCode);
          }}
          disabled={Disabled}
        >
          <RemoveCircleIcon sx={{ color: "red" }} />
        </IconButton>
      ),
    },
  ];

  const clareissueqty = (event, itemCode) => {
    event.stopPropagation(); // Prevents row click events from firing

    Swal.fire({
      text: "Do you want to clear Return Quantity?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setoLines((prevLines) =>
          prevLines.map((line) =>
            line.ItemCode === itemCode ? { ...line, ReturnQuantity: 0 } : line,
          ),
        );
      }
    });
  };

  const handleSubmitForm = async (data) => {
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");

    const payload = {
      UserId: UserId,
      CreatedBy: CreatedBy,
      ReturnNo: data.ReturnNo,
      ReturnDate: dayjs(data.ReturnDate).format("YYYY-MM-DD"),
      OrderNo: data.SONo,
      JobCardNo: "",
      ReturnRemarks: data.JobWorkAt,
      IssueNo: data.IssueNo,
      IssueDate: dayjs(data.IssueDate).format("YYYY-MM-DD"),
      RequestNo: data.RequestNo,
      JobWorkAt: data.JobWorkAt,
      ReturnedBy: CreatedBy,
      IssuedBy: data.IssuedBy,
      HW_WMSStaff: String(data.HW_WMSStaff),
      OrderDocEntry: data.OrderDocEntry,
      RequestDocEntry: data.RequestDocEntry,
      IssueDocEntry: data.IssueDocEntry,
      InvTransferNo: "",
      SAPDocNum: data.SAPDocNum.toString() || "",
      SAPDocEntry: data.SAPDocEntry.toString() || "",
      oLines: data.oLines.map((element) => ({
        UserId: UserId,
        CreatedBy: CreatedBy,
        Quantity: String(element.ReturnQuantity),
        IssueNo: data.IssueNo,
        ReturnNo: data.ReturnNo,
        ItemCode: element.ItemCode,
        ItemName: element.ItemName,
        FromWHS: element.FromWHS,
        ToBin: element.FromBin || "",
        ToWHS: element.ToWHS,
        IssueQuantity: element.IssueQuantity,
        InHandQuantity: element.AvailQty,
        ReturnQuantity: String(element.ReturnQuantity),
        IssueLineRemarks: "",
        ReturnLineRemarks: "",
      })),
    };

    const watchOlines = watch("oLines");

    if (!watchOlines || watchOlines.length === 0) {
      Swal.fire({
        text: "At least One Item Required",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const MaterialData = getValues();
    console.log(MaterialData);

    if (MaterialData.RequestNo === "" || MaterialData.RequestNo === undefined) {
      Swal.fire({
        text: "Please select order...",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    var returnQty = MaterialData.oLines.filter(
      (line) => line.IssueQuantity === 0,
    ).length;

    const bin = MaterialData.oLines.filter(
      (line) =>
        line.ToBin === undefined || line.ToBin === null || line.ToBin === "",
    ).length;

    if (returnQty > 0) {
      Swal.fire({
        text: "Return Quantity cannot be zero",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    } else if (bin > 0) {
      Swal.fire({
        text: "Please select bin locations for all items..",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    } else if (!watch("TechnicianName")) {
      Swal.fire({
        // title: "Warning !",
        text: "Please select Parts Picked by...",
        icon: "warning",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    console.log(payload);
    return;

    setLoading(true);

    try {
      const response = await apiClient.post(`/MatIssue`, payload);

      if (response.data.success) {
        setLoading(false);
        Swal.fire({
          title: "Success!",
          text: "Material Issued Successfully",
          icon: "success",
          timer: 1000,
        });

        getAllOpenList();
        getAllCloseList();
        ClearForm();
      } else {
        setLoading(false);
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        icon: "warning",
      });
    }
  };

  const onSelectRequest = (selectedItem) => {
    const filledValues = {
      ...initialFormData,
      ...selectedItem,
      JobCardNo: "",
      SONo: selectedItem.OrderNo,
      RequestDate: selectedItem.RequestDate,
      RequestNo: selectedItem.RequestNo,
      RegistrationNo: selectedItem.RegistrationNo,
      JobWorkAt: selectedItem.JobWorkAt,
      JobWorkDetails: selectedItem.ReqRemarks,
      InwardNo: selectedItem.VehInwardNo,
      IssueNo: selectedItem.DocNum,
      IssuedBy: selectedItem.IssuedBy,
      HW_WMSStaff: selectedItem.HW_WMSStaff,
      OrderDocEntry: selectedItem.OrderDocEntry,
      RequestDocEntry: selectedItem.RequestDocEntry,
      IssueDocEntry: selectedItem.DocEntry,
      ReturnDate: dayjs(selectedItem.ReturnDate).format("YYYY-MM-DD"),
      ReturnBy: selectedItem.CreatedBy,
    };
    const mappedOLines =
      selectedItem.oLines?.map((line) => ({
        ItemCode: line.ItemCode,
        ItemName: line.ItemName,
        FromWHS: line.ToWHS,
        FromBin: line.BinLocation,
        ToWHS: line.FromWHS,
        AvailQty: Number(line.AvailQty).toFixed(2),
        ReqQuantity: line.ReqQuantity,
        OpenQuantity: line.OpenQuantity,
        IssueQuantity: Number(line.IssueQuantity).toFixed(2) || 0,
        ReturnQuantity: 0,
        ToBin: line.BinLocation,
        BinList: line.BinList,
      })) || [];
    reset(filledValues);
    setoLines(mappedOLines);
    getHW_WMSStaffList(filledValues.HW_WMSStaff);
    setIsDialogOpen(false);
  };

  const sidebarContent = (
    <>
      <Grid
        item
        width={"100%"}
        py={0.5}
        alignItems={"center"}
        border={"1px solid silver"}
        borderBottom={"none"}
        position={"relative"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          Return Material Documents
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "absolute",
            right: "10px",
            top: "0px",
            display: { lg: "none", xs: "block" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid
        container
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid
          item
          md={12}
          sm={12}
          width={"100%"}
          height={`calc(100% - ${50}px)`}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="0" label="Open" />
                <Tab value="1" label="Closed" />
              </Tabs>

              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScroll"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={onHandleSearchOpen}
                    value={searchTextOpen}
                    onClickClear={triggeronClickClearOpenSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={
                    searchTextOpen === ""
                      ? openPosts?.length || 0
                      : openSearchPosts?.length || 0
                  }
                  next={fetchMoreOpenListData}
                  hasMore={hasMoreOpen}
                  loader={
                    <BeatLoader
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "#F5F6FA"
                            : "#080D2B",
                      }}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {(openSearchPosts && openSearchPosts.length > 0
                    ? openSearchPosts
                    : openPosts || []
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.IssueNo}
                      subtitle={item.OrderNo}
                      description={item.DocNum}
                      onClick={() => {
                        setOldOpenListData(item.DocEntry);
                        handleCardClick(true);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={getCloseSearchList}
                    value={searchTextClose}
                    onClickClear={triggeronClickClearCloseSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextClose === ""
                      ? closedPosts?.length || 0
                      : closeSearchPosts?.length || 0
                  }
                  next={fetchMoreCloseListData}
                  hasMore={hasMoreClose}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {(closeSearchPosts && closeSearchPosts.length > 0
                    ? closeSearchPosts
                    : closedPosts || []
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.IssueNo}
                      subtitle={item.OrderNo}
                      description={item.DocNum}
                      onClick={() => {
                        setOldOpenListData(item.DocEntry);
                        handleCardClick(true);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  //print hardcoded
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Loader open={loading} />
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          height="100%"
          sm={12}
          md={6}
          lg={3}
          className="sidebar"
          sx={{
            position: { lg: "relative", xs: "absolute" },
            top: 0,
            left: 0,
            transition: "left 0.3s ease",
            zIndex: 1000,
            display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
          // onClick={handleSubmitForm}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              display: {
                lg: "none",
              },
              position: "absolute",
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
            sx={{
              display: {},
              position: "absolute",
              right: "10px",
            }}
          >
            <AddIcon />
          </IconButton>

          <Grid
            item
            width="100%"
            py={0.5}
            alignItems="center"
            border="1px solid silver"
            borderBottom="none"
          >
            <Typography textAlign="center" alignContent="center" height="100%">
              Return Material
            </Typography>
          </Grid>

          <Grid
            container
            item
            width="100%"
            height="100%"
            border="1px silver solid"
          >
            <Grid
              container
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow="scroll"
              sx={{ overflowX: "hidden" }}
              position="relative"
              textTransform={"uppercase"}
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
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="RequestNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextSearchButton
                              label="Request NO"
                              type="text"
                              onClick={() => {
                                openDialog();
                              }}
                              onChange={openDialog}
                              readOnly={true}
                              disabled={Disabled}
                              {...field}
                            />
                          )}
                        />

                        <SearchModel
                          open={isDialogOpen}
                          onClose={handleCloseDialog}
                          title="Select Issue Material"
                          onChange={onHandleSearchGetListForCreate}
                          value={searchTextGetListForCreate}
                          onClickClear={triggerClearSearchTwice}
                          cardData={
                            <>
                              <InfiniteScroll
                                style={{ textAlign: "center" }}
                                dataLength={
                                  searchTextGetListForCreate === ""
                                    ? getListData?.length || 0
                                    : getListSearchData?.length || 0
                                }
                                next={fetchMoreGetListForCreate}
                                hasMore={hasMoreGetListForCreate}
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
                                {(getListSearchData &&
                                getListSearchData.length > 0
                                  ? getListSearchData
                                  : getListData || []
                                ).map((item) => (
                                  <CardComponent
                                    key={item.DocNum}
                                    title={
                                      item.DocNum +
                                      " " +
                                      (item.OrderNo ? "| " + item.OrderNo : "")
                                    }
                                    subtitle={item.PhoneNumber1}
                                    description={item.CardName}
                                    onClick={() => {
                                      onSelectRequest(item);
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </>
                          }
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="IssueDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              readOnly={true}
                              label="REQUEST DATE"
                              name={field.name}
                              value={
                                field.value ? dayjs(field.value) : undefined
                              }
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="ReturnNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="RETURN No"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="OrderNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="SO NO"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="ReturnDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              readOnly={true}
                              label="RETURN DATE"
                              name={field.name}
                              value={
                                field.value ? dayjs(field.value) : undefined
                              }
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="IssueNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Issue No"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="JobWorkAt"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Job Work At"
                              type="text"
                              {...register("JobWorkAt")}
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  container
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    mt: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Scan Barcode"
                    autoFocus
                    value={barcodeItem}
                    onChange={handleBarcodeChange}
                    disabled={!watch("RequestNo") || Disabled}
                  />
                </Grid>

                <Grid
                  container
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    maxHeight: 400,
                    minHeight: 150,
                    mt: "5px",
                    pl: 1,
                    pr: 1,
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={oLines}
                    getRowId={(row) => row.ItemCode}
                    columns={columns}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    hideFooter
                    disableRowSelectionOnClick
                    autoHeight="false"
                    sx={gridSx}
                  />
                </Grid>

                <Grid container item mt={1} spacing={2} marginTop={3}>
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="ReturnBy"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="RETURN BY"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="IssuedBy"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="ISSUE BY"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="HW_WMSStaff"
                          control={control}
                          rules={{
                            required: "Parts Picked By is required",
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              label="PARTS PICKED BY"
                              data={(WMSStaff || []).map((item) => ({
                                key: item.DocEntry,
                                value: item.TechnicianName,
                              }))}
                              readOnly={Disabled}
                              {...field}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
              }}
            >
              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={Disabled}
              >
                {Disabled ? "Save" : "Save"}
              </Button>
              <Button onClick={handlePrint} variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
