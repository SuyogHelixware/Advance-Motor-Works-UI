import dayjs from "dayjs";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";

export async function CurrencyRateSelect({
  Currency,
  DocDate,
  setValue,
  dispatch
}) {
      const { companyData } = useAuth();
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
      const Rate = response.values[0].Rate;
      const DocEntryCur = response.values[0].DocEntry;

      setValue("DocRate", Rate);
      setValue("DocEntryCur", DocEntryCur);

      if (Rate <= 0) {
        dispatch({ type: "OPEN", modal: "exchaneRateOpen" });
      }
    } else {
      setValue("DocRate", "0");
      setValue("DocEntryCur", "0");

      Swal.fire({
        title: "Rate Not Found",
        text: "No exchange rate available for the selected currency/date.",
        icon: "warning",
      });

      dispatch({ type: "OPEN", modal: "exchaneRateOpen" });
    }
  } catch (err) {
    Swal.fire({
      title: "Error!",
      text: err.message || err,
      icon: "error",
    });
  }
}
