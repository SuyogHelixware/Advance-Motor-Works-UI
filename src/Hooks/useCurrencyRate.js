import dayjs from "dayjs";
import Swal from "sweetalert2";
import useAuth from "../Routing/AuthContext";
import apiClient from "../services/apiClient";

export function useCurrencyRate() {
  const { companyData } = useAuth();
  const CurrencyRateSelect = async ({ Currency, DocDate, setValue, dispatch }) => {
    if (companyData.MainCurncy === Currency) {
      setValue("DocRate", "1");
      setValue("DocEntryCur", "0");
      return;
    }

    try {
      const res = await apiClient.get("/ExchangeRatesandIndexes/GetCurrOnDate", {
        params: {
          Currency,
          RateDate: dayjs(DocDate).format("YYYY-MM-DD"),
        },
      });

      const response = res.data;

      if (response.success) {
        const { Rate, DocEntry } = response.values[0];

        setValue("DocRate", Rate);
        setValue("DocEntryCur", DocEntry);

        if (Rate <= 0) {
          dispatch({ type: "OPEN", modal: "DocRateOpen" });
        }
      } else {
        setValue("DocRate", "0");
        setValue("DocEntryCur", "0");

        Swal.fire({
          title: "Rate Not Found",
          text: "No exchange rate available for the selected currency/date.",
          icon: "warning",
        });

        dispatch({ type: "OPEN", modal: "DocRateOpen" });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || err,
        icon: "error",
      });
    }
  };

  return { CurrencyRateSelect };
}
