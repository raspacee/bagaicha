import { CreatePlaceReviewForm, createPlaceReviewSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Rating } from "@mui/material";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { useCreatePlaceReview } from "@/api/PlaceReviewApi";

type Props = {
  placeId: string;
};

const CreateReviewForm = ({ placeId }: Props) => {
  const form = useForm<CreatePlaceReviewForm>({
    resolver: zodResolver(createPlaceReviewSchema),
    defaultValues: {
      body: "",
      image: undefined,
      placeId: placeId,
      rating: 0,
    },
  });
  const { createPlaceReview, isPending } = useCreatePlaceReview(placeId);

  const image = form.watch("image");

  const onSubmit = (form: CreatePlaceReviewForm) => {
    const formData = new FormData();
    formData.append("body", form.body);
    formData.append("rating", form.rating.toString());
    if (form.image) formData.append("image", form.image);
    createPlaceReview(formData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Rating</FormLabel>
              <FormMessage className="text-xs">
                {form.formState.errors.rating?.message}
              </FormMessage>
              <FormControl>
                <Rating
                  value={form.getValues("rating")}
                  onChange={(e, value) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Body</FormLabel>
              <FormMessage className="text-xs">
                {form.formState.errors.body?.message}
              </FormMessage>
              <FormControl>
                <Textarea {...field} placeholder="Enter review text body" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a photo (optional)</FormLabel>
              {image && (
                <button
                  className="text-red-600 ml-2 text-sm font-semibold"
                  onClick={() => field.onChange(null)}
                >
                  Remove
                </button>
              )}
              <FormControl>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]);
                    } else {
                      field.onChange(null);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {image && (
          <AspectRatio ratio={16 / 9}>
            <img
              src={URL.createObjectURL(image)}
              className="h-full object-contain"
            />
          </AspectRatio>
        )}
        <Button type="submit" disabled={isPending}>
          Add Review
        </Button>
      </form>
    </Form>
  );
};

export default CreateReviewForm;
