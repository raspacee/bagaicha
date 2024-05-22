import { DateTime } from "luxon";
import { motion } from "framer-motion";

import { useAppSelector } from "../../hooks";

export default function NotificationModel() {
  const state = useAppSelector((state) => state.modal.notificationModal);

  if (!state.display) {
    return null;
  }

  return (
    <motion.div
      initial={{
        scale: 0,
      }}
      animate={{
        scale: 1,
      }}
      style={{
        transformOrigin: "top",
      }}
      className="absolute left-0 top-10 z-50 bg-white h-screen w-96 px-4 py-2 -translate-x-10 
      shadow-xl border border-gray-600 rounded-md overflow-scroll"
    >
      <h1 className="font-bold text-2xl text-black text-center select-none">
        Notifications
      </h1>
      <h1 className="font-bold text-xl text-black select-none">Earlier</h1>
      <div className="mt-4">
        {state.notifications.length > 0 ? (
          state.notifications.map((n) => {
            if (n.object_type == "review" && n.action_type == "like") {
              return (
                <div className="w-full flex justify-center items-center my-2">
                  <img
                    src={n.actor_picture}
                    style={{
                      width: "45px",
                      height: "45px",
                    }}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-2">
                    <p className="font-regular text-gray-600">
                      {n.actor} liked your review
                    </p>
                    <span className="font-medium">
                      {DateTime.fromISO(n.created_at).toRelative()}
                    </span>
                  </div>
                </div>
              );
            } else if (n.object_type == "comment" && n.action_type == "like") {
              return (
                <div className="w-full flex justify-center items-center my-2">
                  <img
                    src={n.actor_picture}
                    style={{
                      width: "45px",
                      height: "45px",
                    }}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-2">
                    <p className="font-regular text-gray-600">
                      {n.actor} liked your comment
                    </p>
                    <span className="font-medium">
                      {DateTime.fromISO(n.created_at).toRelative()}
                    </span>
                  </div>
                </div>
              );
            } else if (
              n.object_type == "review" &&
              n.action_type == "comment"
            ) {
              return (
                <div className="w-full flex justify-center items-center my-2">
                  <img
                    src={n.actor_picture}
                    style={{
                      width: "45px",
                      height: "45px",
                    }}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-2">
                    <p className="font-regular text-gray-600">
                      {n.actor} commented on your post
                    </p>
                    <span className="font-medium">
                      {DateTime.fromISO(n.created_at).toRelative()}
                    </span>
                  </div>
                </div>
              );
            }
          })
        ) : (
          <p className="text-gray-600">You have no notifications</p>
        )}
      </div>
    </motion.div>
  );
}
