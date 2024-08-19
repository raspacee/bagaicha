import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { UserInterface } from "./types";
import Cookies from "universal-cookie";
import { AUTH_TOKEN_NAME } from "./config";

/* Reads user token and decodes it */
export async function getUserData(): Promise<UserInterface | null> {
  const cookies = new Cookies(null, { path: "/" });
  try {
    const token = cookies.get(AUTH_TOKEN_NAME);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/authenticate`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (data.status == "ok") return data.user;
    else throw new Error();
  } catch (err) {
    console.error(err);
    throw redirect("/login");
  }
}

export function notAuthenticated() {
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get(AUTH_TOKEN_NAME);
  if (token) {
    return redirect("/feed");
  }
  return null;
}

export async function isModerator() {
  const cookies = new Cookies(null, { path: "/" });
  try {
    const token = cookies.get(AUTH_TOKEN_NAME);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/moderator`, {
      method: "POST",
      mode: "cors",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.status == "ok") return true;
    else throw new Error();
  } catch (err) {
    throw redirect("/not-authorized");
  }
}
