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
    display: false,
    reviewId: null,
    reviewImageUrl: "",
    reviewBody: "",
    authorImageUrl: "",
    authorEmail: "",
    authorName: "",
    createdAt: "",
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
      }>,
    ) => {
      const { value, src } = action.payload;
      state.imgModal.display = value;
      state.imgModal.src = src;
    },
    setNotificationModal: (
      state,
      action: PayloadAction<{ value: boolean; notifications?: any[] }>,
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
      }>,
    ) => {
      const {
        reviewId,
        reviewImageUrl,
        authorName,
        authorImageUrl,
        createdAt,
        reviewBody,
        authorEmail,
      } = action.payload;
      state.reviewModal.display = true;
      state.reviewModal.reviewId = reviewId;
      state.reviewModal.reviewImageUrl = reviewImageUrl;
      state.reviewModal.authorName = authorName;
      state.reviewModal.authorEmail = authorEmail;
      state.reviewModal.authorImageUrl = authorImageUrl;
      state.reviewModal.createdAt = createdAt;
      state.reviewModal.reviewBody = reviewBody;
    },
    closeReviewModal: (state) => {
      state.reviewModal.display = false;
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
  closeReviewModal,
} = modalSlice.actions;

export default modalSlice.reducer;
