import { useState, useEffect, useRef, useCallback } from "react";
import dayjs from "dayjs";
import apiClient from "../../services/apiClient";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import ExchangeRate from "./ExchangeRate";
import { Grid } from "@mui/material";

/**
 * Custom hook to fetch system currency rate with caching.
 * Opens modal if rate is 0 or not found.
 */
export const useSysRateCurrency = (DocDate) => {
  const { companyData } = useAuth();
  const [SysRateApi, setSysRate] = useState(null);
  const [openSys, setOpenSys] = useState(false);
  const cacheRef = useRef({}); // cache rates by date
  useEffect(() => {
    if (!DocDate || !companyData?.SysCurrncy) return;

    const formattedDate = dayjs(DocDate).format("YYYY-MM-DD");

    if (cacheRef.current[formattedDate] !== undefined) {
      setSysRate(cacheRef.current[formattedDate]);
      return;
    }

    const fetchRate = async () => {
      try {
        const res = await apiClient.get(
          `/ExchangeRatesandIndexes/GetCurrOnDate`,
          {
            params: {
              Currency: companyData.SysCurrncy,
              RateDate: formattedDate,
            },
          }
        );
        const response = res.data;
        const rate =
          companyData.MainCurncy === companyData.SysCurrncy
            ? "1"
            : response.values?.[0]?.Rate ?? 0;
        if (response.success && response.values.length > 0) {
          cacheRef.current[formattedDate] = rate;

          setSysRate(rate);

          // Open modal if rate is 0
          if (rate <= 0) setOpenSys(true);
        } else {
          const rate =
            companyData.MainCurncy === companyData.SysCurrncy
              ? "1"
              : response.values?.[0]?.Rate ?? 0;
          setSysRate(rate);
          if (rate <= 0) {
            setOpenSys(true);
            Swal.fire({
              title: "Rate Not Found",
              text: "No exchange rate available for the selected currency/date FGFGDHFGHFGH.",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || error,
          icon: "error",
          confirmButtonText: "Ok",
        });
        // if (isMounted) setSysRate(null);
      }
    };

    fetchRate();
  }, [DocDate, openSys, companyData?.SysCurrncy, companyData.MainCurncy]);

  const handleSubmitCurrency = useCallback((data) => {
    setSysRate(data);
    setOpenSys(false);
  }, []);

  const ExchangeRateModal = (
    <Grid xs={6} lg={12}>
      <ExchangeRate
        open={openSys}
        closeModel={() => setOpenSys(false)}
        onSubmit={handleSubmitCurrency}
        data={{
          DocEntryCur: "",
          DocDate: DocDate,
          Currency: companyData?.SysCurrncy,
          DocRate: SysRateApi,
        }}
        title="Exchange Rate"
      />
    </Grid>
  );

  return { SysRateApi, ExchangeRateModal };
};
