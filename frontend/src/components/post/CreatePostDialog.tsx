import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { CircleUserRound, LogIn, MapPinHouse } from "lucide-react";
import { Rating } from "@mui/material";
import { Button } from "../ui/button";
import { useCreatePost } from "@/api/PostApi";
import { AspectRatio } from "../ui/aspect-ratio";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { useGetMyUserData } from "@/api/UserApi";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const createPostSchema = z.object({
  placeName: z.string().min(1).max(300),
  placeId: z.string().optional(),
  rating: z.coerce
    .number({
      required_error: "Rating is required",
    })
    .min(1)
    .max(5),
  body: z.string().min(1).max(500),
  image: z.instanceof(File, { message: "Image is required" }),
});

export type CreatePostForm = z.infer<typeof createPostSchema>;

const CreatePostDialog = () => {
  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      placeName: "",
      body: "",
      placeId: "",
    },
  });
  const [open, setOpen] = useState(false);

  const { createPost, isPending, isSuccess } = useCreatePost();
  const { myUser } = useGetMyUserData();

  const image: File | undefined = form.watch("image");

  const onSubmit = (formDataJson: CreatePostForm) => {
    const formData = new FormData();
    formData.append("placeId", formDataJson.placeId!);
    formData.append("body", formDataJson.body);
    formData.append("rating", formDataJson.rating.toString());
    formData.append("placeName", formDataJson.placeName);
    formData.append("image", formDataJson.image);
    if (form.getValues("placeId")?.trim() == "") {
      toast.error("Please pick a valid place");
    } else {
      createPost(formData);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
    }
  }, [isSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full"
        onClick={(e) => {
          if (!myUser) {
            e.preventDefault();
            toast.error("Please login to create a post");
          }
        }}
      >
        <div className="flex flex-row gap-5 items-center">
          <Avatar>
            <AvatarImage src={myUser?.profilePictureUrl} />
            <AvatarFallback>
              <CircleUserRound />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-lg text-muted-foreground hover:bg-slate-200 hover:rounded-full">
            {myUser
              ? `Want to share something, ${myUser.firstName}?`
              : "Log in to start sharing posts"}
          </h1>
        </div>
      </DialogTrigger>
      <DialogContent className="h-screen md:h-[90vh] flex flex-col gap-6">
        <DialogHeader className="h-[2rem]">
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="">
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-3"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="placeName"
                    render={({ field }) => (
                      <FormItem className="flex gap-2 items-center">
                        <FormLabel>
                          <MapPinHouse />
                        </FormLabel>
                        <FormControl>
                          <PlaceSuggestionInput />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="flex gap-2 items-center md:flex-row flex-col">
                        <FormLabel>
                          <p
                            className={`${
                              form.formState.errors.rating && "text-red-500"
                            }`}
                          >
                            Rate the food
                          </p>
                        </FormLabel>
                        <FormControl>
                          <Rating
                            name="rating"
                            className="h-[2rem]"
                            size="large"
                            value={field.value}
                            onChange={(e, rating) =>
                              form.setValue("rating", rating || 3)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select an image</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(
                                e.target.files ? e.target.files[0] : null
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {image && (
                    <div className="bg-red-200">
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={URL.createObjectURL(image)}
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  )}
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How was your experience</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe Here"
                            className={`${
                              form.formState.errors?.body && "border-red-500"
                            }`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  Create Post
                </Button>
              </form>
            </FormProvider>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
