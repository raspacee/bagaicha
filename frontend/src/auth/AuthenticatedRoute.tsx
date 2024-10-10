import { useAuthenticateUser } from "../api/AuthApi";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { data, isLoading } = useAuthenticateUser();
  const location = useLocation();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return data?.authenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`login?redirectTo=${location.pathname || "feed"}`} replace />
  );
};

export default AuthenticatedRoute;
