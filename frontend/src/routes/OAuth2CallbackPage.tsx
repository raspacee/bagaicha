import { useAuthenticateOAuth2 } from "@/api/AuthApi";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const OAuth2CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { sendOAuth2Code } = useAuthenticateOAuth2();

  useEffect(() => {
    sendOAuth2Code(code as string);
  }, []);

  return <h1>Loading</h1>;
};

export default OAuth2CallbackPage;
