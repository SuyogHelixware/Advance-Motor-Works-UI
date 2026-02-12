import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../services/apiClient";
import dayjs from "dayjs";
import Swal from "sweetalert2";


export const fetchExchangeRateStore = createAsyncThunk(
  "exchange/fetchExchangeRate",
  async (date, { getState, rejectWithValue }) => {
    try {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const state = getState().exchange.data;
      if (state[formattedDate]) {
        return {
          date: formattedDate,
          values: state[formattedDate],
          fromCache: true,
        };
      }
      const { data: response } = await apiClient.get(
        `/ExchangeRatesandIndexes/GetCurrOnDate`,
        { params: { RateDate: formattedDate } }
      );

      if (response.success && response.values?.length > 0) {
        return {
          date: formattedDate,
          values: response.values,
          fromCache: false,
        };
      } else {
        // Swal.fire({
        //   title: "Error!",
        //   text: response.message || "Unable to fetch exchange rate.",
        //   icon: "error",
        // });
        console.log("api error",response.message)
        return rejectWithValue([]);
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Unable to fetch exchange rate.",
        icon: "error",
      });
      return rejectWithValue([]);
    }
  }
);



const exchangeRateSlice = createSlice({
  name: "exchange",
  initialState: {
    data: {}, // { "2025-01-01": [] }
    loading: false,
  },

  reducers: {
    updateItem(state, action) {
      const { date, id, changes } = action.payload;
      if (!state.data[date]) return;
      const index = state.data[date].findIndex((x) => x.id === id);
      if (index !== -1) {
        state.data[date][index] = {
          ...state.data[date][index],
          ...changes,
        };
      }
    },
    updateFullDate(state, action) {
      const { date, values } = action.payload;
      state.data[date] = values;
    },
    clearCacheDate(state, action) {
      const date = action.payload;
      if (state.data[date]) {
        delete state.data[date];
      }
    },
    clearAllCache(state) {
      state.data = {};
    },
  },

  extraReducers: (builder) => {
    
    builder
      .addCase(fetchExchangeRateStore.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchExchangeRateStore.fulfilled, (state, action) => {
        state.loading = false;
        const { date, values, fromCache } = action.payload;
        if (fromCache) return;
        state.data[date] = values;
      })

      .addCase(fetchExchangeRateStore.rejected, (state) => {
        state.loading = false;
      });
  },
});




export const {
  updateItem,
  updateFullDate,
  clearCacheDate,
  clearAllCache,
} = exchangeRateSlice.actions;

export default exchangeRateSlice.reducer;
