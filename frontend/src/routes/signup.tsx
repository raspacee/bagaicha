import { useState } from "react";
import { FaUser } from "@react-icons/all-files/fa/FaUser";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { SignupSchema, type SignupSchemaType } from "../lib/schemas";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          method: "post",
          mode: "cors",
          body: JSON.stringify(data),
          headers: {
            "content-type": "application/json",
          },
        },
      );
      const result = await response.json();
      console.log(result);
      if (result.status == "ok") {
        setSuccessMsg(result.message);
        setErrorMsg(null);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      setErrorMsg("Something went wrong, please try again");
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-gray-200 border-2 h-fit px-8 py-7 bg-white rounded-lg shadow-xl"
      >
        <div className="w-full flex flex-row justify-center items-center">
          <FaUser size={45} fill="#4169E1" />
          <h2 className="text-5xl font-bold ml-4 antialiased">Sign Up</h2>
        </div>
        <div className="w-full grid gap-2 grid-cols-2 mt-7">
          <input
            className="rounded-md border-gray-200 py-2 px-3 border-2 bg-gray-200 outline-none col-span-1"
            type="text"
            placeholder="First name"
            {...register("first_name")}
          />
          <input
            className="rounded-md border-gray-200 py-2 px-3 border-2 bg-gray-200 outline-none col-span-1"
            type="text"
            placeholder="Last name"
            {...register("last_name")}
          />
        </div>
        <div className="w-full grid gap-2 grid-cols-2 mt-1">
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-500 col-span-1">
              {errors.first_name.message}
            </p>
          )}
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-500 col-span-1">
              {errors.last_name.message}
            </p>
          )}
        </div>
        <div className="w-full grid grid-cols-3 mt-7">
          <label className="font-medium mr-4 text-2xl col-span-1">Email</label>
          <input
            className="rounded-md border-gray-200 py-2 px-3 border-2 bg-gray-200 outline-none col-span-2"
            type="email"
            placeholder="Type your email"
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
            className="rounded-md border-gray-200 py-2 px-3 border-2 bg-gray-200 outline-none col-span-2"
            type="password"
            placeholder="Create a strong password"
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
            Sign Up
          </button>
        </div>
        {errorMsg != null && (
          <div className="w-full flex justify-center">
            <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
          </div>
        )}
        {successMsg != null && (
          <div className="w-full flex justify-center">
            <p className="mt-2 text-sm text-green-500">{successMsg}</p>
          </div>
        )}
        <div className="w-full flex justify-end mt-5">
          <Link to="/login">
            {successMsg ? (
              <span className="text-gray-600 font-medium">Log In now!</span>
            ) : (
              <span className="text-gray-600 font-medium">
                Already have an account?
              </span>
            )}
          </Link>
        </div>
      </form>
    </div>
  );
}
