import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ModalType } from "../lib/types";

const initialState: ModalType = {
  imgModal: {
    display: false,
    src: "",
  },
  notificationModal: {
    display: false,
    notifications: [],
  },
  searchModal: {
    display: false,
  },
  postCreateModal: {
    display: false,
  },
  reviewModal: {
    reviewId: null,
    reviewImageUrl: "",
    reviewBody: "",
    authorImageUrl: "",
    authorEmail: "",
    authorName: "",
    createdAt: "",
    placeName: "",
    placeId: "",
    rating: 0,
  },
};

export const modalSlice = createSlice({
  name: "modal",
  initialState: initialState,
  reducers: {
    setImgModal: (
      state,
      action: PayloadAction<{
        value: boolean;
        src: string;
      }>
    ) => {
      const { value, src } = action.payload;
      state.imgModal.display = value;
      state.imgModal.src = src;
    },
    setNotificationModal: (
      state,
      action: PayloadAction<{ value: boolean; notifications?: any[] }>
    ) => {
      const { value, notifications } = action.payload;
      state.notificationModal.display = value;
      if (notifications) state.notificationModal.notifications = notifications;
    },
    setSearchModal: (state, action: PayloadAction<{ value: boolean }>) => {
      const { value } = action.payload;
      state.searchModal.display = value;
    },
    setPostCreateModal: (state, action: PayloadAction<{ value: boolean }>) => {
      const { value } = action.payload;
      state.postCreateModal.display = value;
    },
    clearPostCreateModal: (state) => {},
    openReviewModal: (
      state,
      action: PayloadAction<{
        reviewId: string;
        reviewImageUrl: string;
        reviewBody: string;
        authorName: string;
        authorImageUrl: string;
        createdAt: string;
        authorEmail: string;
        placeName: string;
        placeId: string;
        rating: number;
      }>
    ) => {
      const {
        reviewId,
        reviewImageUrl,
        authorName,
        authorImageUrl,
        createdAt,
        reviewBody,
        authorEmail,
        placeName,
        placeId,
        rating,
      } = action.payload;
      state.reviewModal.reviewId = reviewId;
      state.reviewModal.reviewImageUrl = reviewImageUrl;
      state.reviewModal.authorName = authorName;
      state.reviewModal.authorEmail = authorEmail;
      state.reviewModal.authorImageUrl = authorImageUrl;
      state.reviewModal.createdAt = createdAt;
      state.reviewModal.reviewBody = reviewBody;
      state.reviewModal.placeName = placeName;
      state.reviewModal.placeId = placeId;
      state.reviewModal.rating = rating;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setImgModal,
  setNotificationModal,
  setSearchModal,
  setPostCreateModal,
  clearPostCreateModal,
  openReviewModal,
} = modalSlice.actions;

export default modalSlice.reducer;
