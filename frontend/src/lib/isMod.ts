import Cookies from "universal-cookie";
import { AUTH_TOKEN_NAME } from "./config";

export const isMod = async () => {
  const cookies = new Cookies(null, {
    path: "/",
  });
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/moderator`, {
      method: "post",
      mode: "cors",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    const data = await res.json();
    if (data.status == "ok") return true;
    else false;
  } catch (err) {
    return false;
  }
};
