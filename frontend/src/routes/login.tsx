import { useState } from "react";
import { FaUser } from "@react-icons/all-files/fa/FaUser";
import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginSchema, type LoginSchemaType } from "../lib/schemas";
import Cookies from "universal-cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { AUTH_TOKEN } from "../lib/cookie_names";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });
  const cookies = new Cookies(null, {
    path: "/",
  });
  const navigate = useNavigate();

  const [formMsg, setFormMsg] = useState<string | null>(null);

  const onSubmit: SubmitHandler = async (data: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.status == "ok") {
        cookies.set(AUTH_TOKEN, result.token);
        setFormMsg(null);
        navigate("/feed");
      } else {
        setFormMsg(result.message);
      }
    } catch (err) {
      setFormMsg("Something went wrong, please try again");
    }
  };
  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-gray-200 border-2 rounded-lg h-fit px-8 py-7 bg-white shadow-xl"
      >
        <div className="w-full flex flex-row justify-center items-center">
          <FaUser size={45} fill="#4169E1" />
          <h2 className="text-5xl font-bold ml-4 antialiased">Log In</h2>
        </div>
        <div className="w-full grid grid-cols-3 mt-7">
          <label className="border-black font-medium mr-4 text-2xl col-span-1">
            Email
          </label>
          <input
            className="border-gray-200 py-2 px-3 border-2 rounded-md bg-gray-200 outline-none col-span-2"
            type="email"
            placeholder="Type your email here"
            {...register("email")}
          />
        </div>
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="w-full grid grid-cols-3 mt-7">
          <label className="font-medium mr-4 text-2xl col-span-1">
            Password
          </label>
          <input
            className="border-gray-200 outline-none py-2 px-3 border-2 bg-gray-200 rounded-md col-span-2"
            type="password"
            placeholder="and your password here"
            {...register("password")}
          />
        </div>
        <div id="password-error" aria-live="polite" aria-atomic="true">
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="w-full flex justify-end mt-7">
          <button
            className="border-blue-500 text-white border-2 text-medium py-2 px-6 rounded-md text-xl bg-blue-500"
            type="submit"
          >
            Log In
          </button>
        </div>
        {formMsg != null && (
          <div className="w-full flex justify-center">
            <p className="mt-2 text-sm text-red-500">{formMsg}</p>
          </div>
        )}
        <div className="w-full flex justify-end mt-5">
          <Link to="/signup">
            <span className="text-gray-600 font-medium">
              Create an account instead
            </span>
          </Link>
        </div>
      </form>
    </div>
  );
}
