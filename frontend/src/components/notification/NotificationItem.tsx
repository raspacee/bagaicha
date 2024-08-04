type Props = {
  imageUrl: string;
  message: string;
  date: string;
};

const NotificationItem = ({ imageUrl, message, date }: Props) => {
  return (
    <div className="w-full flex justify-center items-center my-2">
      <img
        src={imageUrl}
        style={{
          width: "45px",
          height: "45px",
        }}
        className="rounded-full object-cover"
      />
      <div className="ml-2">
        <p className="font-regular text-gray-600">{message}</p>
        <span className="font-medium">{date}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
