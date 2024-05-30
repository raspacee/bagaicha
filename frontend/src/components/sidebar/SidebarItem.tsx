import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { AUTH_TOKEN } from "../../lib/cookie_names";

export default function Item({
  isButton,
  text,
  link,
  children,
}: {
  isButton: boolean;
  text: string;
  link: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const cookies = new Cookies(null, {
    path: "/",
  });
  const logout = () => {
    cookies.remove(AUTH_TOKEN);
    navigate("/login");
  };
  return (
    <div>
      {isButton ? (
        <form onSubmit={logout}>
          <button
            type="submit"
            className="flex items-center justify-between my-5"
          >
            {children}
            <span className="ml-4">{text}</span>
          </button>
        </form>
      ) : (
        <Link to={link}>
          <div className="flex items-center justify-start my-5">
            {children}
            <span className="ml-4 select-none">{text}</span>
          </div>
        </Link>
      )}
    </div>
  );
}
