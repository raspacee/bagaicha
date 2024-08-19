import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { UpdateProfileForm, updateProfileFormSchema, User } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { useUpdateUserProfile } from "@/api/UserApi";

type Props = {
  user: User;
};

const UpdateUserProfileForm = ({ user }: Props) => {
  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || "",
      profilePictureUrl: user.profilePictureUrl,
    },
  });
  const { updateUser, isPending } = useUpdateUserProfile();

  const onSubmit = (formDataJson: UpdateProfileForm) => {
    const formData = new FormData();
    formData.append("firstName", formDataJson.firstName);
    formData.append("lastName", formDataJson.lastName);
    formData.append("bio", formDataJson.bio);
    if (formDataJson.newProfilePictureImage) {
      formData.append(
        "newProfilePictureImage",
        formDataJson.newProfilePictureImage
      );
    } else {
      formData.append(
        "profilePictureUrl",
        formDataJson.profilePictureUrl as string
      );
    }
    updateUser(formData);
  };

  const existingProfilePictureUrl = form.watch("profilePictureUrl");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col items-center w-full">
          {existingProfilePictureUrl && (
            <img
              className="w-[7rem] h-[7rem] rounded-full object-cover"
              src={existingProfilePictureUrl}
            />
          )}
        </div>
        <FormField
          control={form.control}
          name="newProfilePictureImage"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]);
                      const newImageUrl = URL.createObjectURL(
                        e.target.files[0]
                      );
                      form.setValue("profilePictureUrl", newImageUrl);
                    } else {
                      field.onChange(null);
                    }
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.newProfilePictureImage?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="First Name" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="Last Name" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Bio" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Update
        </Button>
      </form>
    </Form>
  );
};

export default UpdateUserProfileForm;
