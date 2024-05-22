import { useState } from "react";
import Cookies from "universal-cookie";

import { AUTH_TOKEN } from "../lib/cookie_names";

export function useLike(initialState: boolean, reviewID: string) {
  const [hasLiked, setHasLiked] = useState(initialState);
  const cookies = new Cookies(null, {
    path: "/",
  });

  const likeHandler = async () => {
    const data = { review_id: reviewID };
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/review/like`,
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
      if (message.action == "like") {
        setHasLiked(true);
      } else {
        setHasLiked(false);
      }
    }
  };

  return [hasLiked, likeHandler] as const;
}
