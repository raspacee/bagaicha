import { useAuthenticateOwner } from "@/api/AuthApi";
import React from "react";
import { Navigate, useParams } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const CanEditPlace = ({ children }: Props) => {
  const { placeId } = useParams();

  const { isError, isLoading, isSuccess } = useAuthenticateOwner(
    placeId as string
  );

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  return isSuccess ? children : <Navigate to="/not-authorized" replace />;
};

export default CanEditPlace;
