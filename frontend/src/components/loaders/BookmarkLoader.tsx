import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BookmarkLoader() {
  return (
    <div className="w-full bg-white rounded-md shadow-xl my-3 py-3 px-3">
      <Skeleton count={3} />
      <Skeleton width={200} height={250} />
    </div>
  );
}
