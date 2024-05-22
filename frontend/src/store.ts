import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import locationReducer from "./slice/locationSlice";
import filterReducer from "./slice/filterSlice";
import modalReducer from "./slice/modalSlice";
import addPlaceReducer from "./slice/addPlaceSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: locationReducer,
    filter: filterReducer,
    modal: modalReducer,
    addplace: addPlaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
