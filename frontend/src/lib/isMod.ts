import Cookies from "universal-cookie";
import { AUTH_TOKEN } from "../lib/cookie_names";

export const isMod = async () => {
  const cookies = new Cookies(null, {
    path: "/",
  });
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/moderator`, {
      method: "post",
      mode: "cors",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
      },
    });
    const data = await res.json();
    if (data.status == "ok") return true;
    else false;
  } catch (err) {
    return false;
  }
};
