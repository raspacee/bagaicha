import { IoIosStar } from "@react-icons/all-files/io/IoIosStar";

export default function RatingStar({
  size,
  filled,
}: {
  size: number;
  filled: number;
}) {
  return (
    <div className="flex">
      <IoIosStar size={size} fill={filled >= 1 ? "yellow" : "#d1d5db"} />
      <IoIosStar size={size} fill={filled >= 2 ? "yellow" : "#d1d5db"} />
      <IoIosStar size={size} fill={filled >= 3 ? "yellow" : "#d1d5db"} />
      <IoIosStar size={size} fill={filled >= 4 ? "yellow" : "#d1d5db"} />
      <IoIosStar size={size} fill={filled == 5 ? "yellow" : "#d1d5db"} />
    </div>
  );
}
