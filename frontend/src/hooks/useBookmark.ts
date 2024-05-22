import { useState } from "react";
import Cookies from "universal-cookie";

import { AUTH_TOKEN } from "../lib/cookie_names";

export function useBookmark(initialState: boolean, reviewID: string) {
  const [hasBookmarked, setHasBookmarked] = useState(initialState);
  const cookies = new Cookies(null, {
    path: "/",
  });

  const bookmarkHandler = async () => {
    const data = { review_id: reviewID };
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/review/bookmark`,
      {
        method: "POST",
        body: JSON.stringify(data),
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          "content-type": "application/json",
        },
      },
    );
    const message = await response.json();
    if (message.status == "ok") {
      if (message.action == "bookmark") {
        setHasBookmarked(true);
      } else {
        setHasBookmarked(false);
      }
    }
  };
  return [hasBookmarked, bookmarkHandler] as const;
}
