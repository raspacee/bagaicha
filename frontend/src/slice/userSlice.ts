import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInterface } from "../lib/types";

const initialState: UserInterface = {
  first_name: "Initial",
  last_name: "Initial",
  user_id: "test",
  email: "test@gmail.com",
  profile_picture_url: "jpt",
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInterface>) => {
      const { first_name, last_name, user_id, email, profile_picture_url } =
        action.payload;
      state.first_name = first_name;
      state.last_name = last_name;
      state.user_id = user_id;
      state.email = email;
      state.profile_picture_url = profile_picture_url;
    },
    getUser: (state) => {
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, getUser } = userSlice.actions;

export default userSlice.reducer;
