import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const GenericLayout = ({ children }: Props) => {
  return (
    <div className="h-fit min-h-screen">
      <h1 className="text-5xl font-black tracking-tighter bg-blue-700 text-white py-5 text-center">
        <Link to="/login">bagaicha</Link>
      </h1>
      {children}
    </div>
  );
};

export default GenericLayout;
