import AddIcon from "@mui/icons-material/Add";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import DownloadIcon from "@mui/icons-material/Download";
import MenuIcon from "@mui/icons-material/Menu";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import axios from "axios";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext } from "@mui/lab";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import Papa from "papaparse";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";

import SearchIcon from "@mui/icons-material/Search";
import { debounce } from "lodash";
import {
  InputSelectTextField,
  SelectedDatePickerField,
  SelectedYearPickerField,
} from "../Components/formComponents";

import { useGridApiRef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../../services/apiClient";
import {
  clearAllCache,
  fetchExchangeRateStore,
} from "../../slices/exchangeRateSlice";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { Loader } from "../Components/Loader";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export default function ExchangeRate() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const [value, setval] = React.useState("0");
  const [OrignCurrData, setOrignCurrData] = useState([]);
  const [currencyColumns, setCurrencyColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [savedRates, setSavedRates] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialLoaded = useRef(false);
  const { companyData } = useAuth();

  const [originalRows, setOriginalRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [CurrencyList, setCurrencyList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cpValues, setCpValues] = useState(
    months.map((month, index) => ({ id: index, month, cp: "" })),
  );
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const apiRef = useGridApiRef();
  const indexapiRef = useGridApiRef();
  const selectionApiRef = useGridApiRef();

  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);

    //   const rowIndex = getValues("oLines").findIndex(
    //   (r) => r.id === params.id
    // )
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const indexhandleCellKeyDown = (params, event) => {
    const api = indexapiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);

    //   const rowIndex = getValues("oLines").findIndex(
    //   (r) => r.id === params.id
    // )
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const localCurrency = companyData?.MainCurncy;
  const handleClickOpen = () => setOpen(true);
  const closeModel = () => setOpen(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleChange = (event, newValue) => setval(newValue);
  const clearFormData = () => {
    // Clear only 'rate' in CurrencyList
    setCurrencyList((prev) =>
      prev.map((row) => ({
        CurrName: row.CurrName,
        CurrCode: row.CurrCode,
        rate: "", // Only reset rate
      })),
    );

    // Clear only 'rate' in selectedRows
    setSelectedRows((prev) =>
      prev.map((row) => ({
        CurrName: row.CurrName,
        CurrCode: row.CurrCode,
        rate: "",
      })),
    );

    fetchCPValues(selectedYear);
    handleMonthYearChange(watchedMonth, watchedYear);
  };
  const tabData = [
    { label: "Exchange Rates", icon: <CurrencyExchangeIcon /> },
    { label: "Indexes", icon: <ShowChartIcon /> },
  ];
  const selectionHandleCellKeyDown = (params, event) => {
    const api = selectionApiRef.current;
    if (!api) return;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);

    let nextRow = rowIndex;
    let nextCol = colIndex;

    /* ======================================================
     ✅ ENTER ON CHECKBOX (MULTI SELECT SUPPORT)
     ====================================================== */
    if (params.field === "__check__" && event.key === "Enter") {
      event.preventDefault();

      const isSelected = api.isRowSelected(params.id);

      // SHIFT → range selection
      if (event.shiftKey) {
        const lastFocused = api.getState().focus.cell?.id;
        if (lastFocused) {
          const start = rowIds.indexOf(lastFocused);
          const end = rowIndex;

          const [from, to] = start < end ? [start, end] : [end, start];

          rowIds.slice(from, to + 1).forEach((id) => {
            api.selectRow(id, true, false);
          });
        }
        return;
      }

      // CTRL / CMD → toggle without clearing others
      api.selectRow(params.id, !isSelected, false);
      return;
    }

    /* ======================================================
     ❗ Prevent default only for TAB / ENTER
     ====================================================== */
    if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
    }

    /* ======================================================
     🔁 Navigation logic
     ====================================================== */
    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? colIndex - 1 : colIndex + 1;
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        break;

      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;

      case "ArrowUp":
        nextRow--;
        break;

      case "ArrowRight":
        nextCol++;
        break;

      case "ArrowLeft":
        nextCol--;
        break;
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    ) {
      return;
    }

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
    api.setCellFocus(nextId, nextField);
  };

  //=======================================Import Export Functionality=============================
  const handleExportCsv = () => {
    if (!rows || rows.length === 0 || !currencyColumns) {
      Swal.fire({
        title: "No Data to Export",
        text: "There are no exchange rates to export for the selected period.",
        icon: "info",
        confirmButtonText: "Ok",
      });
      return;
    }

    const headers = [
      "Date",
      ...currencyColumns
        .filter((col) => col.field !== "date")
        .map((col) => col.headerName),
    ];

    const csvRows = [
      headers.join(","), // header line
      ...rows.map((row) => {
        // Format full date using month and year
        const day = String(row.date).padStart(2, "0");
        const month = String(watchedMonth).padStart(2, "0");
        const year = watchedYear;
        const formattedDate = `${month}/${day}/${year}`;

        const rowData = [formattedDate]; // use full date now
        currencyColumns.forEach((col) => {
          if (col.field !== "date") {
            rowData.push(row[col.field] ?? ""); // preserve empty cells
          }
        });
        return rowData.join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `CurrencyRates_${watchedMonth}_${watchedYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsvImport = (file, setRows, month, year) => {
    if (!file) {
      // This case is usually handled by the input.click() not returning a file
      return;
    }

    // Detect delimiter if txt, default comma
    const isTxt = file.name.endsWith(".txt");
    const delimiter = isTxt ? "\t" : ","; // assuming tab-delimited txt

    let skippedRowsCount = 0;
    const invalidDateRows = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter, // dynamic delimiter
      complete: (results) => {
        const csvData = results.data;
        setRows((prevRows) =>
          prevRows.map((row) => {
            const updatedRow = { ...row };

            // Find matching CSV/TXT row
            const csvRow = csvData.find((c) => {
              const dateVal = c.Date || c.date;
              if (!dateVal) {
                // If no date value, we can't match, so skip this CSV row for this comparison
                return false;
              }

              // Parse strictly as DD-MM-YYYY (dash separator)
              const parsed = dayjs(dateVal, "DD-MM-YYYY", true);
              if (!parsed.isValid()) {
                // Collect invalid date rows for feedback
                invalidDateRows.push(dateVal);
                return false;
              }

              // Compare normalized date
              return parsed.format("YYYY-MM-DD") === row.fullDate;
            });

            if (!csvRow) {
              // If no matching CSV row, keep API values, but don't count as skipped for invalid date
              return updatedRow;
            }

            let rowUpdated = false;
            // Apply CSV/TXT rates (keep DocEntry from API)
            Object.entries(csvRow).forEach(([key, val]) => {
              if (/^[A-Z]{3}$/.test(key)) {
                // Check if key looks like a currency code (e.g., USD, EUR)
                const newVal = parseFloat(val);
                if (!isNaN(newVal)) {
                  updatedRow[key] = newVal;
                  rowUpdated = true;
                } else if (val === "") {
                  // Allow clearing rates
                  updatedRow[key] = "";
                  rowUpdated = true;
                }
              }
            });

            if (!rowUpdated) {
              skippedRowsCount++; // Count rows from CSV that didn't update any currency rates
            }

            return updatedRow;
          }),
        );

        // Provide feedback after parsing
        let feedbackMessage = "CSV import completed.";
        let feedbackIcon = "success";

        if (invalidDateRows.length > 0) {
          feedbackMessage += ` Some rows were skipped due to invalid date formats: ${[
            ...new Set(invalidDateRows),
          ].join(", ")}.`;
          feedbackIcon = "warning";
        }
        if (skippedRowsCount > 0) {
          feedbackMessage += ` ${skippedRowsCount} rows from the CSV did not match existing dates or contained no valid currency rates.`;
          feedbackIcon = feedbackIcon === "success" ? "info" : "warning"; // Elevate to warning if other issues exist
        }

        Swal.fire({
          title: "Import Status",
          text: feedbackMessage,
          icon: feedbackIcon,
          confirmButtonText: "Ok",
        });
      },
      error: (err) => {
        Swal.fire({
          title: "Import Error!",
          text: `Failed to parse CSV/TXT file: ${err.message}. Please check the file format.`,
          icon: "error",
          confirmButtonText: "Ok",
        });
      },
    });
  };
  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);
  //==================================Modal Functionalities=======================================
  const handleModalSubmit = () => {
    if (!fromDate || !toDate) {
      Swal.fire({
        title: "Missing Dates!",
        text: "Please select both 'From Date' and 'To Date' before setting rates.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const monthKey = `${dayjs(fromDate).format("YYYY-MM")}`;

    const updatedRates = selectedRows.reduce((acc, row) => {
      if (row.rate && row.rate !== "") {
        acc[row.CurrCode] = row.rate;
      }
      return acc;
    }, {});

    if (Object.keys(updatedRates).length === 0) {
      Swal.fire({
        title: "No Rates Entered",
        text: "Please enter rates for selected currencies before saving.",
        icon: "info",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Save rates
    setSavedRates((prev) => {
      const newSavedRates = {
        ...prev,
        [monthKey]: {
          ...(prev[monthKey] || {}),
          ...updatedRates,
        },
      };
      return newSavedRates;
    });

    // Update main DataGrid rows
    setRows((prevRows) => {
      const newRows = prevRows.map((row) => {
        const newRow = { ...row };
        // Only apply rates if the row's date is within the modal's fromDate and toDate range
        const rowDate = dayjs(
          `${watchedYear}-${String(watchedMonth).padStart(2, "0")}-${String(
            row.date,
          ).padStart(2, "0")}`,
        );

        if (
          rowDate.isSameOrAfter(fromDate, "day") &&
          rowDate.isSameOrBefore(toDate, "day")
        ) {
          Object.keys(updatedRates).forEach((code) => {
            newRow[code] = updatedRates[code];
          });
        }

        return newRow;
      });
      return newRows;
    });

    setCurrencyList((prev) => prev.map((row) => ({ ...row, rate: "" })));
    setSelectedRows([]);
    closeModel();
    Swal.fire({
      title: "Rates Applied!",
      text: "Selected rates have been applied to the main grid.",
      icon: "success",
      confirmButtonText: "Ok",
      timer: 1500,
    });
  };
  const debouncedFetch = useCallback(
    debounce((search) => {
      CurrencyDataList({ page: 0, search });
    }, 500),
    [],
  );
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedFetch(value); // call API with debounce
  };
  const gridRows = CurrencyList.filter((row) => row.CurrCode !== localCurrency);

  const CurrencyColumn = [
    {
      field: "CurrName",
      headerName: "CURRENCY",
      width: 150,
      editable: false,
    },
    {
      field: "CurrCode",
      headerName: "CURRENCY CODE",
      width: 150,
      editable: false,
    },
    {
      field: "Rate",
      headerName: "RATE",
      width: 150,
      type: "number",
      sortable: false,
      editable: true,
      headerAlign: "center",
      align: "center",

      // 🔒 edit only when row is selected
      isCellEditable: (params) =>
        selectedRows.some((row) => row.CurrCode === params.row.CurrCode),

      // display mode
      renderCell: ({ value }) =>
        value == null || value === "" ? "" : Number(value).toFixed(4),

      // validation (no state updates here)
      preProcessEditCellProps: (params) => {
        const value = params.props.value;
        const isValid =
          value === "" ||
          value === null ||
          (!isNaN(value) && Number(value) >= 0);

        if (!isValid) {
          Swal.fire({
            title: "Invalid Input",
            text: "Please enter a valid positive number for the rate.",
            icon: "warning",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        }

        return {
          ...params.props,
          error: !isValid,
        };
      },
    },
  ];

  const CurrencyDataList = async ({ page = 0, search = "" }) => {
    try {
      setLoading(true);

      const url = search
        ? `/CurrenciesV2/Search/${search}/1/${page}/100`
        : `/CurrenciesV2/Pages/1/${page}/100`;

      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const items = data?.values || [];

        const validCurrencies = items.filter((curr) => Boolean(curr.CurrCode));

        setCurrencyList(validCurrencies);

        // Update row count for pagination
        if (validCurrencies.length < 20) {
          setRowCount(page * 20 + validCurrencies.length);
        } else if (page === 0) {
          setRowCount(1000); // or a large estimate
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // ============================================useForm====================================
  const today = dayjs();
  const initial = {
    Year: today.format("YYYY"),
    Month: today.format("MM"),
    // Year: "",
    // Month: "",
    IndexesYear: today.format("YYYY"),
  };

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: initial,
  });
  const watchedMonth = useWatch({ control, name: "Month" });
  const watchedYear = useWatch({ control, name: "Year" });
  const selectedYear = watch("IndexesYear");

  //========================================Indexes Tab====================================
  const handleCPRowUpdate = React.useCallback((newRow) => {
    setCpValues((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
    return newRow;
  }, []);

  const columns = [
    {
      field: "month",
      headerName: selectedYear || "Year",
      width: 150,
      editable: false,
    },
    {
      field: "cp",
      headerName: "CP",
      width: 350,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",

      // display mode
      renderCell: ({ value }) =>
        value == null || value === "" ? "" : Number(value).toFixed(2),

      // validation while editing
      preProcessEditCellProps: (params) => {
        const value = params.props.value;
        const isValid =
          value === "" ||
          value === null ||
          (!isNaN(value) && Number(value) >= 0);

        if (!isValid) {
          Swal.fire({
            title: "Invalid Input",
            text: "Please enter a valid positive number for the CP value.",
            icon: "warning",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        }

        return {
          ...params.props,
          error: !isValid,
        };
      },
    },
  ];

  const fetchCPValues = async (year) => {
    try {
      setLoading(true);
      const rateDate = dayjs(`${year}-01-01`).format("MM/DD/YY");
      const res = await apiClient.get(`/ExchangeRatesandIndexes`, {
        params: {
          Limit: 20,
          RateDate: rateDate,
          IsIndexes: true,
        },
      });

      if (res.data.success && Array.isArray(res.data.values)) {
        const values = res.data.values;

        setCpValues((prev) =>
          prev.map((row, index) => {
            // find matching record by Year + Month
            const match = values.find(
              (item) =>
                item.Currency === "CP" &&
                dayjs(item.RateDate).year() === Number(year) &&
                dayjs(item.RateDate).month() === index, // row index = month index
            );

            return match
              ? { ...row, cp: match.Rate, DocEntry: match.DocEntry }
              : { ...row, cp: "", DocEntry: "" };
          }),
        );
      }
       else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire("Error", error || "Failed to fetch CP values", "error");
    } finally {
      setLoading(false);
    }
  };

  //==========================================Exchange Rate Tab============================
const CurrencyData = async () => {
  try {
    setLoading(true);

    const res = await apiClient.get(`/CurrenciesV2/all`);

    if (res?.data?.success) {
      const response = res.data.values || [];
      setOrignCurrData(response);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: res?.data?.message || "Failed to fetch Currency data.",
      });
    }
  } catch (error) {
    console.error("Currency fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        "Something went wrong while fetching Currency data.",
    });
  } finally {
    setLoading(false);
  }
};

  const generateMonthDays = (month, year) => {
    const dayCount = dayjs(`${year}-${month}-01`).daysInMonth();
    const days = Array.from({ length: dayCount }, (_, i) => ({
      id: i + 1,
      date: i + 1,
    }));
    return days;
  };

  const buildCurrencyColumns = (
    currencyData,
    monthLabel,
    days,
    month,
    year,
    localCurrency,
  ) => {
    // 1️⃣ valid currencies (exclude local)
    const validCurrencies = currencyData
      .map((curr) => curr.CurrCode)
      .filter(Boolean)
      .filter((curr) => curr !== localCurrency);

    // 2️⃣ columns (NO inputs, NO state updates)
    const columns = [
      {
        field: "date",
        headerName: monthLabel,
        width: 130,
        headerAlign: "center",
        align: "center",
      },

      ...validCurrencies.map((currency) => ({
        field: currency,
        headerName: currency,
        width: 120,
        type: "number",
        editable: true,
        headerAlign: "center",
        align: "center",

        // display mode (same style as Items grid)
        renderCell: ({ value }) =>
          value == null || value === "" ? "" : Number(value).toFixed(4),

        // validation while editing
        preProcessEditCellProps: (params) => {
          const value = params.props.value;
          const isValid = value === "" || value === null || !isNaN(value);

          return {
            ...params.props,
            error: !isValid,
          };
        },
      })),
    ];

    // 3️⃣ build rows ONCE (stable ids)
    const monthKey = `${year}-${month}`;
    const monthRates = savedRates[monthKey] || {};

    const rows = days.map((day) => {
      const rowId = `${year}-${month}-${day.date}`;

      const row = {
        id: rowId,
        ...day,
      };

      validCurrencies.forEach((code) => {
        row[code] = monthRates?.[code] ?? "";
      });

      return row;
    });

    // 4️⃣ single state updates
    setCurrencyColumns(columns);
    setRows(rows);
  };

  const monthOptions = [
    { key: "01", value: "January" },
    { key: "02", value: "February" },
    { key: "03", value: "March" },
    { key: "04", value: "April" },
    { key: "05", value: "May" },
    { key: "06", value: "June" },
    { key: "07", value: "July" },
    { key: "08", value: "August" },
    { key: "09", value: "September" },
    { key: "10", value: "October" },
    { key: "11", value: "November" },
    { key: "12", value: "December" },
  ];

  const handleMonthYearChangeWithConfirm = async (newMonth, newYear) => {
    let proceed = false;

    const hasUnsaved = rows.some((row, idx) =>
      currencyColumns.some((col) => {
        if (
          col.field === "id" ||
          col.field === "date" ||
          col.field.endsWith("_DocEntry")
        )
          return false;
        const currentVal = row[col.field] ?? "";
        const originalVal = originalRows[idx]?.[col.field] ?? "";
        return currentVal !== originalVal;
      }),
    );

    if (hasUnsaved) {
      const result = await Swal.fire({
        title: "You have unsaved changes",
        text: "Do you want to save before switching month/year?",
        icon: "warning",
        showCancelButton: false,
        showDenyButton: true, // 👈 show "No"
        confirmButtonText: "Yes, Save",
        denyButtonText: "No, Discard",
      });

      if (result.isConfirmed) {
        // ✅ Save then proceed
        await handleSubmitForm();
        proceed = true;
      } else if (result.isDenied) {
        // ✅ Discard → skip save
        proceed = true;
      }
    } else {
      // No unsaved → just proceed
      proceed = true;
    }

    if (proceed) {
      await handleMonthYearChange(newMonth, newYear);
    }
  };

  const handleMonthYearChange = async (month, year) => {
    // guard inputs
    if (
      !month ||
      !year ||
      isNaN(month) ||
      isNaN(year) ||
      OrignCurrData.length === 0
    ) {
      if (OrignCurrData.length === 0) {
        Swal.fire({
          title: "Currency Data Missing",
          text: "Cannot load exchange rates. Please ensure currency data is available.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
      return;
    }

    setRows([]); // clear old rows

    const monthStr = String(month).padStart(2, "0");
    const firstDate = dayjs(`${year}-${monthStr}-01`);

    if (!firstDate.isValid()) {
      Swal.fire({
        title: "Invalid Date Selection",
        text: "The selected month and year form an invalid date. Please check your selection.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return;
    }

    const lastDate = firstDate.endOf("month");
    setFromDate(firstDate);
    setToDate(lastDate);

    const days = generateMonthDays(month, year);
    const monthLabel = monthOptions.find((m) => m.key === month)?.value || "";

    const validCurrencies = OrignCurrData.map((curr) => curr.CurrCode).filter(
      Boolean,
    );

    buildCurrencyColumns(
      OrignCurrData,
      monthLabel,
      days,
      month,
      year,
      localCurrency,
    );

    // clamp today’s date
    const today = dayjs();
    const safeDay = Math.min(today.date(), firstDate.daysInMonth());

    const rateDate = dayjs(
      `${year}-${monthStr}-${String(safeDay).padStart(2, "0")}`,
    );

    if (!rateDate.isValid()) {
      Swal.fire({
        title: "Date Calculation Error",
        text: "Could not determine a valid rate date for fetching. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return;
    }

    const rateDateStr = rateDate.format("MM/DD/YYYY");

    const numDays = days.length;
    const numCurrencies = validCurrencies.length;
    const limit = numDays * numCurrencies;

    try {
      setLoading(true);

      const res = await apiClient.get(`/ExchangeRatesandIndexes`, {
        params: {
          Limit: limit,
          IsIndexes: false,
          RateDate: rateDateStr,
        },
      });

      if (res.data.success && Array.isArray(res.data.values)) {
        const rateMap = {};
        res.data.values.forEach((item) => {
          const dateKey = dayjs(item.RateDate).date();
          if (!rateMap[dateKey]) rateMap[dateKey] = {};
          rateMap[dateKey][item.Currency] = {
            Rate: item.Rate,
            DocEntry: item.DocEntry,
          };
        });

        const newRows = days.map((day) => {
          const fullDate = `${year}-${monthStr}-${String(day.date).padStart(
            2,
            "0",
          )}`;
          const row = { ...day, fullDate };

          const dayRates = rateMap[day.date];
          if (dayRates) {
            Object.entries(dayRates).forEach(
              ([currency, { Rate, DocEntry }]) => {
                row[currency] = Rate;
                row[`${currency}_DocEntry`] = DocEntry || "";
              },
            );
          }
          return row;
        });

        setOriginalRows(JSON.parse(JSON.stringify(newRows)));
        setRows(newRows);
      } else {
        Swal.fire({
          icon: "info",
          title: "No Rates Found",
          text:
            res.data.message ||
            "No exchange rates found for the selected period.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Load Exchange Rates",
        text:
          error?.response?.data?.message ||
          "Something went wrong while fetching exchange rates.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      CurrencyData();
      CurrencyDataList(0);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    if (
      watchedMonth &&
      watchedYear &&
      OrignCurrData.length > 0 &&
      !initialLoaded.current
    ) {
      initialLoaded.current = true;
      handleMonthYearChange(watchedMonth, watchedYear);
    }
  }, [watchedMonth, watchedYear, OrignCurrData]);

  useEffect(
    () => {
      if (selectedYear && cpValues.length > 0) {
        fetchCPValues(selectedYear);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedYear],
  );

  //====================================Bulk Post API====================================
  const dispatchRedux = useDispatch();
  const { data } = useSelector((state) => state.exchange);

  console.log("dfdsfRadux", data);

  const handleSubmitForm = async () => {
    const month = watch("Month");
    const year = watch("Year");

    const payloads = [];
    const today = dayjs().format("YYYY/MM/DD");

    // =========================
    // TAB 0 : EXCHANGE RATES
    // =========================
    if (value === "0") {
      if (!month || !year) {
        Swal.fire({
          title: "Validation Error!",
          text: "Month and Year are required.",
          icon: "warning",
        });
        return;
      }

      const monthStr = String(month).padStart(2, "0");

      rows.forEach((row) => {
        const dayStr = String(row.date).padStart(2, "0");
        const rateDate = `${year}/${monthStr}/${dayStr}`;

        currencyColumns.forEach((col) => {
          const key = col.field;
          if (key === "id" || key === "date" || key.endsWith("_DocEntry"))
            return;

          const val = row[key];
          const docEntry = row[`${key}_DocEntry`];

          // 🔐 numeric-safe rate
          const rate =
            val === "" || val === null || isNaN(val) ? "0" : String(val);

          payloads.push({
            DocEntry: docEntry || "0",
            UserId: user.UserId,
            CreatedBy: user.UserName || "",
            CreatedDate: today,
            ModifiedBy: user.UserName || "",
            ModifiedDate: today,
            Status: "1",
            RateDate: rateDate,
            Currency: key,
            Rate: rate,
          });
        });
      });
    }

    // =========================
    // TAB 1 : CP / INDEX
    // =========================
    else if (value === "1") {
      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      cpValues.forEach((row) => {
        const monthStr = monthMap[row.month] || "01";
        const rateDate = dayjs(`${year}-${monthStr}-01`).format("YYYY/MM/DD");

        // 🔐 numeric-safe CP
        const rate =
          row.cp === "" || row.cp === null || isNaN(row.cp)
            ? "0"
            : String(row.cp);

        payloads.push({
          DocEntry: row.DocEntry || "0",
          UserId: user.UserId,
          CreatedBy: user.UserName || "",
          CreatedDate: today,
          ModifiedBy: user.UserName || "",
          ModifiedDate: today,
          Status: "1",
          RateDate: rateDate,
          Currency: "CP",
          Rate: rate,
        });
      });
    }

    // =========================
    // EMPTY CHECK
    // =========================
    if (payloads.length === 0) {
      Swal.fire({
        title: "No data to save",
        text: "Please enter some rates before saving.",
        icon: "info",
      });
      return;
    }

    // =========================
    // API CALL
    // =========================
    try {
      setLoading(true);

      const res = await apiClient.post(
        `/ExchangeRatesandIndexes/Bulk`,
        payloads,
      );

      // 🔴 BACKEND LOGICAL ERROR (HTTP 200 but success:false)
      if (res?.data?.success === false) {
        Swal.fire({
          title: "Error!",
          text: res.data.message || "Failed to save records.",
          icon: "error",
        });
        return;
      }

      // =========================
      // SUCCESS FLOW
      // =========================
      dispatchRedux(clearAllCache());

      const formattedDate = dayjs(payloads[0].RateDate).format("YYYY-MM-DD");
      dispatchRedux(fetchExchangeRateStore(formattedDate));

      fetchCPValues(selectedYear);
      handleMonthYearChange(watchedMonth, watchedYear);

      Swal.fire({
        title: "Success!",
        text: `${payloads.length} records saved successfully.`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      setLoading(false);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "Something went wrong while saving records.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={closeModel}
        aria-labelledby="rate-selection-modal-title"
        aria-describedby="rate-selection-modal-description"
        // sx={{
        //   backgroundColor: theme.palette.mode === "light" ? "#fff" : "#373842",
        // }}
      >
        <Box
          sx={{
            position: "relative",
            width: isFullScreen ? "80%" : "60%",
            maxHeight: "85vh",
            bgcolor: grey[50],
            borderRadius: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#373842",
            mx: "auto",
            my: "5%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Close & Fullscreen buttons container */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              gap: 1,
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={() => setIsFullScreen((prev) => !prev)}
              aria-label={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              // sx={{
              //   bgcolor: grey[100],
              //   "&:hover": { bgcolor: grey[300] },
              //   boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              //   transition: "background-color 0.3s ease",
              // }}
              size="small"
            >
              {isFullScreen ? (
                <FullscreenExitIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          {/* Header */}
          <Typography
            id="rate-selection-modal-title"
            variant="h5"
            fontWeight="300"
            // color="rgb(8, 74, 139) "
            textAlign="center"
            sx={{
              py: 3,

              userSelect: "none",
              letterSpacing: 1,
            }}
          >
            Set Rates for Selection Criteria
          </Typography>

          {/* Scrollable content area */}
          <Box
            sx={{
              p: 3,
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Date Filters */}
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <SelectedDatePickerField
                  label="From Date"
                  name="FromDate"
                  value={fromDate ? dayjs(fromDate) : undefined}
                  onChange={(date) => {
                    setFromDate(date);
                    setToDate("");
                  }}
                  disabled
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <SelectedDatePickerField
                  label="To Date"
                  name="ToDate"
                  value={toDate ? dayjs(toDate) : undefined}
                  minDate={fromDate}
                  onChange={(date) => setToDate(date)}
                  // disabled={!fromDate}
                  disabled
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box sx={{ mb: 1 }}>
              <TextField
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search Currency..."
                size="small"
                // fullWidth
                variant="standard"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                }}
                sx={{
                  "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:before":
                    {
                      borderBottomColor: "#e0e0e0", // light gray for all states
                    },
                }}
              />
            </Box>
            {/* DataGrid Container */}
            <Paper
              elevation={6}
              sx={{
                height: isFullScreen ? "65vh" : "45vh",
                borderRadius: 2,
                // border: "1px solid #E0E0E0",
                backgroundColor:
                  theme.palette.mode === "light" ? "#fff" : "#373842",

                overflow: "hidden",
                flexGrow: 1,
                boxShadow: "0 6px 20px rgba(7, 7, 7, 0.08)",
              }}
            >
              <DataGrid
                apiRef={selectionApiRef}
                sx={gridSx}
                onCellKeyDown={selectionHandleCellKeyDown}
                rows={gridRows}
                columns={CurrencyColumn}
                getRowId={(row) => row.CurrCode}
                checkboxSelection
                disableRowSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                onRowSelectionModelChange={(ids) => {
                  const selectedIDs = new Set(ids);
                  const selected = gridRows
                    .filter((row) => selectedIDs.has(row.CurrCode))
                    .map((row) => ({
                      CurrCode: row.CurrCode,
                      Currency: row.CurrName || "",
                      rate: row.Rate ?? "",
                    }));

                  setSelectedRows(selected);
                }}
                processRowUpdate={(newRow) => {
                  // update CurrencyList
                  setCurrencyList((prev) =>
                    prev.map((row) =>
                      row.CurrCode === newRow.CurrCode
                        ? { ...row, Rate: newRow.Rate }
                        : row,
                    ),
                  );

                  // update selectedRows
                  setSelectedRows((prev) =>
                    prev.map((row) =>
                      row.CurrCode === newRow.CurrCode
                        ? { ...row, rate: newRow.Rate }
                        : row,
                    ),
                  );

                  return newRow;
                }}
                onProcessRowUpdateError={(err) => console.error(err)}
              />
            </Paper>
          </Box>

          {/* Footer Buttons */}
          <Box
            sx={{
              p: 3,
              // borderTop: `1px solid ${grey[300]}`,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#373842",
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={handleModalSubmit}
            >
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      {loading && <Loader open={loading} />}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
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
            alignCurrencies={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              Exchange Rates and Indexes
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
                <Grid container width={"100%"}>
                  <Box sx={{ width: "100%" }}>
                    <Grid
                      position="static"
                      sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      <TabContext value={value}>
                        <Tabs
                          value={value}
                          onChange={handleChange}
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                          aria-label="scrollable auto tabs example"
                          sx={{
                            "& .MuiTab-root": {
                              textTransform: "none",
                              minWidth: 120,
                              margin: "0 5px",
                              borderRadius: "8px",
                              backgroundColor: "#fff",
                              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                              fontWeight: "bold",
                              color: "#555",
                              display: "flex",
                              flexDirection: "row", // icon + label inline
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              minHeight: "46px",
                            },
                            "& .MuiTab-root svg": {
                              fontSize: "20px",
                              color: "#555",
                            },
                            "& .MuiTab-root.Mui-selected": {
                              backgroundColor: "#1976d2",
                              color: "white",
                              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                            },
                            "& .MuiTab-root.Mui-selected svg": {
                              color: "white",
                            },
                            "& .MuiTabs-indicator": {
                              display: "none",
                            },
                          }}
                        >
                          {tabData.map((tab, index) => (
                            <Tab
                              key={tab.label}
                              value={String(index)}
                              label={tab.label}
                              icon={tab.icon}
                              iconPosition="start"
                            />
                          ))}
                        </Tabs>

                        {value === "0" && (
                          <>
                            <Box
                              sx={{
                                backgroundColor:
                                  theme.palette.mode === "light"
                                    ? "#fafafa"
                                    : "#080D2B",
                                p: 3,
                                borderRadius: 3,
                                // boxShadow: "0px 6px 16px rgba(0,0,0,0.1)",
                                height: "80vh",
                                mt: 2,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Top Month + Year fields aligned right */}
                              <Grid
                                container
                                justifyContent="flex-start"
                                alignItems="center"
                                spacing={2}
                                mb={2}
                              >
                                {/* Month Field */}
                                <Grid item>
                                  <Controller
                                    name="Month"
                                    control={control}
                                    rules={{ required: "Month is required" }}
                                    render={({ field }) => (
                                      <InputSelectTextField
                                        {...field}
                                        label="MONTH"
                                        data={monthOptions}
                                        sx={{ width: 180 }}
                                        onChange={async (event) => {
                                          const val = event.target.value; // 👈 Extract actual value
                                          const currentYear = watch("Year");
                                          await handleMonthYearChangeWithConfirm(
                                            val,
                                            currentYear,
                                          );
                                          field.onChange(val);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                {/* Year Field */}
                                <Grid item>
                                  <Controller
                                    name="Year"
                                    control={control}
                                    render={({ field }) => (
                                      <SelectedYearPickerField
                                        {...field}
                                        label="YEAR"
                                        sx={{ width: 180 }}
                                        onChange={async (date) => {
                                          if (!date) return;

                                          const newYear = dayjs(date)
                                            .year()
                                            .toString();
                                          const currentMonth = watch("Month");

                                          await handleMonthYearChangeWithConfirm(
                                            currentMonth,
                                            newYear,
                                          );

                                          field.onChange(newYear);
                                          setValue("Year", newYear);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>

                              {/* DataGrid with gray shade */}
                              <Box
                                sx={{
                                  flex: 1, // fills remaining vertical space
                                  width: "100%",
                                  borderRadius: 2,
                                  height: "60vh",
                                  overflowY: "hidden", // hides extra overflow
                                  overflowX: "auto",
                                  backgroundColor:
                                    theme.palette.mode === "light"
                                      ? "#fff"
                                      : "#373842",
                                }}
                              >
                                <DataGrid
                                  key={theme.palette.mode}
                                  sx={gridSx}
                                  hideFooter
                                  apiRef={apiRef}
                                  onCellKeyDown={handleCellKeyDown}
                                  rows={rows}
                                  columns={currencyColumns}
                                  processRowUpdate={(newRow) => {
                                    setRows((prevRows) =>
                                      prevRows.map((row) =>
                                        row.id === newRow.id
                                          ? { ...row, ...newRow }
                                          : row,
                                      ),
                                    );
                                    return newRow;
                                  }}
                                  experimentalFeatures={{ newEditingApi: true }}
                                  getRowId={(row) => row.id || row.LineNum}
                                  autoHeight={false}
                                />
                              </Box>

                              {/* Bottom Section (AcctReceivable + Buttons) */}
                              <Grid
                                container
                                alignItems="center"
                                justifyContent="space-between"
                                textTransform="uppercase"
                                spacing={2}
                                mt={2}
                              >
                                <Grid item xs={12} md={6} lg={6}>
                                  <Button
                                    variant="outlined"
                                    startIcon={<ViewListIcon />}
                                    onClick={handleClickOpen}
                                    color="primary"
                                  >
                                    Set Rates for Selection Criteria
                                  </Button>
                                </Grid>

                                <Grid
                                  item
                                  xs={12}
                                  md={6}
                                  lg={6}
                                  textAlign="right"
                                >
                                  <Grid
                                    container
                                    spacing={2}
                                    justifyContent="flex-end"
                                  >
                                    <Grid item>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        size="medium"
                                        startIcon={<DownloadIcon />}
                                        sx={{ px: 2, py: 1, fontWeight: 600 }}
                                        onClick={() => {
                                          const input =
                                            document.createElement("input");
                                          input.type = "file";
                                          input.accept = ".csv,.txt"; // Allow both CSV and TXT

                                          input.onchange = (e) => {
                                            const file = e.target.files[0];
                                            if (!file) {
                                              Swal.fire({
                                                title: "No File Selected",
                                                text: "Please select a CSV or TXT file to import.",
                                                icon: "info",
                                                confirmButtonText: "Ok",
                                              });
                                              return;
                                            }

                                            handleCsvImport(
                                              file,
                                              setRows,
                                              watchedMonth,
                                              watchedYear,
                                            ); // ✅ pass month/year
                                          };

                                          input.click();
                                        }}
                                      >
                                        Import
                                      </Button>
                                    </Grid>
                                    <Grid item>
                                      <Button
                                        variant="outlined"
                                        color="success"
                                        size="medium"
                                        startIcon={<UploadIcon />}
                                        sx={{ px: 2, py: 1, fontWeight: 600 }}
                                        onClick={handleExportCsv} // ✅ call export handler
                                      >
                                        Export
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Box>
                          </>
                        )}
                        {value === "1" && (
                          <>
                            <Box
                              sx={{
                                backgroundColor:
                                  theme.palette.mode === "light"
                                    ? "#fafafa"
                                    : "#080D2B",
                                p: 3,
                                borderRadius: 3,
                                mt: 2,
                                // border: "1px solid #e0e0e0",
                              }}
                            >
                              {/* Top Month + Year fields aligned right */}
                              <Grid
                                container
                                justifyContent="flex-start"
                                alignItems="center"
                                spacing={2}
                                mb={2}
                              >
                                <Grid
                                  item
                                  xs="auto"
                                  textAlign="right"
                                  sx={{ minWidth: 160, px: 0.5 }} // Adjust width and padding as needed
                                >
                                  <Controller
                                    name="IndexesYear"
                                    control={control}
                                    render={({ field }) => (
                                      <SelectedYearPickerField
                                        {...field}
                                        label="YEAR"
                                        onChange={(date) => {
                                          const year = dayjs(date)
                                            .year()
                                            .toString();
                                          field.onChange(
                                            date
                                              ? dayjs(date).toISOString()
                                              : null,
                                          );
                                          setValue("IndexesYear", year);

                                          // if (year) {
                                          //   fetchCPValues(year); // 👈 call API when year selected
                                          // }
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Box
                                  sx={{
                                    height: "60vh",
                                    overflow: "auto",
                                    width: "100%",
                                    // border: "1px solid #d3d3d3",
                                    borderRadius: 2,
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#f9f9f9"
                                        : "#080D2B",
                                  }}
                                >
                                  <DataGrid
                                    sx={gridSx}
                                    hideFooter
                                    apiRef={indexapiRef}
                                    onCellKeyDown={indexhandleCellKeyDown}
                                    rows={cpValues}
                                    processRowUpdate={handleCPRowUpdate}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    autoHeight={false}
                                    initialState={{
                                      pagination: {
                                        paginationModel: { pageSize: 100 },
                                      },
                                    }}
                                    pageSizeOptions={[10]}
                                  />
                                </Box>
                              </Grid>
                            </Box>
                          </>
                        )}
                      </TabContext>
                    </Grid>

                    <Divider />
                  </Box>
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
                alignCurrencies: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                // name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
              >
                SAVE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* Drawer for smaller screens */}
    </>
  );
}
