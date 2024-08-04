import { useAuthenticateUser } from "../api/AuthApi";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { data, isLoading } = useAuthenticateUser();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return data?.authenticated ? <Outlet /> : <Navigate to="login" />;
};

export default AuthenticatedRoute;
