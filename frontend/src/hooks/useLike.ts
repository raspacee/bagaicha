import { useState } from "react";
import Cookies from "universal-cookie";

import { AUTH_TOKEN_NAME } from "../lib/config";

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
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          "content-type": "application/json",
        },
      }
    );
    if (response.status == 201) {
      setHasLiked(true);
    } else {
      setHasLiked(false);
    }
  };

  return [hasLiked, likeHandler] as const;
}
