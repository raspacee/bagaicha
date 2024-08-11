import {
  daySchema,
  EditPlaceForm,
  editPlaceFormSchema,
  Place,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { AspectRatio } from "../ui/aspect-ratio";
import { FormLabel } from "@mui/material";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import SearchFoodItemInput from "./SearchFoodItemInput";
import SearchPlaceFeatureInput from "./SearchPlaceFeatureInput";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import { useUpdatePlaceData } from "@/api/PlaceApi";

type Props = {
  place: Place;
};

const UpdatePlaceForm = ({ place }: Props) => {
  const form = useForm<EditPlaceForm>({
    resolver: zodResolver(editPlaceFormSchema),
    defaultValues: {
      name: place.name,
      closingTime: place.closingTime,
      openingTime: place.openingTime,
      foodsOffered: place.foodsOffered,
      coverImgUrl: place.coverImgUrl,
      openDays: place.openDays,
      placeFeatures: place.placeFeatures,
    },
  });
  const { updatePlace, isPending } = useUpdatePlaceData();

  const existingImageUrl = form.watch("coverImgUrl");

  const onSubmit = (formDataJson: EditPlaceForm) => {
    const formData = new FormData();
    formData.append("name", formDataJson.name);
    formData.append(
      "placeFeatures",
      JSON.stringify(formDataJson.placeFeatures)
    );
    formData.append("openDays", JSON.stringify(formDataJson.openDays));
    formData.append("foodsOffered", JSON.stringify(formDataJson.foodsOffered));
    formData.append("openingTime", JSON.stringify(formDataJson.openingTime));
    formData.append("closingTime", JSON.stringify(formDataJson.closingTime));
    if (formDataJson.newCoverImgFile) {
      formData.append("image", formDataJson.newCoverImgFile);
    } else {
      formData.append("coverImgUrl", formDataJson.coverImgUrl as string);
    }
    formData.append("placeId", place.id);
    updatePlace(formData);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 w-full"
      >
        {existingImageUrl && (
          <div className="w-full h-[18rem]">
            <img
              src={existingImageUrl}
              alt="Photo"
              className="rounded-md object-cover w-full h-full"
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="newCoverImgFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload picture of your place</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]);
                      const newUrl = URL.createObjectURL(e.target.files[0]);
                      form.setValue("coverImgUrl", newUrl);
                    } else {
                      field.onChange(null);
                    }
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors?.newCoverImgFile?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Your Place Name" />
              </FormControl>
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="openDays"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-bold">Open Days</FormLabel>
              {daySchema.options.map((day) => (
                <FormField
                  key={day}
                  control={form.control}
                  name="openDays"
                  render={({ field }) => (
                    <FormItem
                      key={day.concat(day)}
                      className="flex flex-row gap-2 items-center"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(day)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), day])
                              : field.onChange(
                                  field.value?.filter((value) => value !== day)
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{day}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="foodsOffered"
          render={({ field }) => <SearchFoodItemInput />}
        />
        <Separator />
        <FormField
          control={form.control}
          name="placeFeatures"
          render={({ field }) => <SearchPlaceFeatureInput />}
        />
        <Separator />
        <Button
          className="w-[12rem] justify-between"
          type="submit"
          disabled={isPending}
        >
          Update Information
          <Save className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </form>
    </FormProvider>
  );
};

export default UpdatePlaceForm;
