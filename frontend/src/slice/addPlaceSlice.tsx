import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AddPlaceType } from "../lib/types";

const initialState: AddPlaceType = {
  relation: null,
  placeName: "",
  placeLat: "",
  placeLong: "",
  displayPic: null,
  foods: [],
  drinks: [],
  alcoholAllowed: false,
};

export const addPlaceSlice = createSlice({
  name: "location",
  initialState: initialState,
  reducers: {
    updateState: (state, action: PayloadAction<AddPlaceType>) => {
      state.placeName = action.payload.placeName;
      state.placeLat = action.payload.placeLat;
      state.placeLong = action.payload.placeLong;
      state.alcoholAllowed = action.payload.alcoholAllowed;
      state.foods = action.payload.foods;
      state.drinks = action.payload.drinks;
      state.relation = action.payload.relation;
      state.displayPic = action.payload.displayPic;
    },
    clearState: (state) => {
      state.placeName = "";
      state.placeLat = "";
      state.placeLong = "";
      state.alcoholAllowed = false;
      state.foods = [];
      state.drinks = [];
      state.relation = null;
      state.displayPic = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateState, clearState } = addPlaceSlice.actions;

export default addPlaceSlice.reducer;
