/* User type when logged in */
type UserInterface = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
};

type LocationType = {
  lat: number;
  long: number;
};

type AddPlaceType = {
  relation: null | "owner" | "customer";
  placeName: string;
  placeLat: string;
  placeLong: string;
  foods: string[];
  drinks: string[];
  displayPic: File | null;
  alcoholAllowed: boolean;
};

type ModalType = {
  imgModal: {
    display: boolean;
    src: string;
  };
  searchModal: {
    display: boolean;
  };
  postCreateModal: {
    display: boolean;
  };
  reviewModal: {
    reviewId: string | null;
    reviewImageUrl: string;
    reviewBody: string;
    authorName: string;
    authorImageUrl: string;
    authorEmail: string;
    createdAt: string;
    placeName: string;
    placeId: string;
    rating: number;
  };
};

type FilterType = {
  suggested: {
    delivery: boolean;
    takeout: boolean;
    petFriendly: boolean;
    veryClean: boolean;
    affordable: boolean;
  };
  category: {
    burger: boolean;
    sekuwa: boolean;
    momo: boolean;
    lafing: boolean;
    coffee: boolean;
  };
  distance: {
    distancePicked: Distances;
  };
};

type FetchOptionType = {
  method: "post" | "get" | "put";
  body?: string;
  headers?: {
    "content-type"?: string;
    authorization?: string;
  };
};

type Notification = {
  fullname: string;
  user_profile_picture_url: string;
  action_type: string;
  object_type: string;
  object_url: string;
  created_at: string;
};

export type {
  UserInterface,
  LocationType,
  FetchOptionType,
  Notification,
  FilterType,
  AddPlaceType,
  ModalType,
};
