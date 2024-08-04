import { useAuthenticateUser } from "../api/AuthApi";
import { Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { data, isLoading } = useAuthenticateUser();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return data?.authenticated ? <Outlet /> : <h1>Invalid user token</h1>;
};

export default AuthenticatedRoute;
