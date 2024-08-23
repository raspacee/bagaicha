import Cookies from "universal-cookie";

import { AUTH_TOKEN_NAME } from "../lib/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AdminVerifyResponse,
  JwtUserData,
  LoginForm,
  LoginResponse,
  ResetPasswordForm,
  SignupForm,
} from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

type AuthenticateUserResponse = {
  authenticated: Boolean;
  user: JwtUserData | null;
};

export const useAuthenticateUser = () => {
  const authenticateUserRequest =
    async (): Promise<AuthenticateUserResponse> => {
      if (!cookies.get(AUTH_TOKEN_NAME)) {
        return new Promise((resolve) =>
          resolve({ authenticated: false, user: null })
        );
      }
      const response = await fetch(`${BASE_API_URL}/auth/authenticate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      });

      return response.json();
    };

  const { data, isLoading, error } = useQuery({
    queryKey: ["authenticateUser"],
    queryFn: authenticateUserRequest,
    retry: false,
  });

  /* TODO: If error throw a toast, clean user auths and redirect to login */

  return { data, isLoading };
};

export const useLoginUser = () => {
  const navigate = useNavigate();

  const loginUserRequest = async (
    data: LoginForm
  ): Promise<LoginResponse | null> => {
    const response = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status == 401)
        throw new Error("Email or password incorrect");
      else throw new Error("Error while logging in");
    }
    return response.json();
  };

  const { mutateAsync: loginUser, isPending } = useMutation({
    mutationFn: loginUserRequest,
    onSuccess: (data) => {
      cookies.set(AUTH_TOKEN_NAME, data!.token);
      navigate("/feed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { loginUser, isPending };
};

export const useSignupUser = () => {
  const navigate = useNavigate();

  const signupUserRequest = async (data: SignupForm) => {
    const response = await fetch(`${BASE_API_URL}/auth/signup`, {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status == 409) throw new Error("Email is already used");
      else throw new Error("Error while signing up");
    }
  };

  const { mutateAsync: signupUser, isPending } = useMutation({
    mutationFn: signupUserRequest,
    onSuccess: () => {
      toast.success("Signup Successful, please login");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { signupUser, isPending };
};

export const useAuthenticateAdmin = () => {
  const navigate = useNavigate();

  const authenticateAdminRequest =
    async (): Promise<AdminVerifyResponse | null> => {
      const response = await fetch(`${BASE_API_URL}/auth/admin`, {
        method: "post",
        headers: {
          Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json();
    };

  const { isSuccess, isError, isLoading } = useQuery({
    queryKey: ["admin"],
    queryFn: authenticateAdminRequest,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Unauthorized to access admin page");
      navigate("/feed");
    }
  }, [isError]);

  return {
    isSuccess,
    isLoading,
  };
};

export const useAuthenticateOwner = (placeId: string) => {
  const authOwnerRequest = async () => {
    const response = await fetch(
      `${BASE_API_URL}/place/${placeId}/checkPermission`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error();
    }
    return true;
  };

  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ["isPlaceOwner"],
    queryFn: authOwnerRequest,
    retry: false,
  });

  return { isError, isLoading, isSuccess };
};

export const useForgotPassword = () => {
  const forgotPasswordRequest = async (email: string) => {
    const response = await fetch(`${BASE_API_URL}/auth/forgot-password`, {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: forgotPassword,
    isPending,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: forgotPasswordRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { forgotPassword, isPending, isSuccess };
};

export const useResetPassword = (resetToken: string) => {
  const navigate = useNavigate();

  const resetPasswordRequest = async (form: ResetPasswordForm) => {
    const response = await fetch(
      `${BASE_API_URL}/auth/reset-password/${resetToken}`,
      {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: resetPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      toast.success("Password change successful, please login now");
      navigate("/login");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { resetPassword, isPending };
};

export const useAuthenticateOAuth2 = () => {
  const navigate = useNavigate();

  const oauth2Request = async (code: string): Promise<LoginResponse | null> => {
    const response = await fetch(`${BASE_API_URL}/auth/oauth2/verify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const { mutateAsync: sendOAuth2Code, isPending } = useMutation({
    mutationFn: oauth2Request,
    onError: (error) => {
      toast.error(error.message);
      navigate("/login");
    },
    onSuccess: (data) => {
      cookies.set(AUTH_TOKEN_NAME, data!.token);
      navigate("/feed");
    },
  });

  return { sendOAuth2Code, isPending };
};
