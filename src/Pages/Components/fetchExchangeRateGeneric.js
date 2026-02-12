import dayjs from "dayjs";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";

export async function fetchExchangeRateGeneric({
  apiClient,
  Currency,
  DocDate,
  companyData,
  setValue,
  dispatch,
}) {
  const rate=1

 if(companyData.MainCurncy !== Currency){
  try {
    const { data: response } = await apiClient.get(
      `/ExchangeRatesandIndexes/GetCurrOnDate`,
      { params: { Currency, RateDate: dayjs(DocDate).format("YYYY-MM-DD") } }
    );

    let rate = 0;
    let DocEntryCur = 0;
    if (response.success && response.values?.length > 0) {
      const apiRate = response.values[0]?.Rate ?? 0;
      const apiCurrency = response.values[0]?.Currency;
      const apiDocEntry = response.values[0]?.DocEntry ?? 0;
      rate = companyData.MainCurncy === Currency ? 1 : apiRate;
      DocEntryCur = companyData.MainCurncy === apiCurrency ? 1 : apiDocEntry;
    } else {
      rate = companyData.MainCurncy === Currency ? 1 : 0;
      DocEntryCur = companyData.MainCurncy === Currency ? 1 : 0;
    }
    setValue("DocRateLine", rate);
    setValue("DocEntryCur", DocEntryCur);
    setValue("CurrencyLine", Currency);
    if (rate <= 0) {
      Swal.fire({
        title: "Exchange Rate Missing",
        text: "No exchange rate available for the selected currency/date.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      dispatch({ type: "OPEN", modal: "DocRateOpen" });
    }
    return rate;
  } 
  catch (error) {
    const rate = companyData.MainCurncy === Currency ? 1 : 0;
    const DocEntryCur = companyData.MainCurncy === Currency ? 1 : 0;

    setValue("DocRateLine", rate);
    setValue("DocEntryCur", DocEntryCur);
    setValue("CurrencyLine", Currency);

    if (rate <= 0) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Unable to fetch exchange rate.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      dispatch({ type: "OPEN", modal: "DocRateOpen" });
    }

    return rate;
  }
}
setValue("DocRateLine", rate);
setValue("DocEntryCur", 0 );
setValue("CurrencyLine", Currency);
return rate
  
}

const exchangeRateCache = {};  


export async function fetchExhcnageRateLineCopy(RateDate) {
  try {
    const formattedDate = dayjs(RateDate).format("YYYY-MM-DD");

    if (exchangeRateCache[formattedDate]) {
      return exchangeRateCache[formattedDate];
    }

    const { data: response } = await apiClient.get(
      `/ExchangeRatesandIndexes/GetCurrOnDate`,
      { params: { RateDate: formattedDate } }
    );

    if (response.success && response.values?.length > 0) {
      exchangeRateCache[formattedDate] = response.values;
      return response.values;
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message || "Unable to fetch exchange rate.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return [];
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: error.message || "Unable to fetch exchange rate.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return [];
  }
}

