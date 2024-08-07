import { NotificationWhole } from "@/lib/types";
import { DateTime } from "luxon";

type Props = {
  notification: NotificationWhole;
};

const NotificationItem = ({ notification }: Props) => {
  let content = "";

  switch (notification.type) {
    case "UserLikesPost":
      content = `${notification.authorFirstName} liked your post`;
      break;
    case "UserLikesComment":
      content = `${notification.authorFirstName} liked your comment`;
      break;
    case "UserCommentsOnPost":
      content = `${notification.authorFirstName} commented on your post`;
      break;
  }

  return (
    <div className="w-full flex justify-center items-center my-2">
      <img
        src={notification.authorPictureUrl}
        style={{
          width: "45px",
          height: "45px",
        }}
        className="rounded-full object-cover"
      />
      <div className="ml-2">
        <p className="font-regular text-gray-600">{content}</p>
        <span className="font-medium">
          {DateTime.fromISO(notification.createdAt!).toRelative()}
        </span>
      </div>
    </div>
  );
};

export default NotificationItem;
