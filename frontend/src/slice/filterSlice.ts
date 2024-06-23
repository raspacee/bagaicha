import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type FilterType } from "../lib/types";
import { Distances } from "../lib/enums";

const initialState: FilterType = {
  suggested: {
    delivery: false,
    takeout: false,
    petFriendly: false,
    veryClean: false,
    affordable: false,
  },
  category: {
    burger: false,
    sekuwa: false,
    momo: false,
    lafing: false,
    coffee: false,
  },
  distance: {
    distancePicked: Distances.NONE,
  },
};

export const filterSlice = createSlice({
  name: "filter",
  initialState: initialState,
  reducers: {
    setSuggested: (
      state,
      action: PayloadAction<{
        key: keyof FilterType["suggested"];
        value: boolean;
      }>,
    ) => {
      const { key, value } = action.payload;
      state.suggested[key] = value;
    },
    setCategory: (
      state,
      action: PayloadAction<{
        key: keyof FilterType["category"];
        value: boolean;
      }>,
    ) => {
      const { key, value } = action.payload;
      state.category[key] = value;
    },
    setDistance: (state, action: PayloadAction<Distances>) => {
      const distance = action.payload;
      state.distance.distancePicked = distance as Distances;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSuggested, setCategory, setDistance } = filterSlice.actions;

export default filterSlice.reducer;
