import { motion } from "framer-motion";

import { useAppSelector } from "../../hooks";

export default function SearchModal() {
  const display = useAppSelector((state) => state.modal.searchModal.display);

  if (!display) {
    return null;
  }
  const recentSearches = [
    {
      query: "himalayan java",
    },
    {
      query: "best momo",
    },
  ];
  return (
    <div className="absolute left-0 top-0 w-screen h-screen bg-black bg-opacity-80 z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, x: 30, transformOrigin: "top" }}
        className="absolute left-0 top-0 w-96 h-fit bg-white translate-x-16 p-2 shadow-xl border border-gray-200 rounded-md"
      >
        <h1 className="font-bold text-gray-800">Recent searches</h1>
        {recentSearches.length > 0 ? (
          recentSearches.map((s) => {
            return (
              <div className="w-full">
                <p className="text-gray-600">{s.query}</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-600">You have no recent searches</p>
        )}
        <div className="w-full border-t-2 border-t-gray-600 my-2"></div>
        <h1 className="font-bold text-gray-800">Search results</h1>
      </motion.div>
    </div>
  );
}
