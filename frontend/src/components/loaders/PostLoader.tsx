import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PostLoader() {
  return (
    <>
      <Skeleton
        circle={true}
        width={40}
        height={40}
        style={{ marginBottom: 10 }}
      />
      <Skeleton height={150} style={{ marginBottom: 10 }} />
      <Skeleton count={3} />
    </>
  );
}
