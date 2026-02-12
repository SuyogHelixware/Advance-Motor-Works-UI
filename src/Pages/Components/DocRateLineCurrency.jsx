import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import ExchangeRate from "./ExchangeRate";

export const useDocRateCurrency = (DocDate) => {
  const [SysRateApi, setSysRate] = useState(null);
  const [openSys, setOpenSys] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const fetchRate = async () => {
      try {
        const res = await apiClient.get(`/ExchangeRatesandIndexes/GetCurrOnDate`, {
          params: {
            Currency: "",
            RateDate: "",
          },
        });
        const response = res.data;
        const rate = response.values?.[0]?.Rate ?? 0;
        if (response.success && response.values.length > 0) {
          if (isMounted) setSysRate(rate);
          if (rate <= 0) setOpenSys(true);
        } else {
          Swal.fire({
            title: "Rate Not Found",
            text: "No exchange rate available for the selected currency/date.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
          if (isMounted) setSysRate(null);
          setOpenSys(true);
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || error,
          icon: "error",
          confirmButtonText: "Ok",
        });
        if (isMounted) setSysRate(null);
      }
    };
    fetchRate();
    return () => {
      isMounted = false;
    };
  }, [DocDate,]);

  const handleSubmitCurrency = useCallback((data) => {
    setSysRate(data);
    setOpenSys(false);
  }, []);
  const ExchangeRateModal = (
    <ExchangeRate
      open={openSys}
      closeModel={() => setOpenSys(false)}
      onSubmit={handleSubmitCurrency}
      data={{
        DocEntryCur: "",
        DocDate: DocDate,
        Currency:"",
        DocRate: SysRateApi,
      }}
      title="Exchange Rate"
    />
  );

  return { SysRateApi, ExchangeRateModal };
};
