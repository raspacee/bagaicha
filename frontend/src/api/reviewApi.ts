import Cookies from "universal-cookie";

import { AUTH_TOKEN } from "../lib/cookie_names";
import { LocationType } from "../lib/types";

const cookies = new Cookies(null, { path: "/" });

const fetchReviews = async (sortBy: string, location: LocationType) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const url = `${import.meta.env.VITE_API_URL}/review?lat=${
    location.lat
  }&long=${location.long}&sort=${sortBy}`;
  const res = await fetch(url, {
    mode: "cors",
    headers: {
      authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
    },
  });
  const data = await res.json();
  if (data.status == "ok") {
    return data.reviews;
  } else {
    throw new Error("Server error 500");
  }
};

const createReview = async (data: FormData) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
    method: "POST",
    body: data,
    mode: "cors",
    headers: {
      authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
    },
  });
  const result = await response.json();
  console.log("createReview:", result);
  if (result.status == "ok") {
    return result.review;
  } else {
    throw new Error(result.message);
  }
};

export { fetchReviews, createReview };
