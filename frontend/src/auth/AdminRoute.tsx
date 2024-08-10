import { useAuthenticateAdmin } from "../api/AuthApi";
import { Navigate, Outlet } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: Props) => {
  const { isSuccess, isLoading } = useAuthenticateAdmin();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isSuccess) {
    return children;
  }
};

export default AdminRoute;
