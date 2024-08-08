import { useGetMyUserData } from "@/api/UserApi";
import UpdateUserProfileForm from "@/components/forms/UpdateUserProfileForm";

const EditProfilePage = () => {
  const { myUser, isLoading } = useGetMyUserData();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!myUser) {
    return <h1>User not found</h1>;
  }

  return (
    <div className="rounded-md shadow w-full md:w-[80%] gap-3 flex flex-col bg-white px-6 py-4 items-center">
      <h1 className="text-3xl tracking-tight font-extrabold mb-4">
        Update Profile
      </h1>
      <UpdateUserProfileForm user={myUser} />
    </div>
  );
};

export default EditProfilePage;
