import { configureStore } from "@reduxjs/toolkit";
import exchangeReducer from "../slices/exchangeRateSlice";
import counterReducer from "../slices/CounterSlice"
export const store = configureStore({
 reducer: {
    exchange: exchangeReducer,  
    counter: counterReducer,
  },
  
});
