import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LocationType } from "../lib/types";

const initialState: LocationType = {
  lat: 27.71,
  long: 85.5,
};

export const locationSlice = createSlice({
  name: "location",
  initialState: initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<LocationType>) => {
      const { lat, long } = action.payload;
      state.lat = lat;
      state.long = long;
    },
    getLocation: (state) => {
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLocation, getLocation } = locationSlice.actions;

export default locationSlice.reducer;
