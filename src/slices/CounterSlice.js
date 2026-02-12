import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../services/apiClient";
import Swal from "sweetalert2";


export const fetchCounter=createAsyncThunk("counter/fetch",
    async(Menuname,{rejectWithValue})=>{
        try {
            const {data}=await apiClient.get("/Counter", { params: { Menuname: Menuname } })
            if(data.success){
                return data.values
            }
            else{
                  Swal.fire({
                    title: "Error!",
                    text: data.message || "Unable to fetch exchange rate.",
                    icon: "error",
                  });
             return rejectWithValue(data.message || "Failed to fetch counter");

            }
        } catch (error) {
            Swal.fire({
                    title: "Error!",
                    text: error.message || "Unable to fetch exchange rate.",
                    icon: "error",
                  });
             return rejectWithValue(error.message);
        }
    }
)


const counterSlice=createSlice({
    name:"counter",
    initialState:{
        Counterdata:{},
        loading:false,
        error:null,
        lastFetchedAt:null
    },
    reducers:{},
    extraReducers: (builder) => {
    builder
      .addCase(fetchCounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCounter.fulfilled, (state, action) => {
        state.loading = false;
        state.Counterdata = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchCounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },
})
export default counterSlice.reducer;