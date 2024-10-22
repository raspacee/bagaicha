import {
  EditPlaceForm,
  editPlaceFormSchema,
  PlaceWithRating,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { FormLabel } from "@mui/material";
import { Separator } from "../ui/separator";
import SearchFoodItemInput from "./SearchFoodItemInput";
import SearchPlaceFeatureInput from "./SearchPlaceFeatureInput";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Trash2 } from "lucide-react";
import { useUpdatePlaceData } from "@/api/PlaceApi";
import OperatingHourForm from "./OperatingHourForm";
import { useState } from "react";
import PlaceFeatureForm from "./PlaceFeatureForm";
import PlaceFoodForm from "./PlaceFoodForm";

type Props = {
  place: PlaceWithRating;
};

const UpdatePlaceForm = ({ place }: Props) => {
  const form = useForm<EditPlaceForm>({
    resolver: zodResolver(editPlaceFormSchema),
    defaultValues: {
      name: place.name,
      foodsOffered: place.foodsOffered,
      coverImgUrl: place.coverImgUrl,
      placeFeatures: place.placeFeatures,
      contactNumbers: place.contactNumbers,
      instagramLink: place.instagramLink,
      websiteLink: place.websiteLink,
    },
  });
  const { updatePlace, isPending } = useUpdatePlaceData();
  const [contactInput, setContactInput] = useState("");

  const existingImageUrl = form.watch("coverImgUrl");

  const onSubmit = (formDataJson: EditPlaceForm) => {
    const formData = new FormData();
    formData.append("name", formDataJson.name);
    formData.append(
      "placeFeatures",
      JSON.stringify(formDataJson.placeFeatures)
    );
    formData.append("foodsOffered", JSON.stringify(formDataJson.foodsOffered));
    if (formDataJson.newCoverImgFile) {
      formData.append("image", formDataJson.newCoverImgFile);
    } else {
      formData.append("coverImgUrl", formDataJson.coverImgUrl as string);
    }
    formData.append("placeId", place.id);
    formData.append("websiteLink", JSON.stringify(formDataJson.websiteLink));
    formData.append(
      "instagramLink",
      JSON.stringify(formDataJson.instagramLink)
    );
    formData.append(
      "contactNumbers",
      JSON.stringify(formDataJson.contactNumbers)
    );
    updatePlace(formData);
  };

  return (
    <>
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
            name="websiteLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Website link here"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="instagramLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Instagram link here"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="contactNumbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Numbers</FormLabel>
                <FormControl>
                  <ul>
                    {field.value
                      ? field.value.map((number) => (
                          <li
                            key={number}
                            className="text-sm cursor-pointer w-[15rem] flex gap-2 items-center"
                          >
                            <span>{number}</span>
                            <Button
                              variant="ghost"
                              type="button"
                              className="text-red-600"
                              onClick={() =>
                                field.onChange(
                                  field.value?.filter((no) => no !== number)
                                )
                              }
                            >
                              <Trash2 />
                            </Button>
                          </li>
                        ))
                      : "Empty"}
                    <Input
                      type="text"
                      placeholder="Enter number here"
                      className="w-[13rem]"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                    <Button
                      className="my-2"
                      onClick={() => {
                        if (contactInput.length > 3) {
                          field.onChange([...field.value!, contactInput]);
                          setContactInput("");
                        }
                      }}
                      type="button"
                    >
                      Add
                    </Button>
                  </ul>
                </FormControl>
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
      <Separator className="my-2" />
      <div className="flex flex-col gap-3 w-full">
        <OperatingHourForm placeId={place.id} />
      </div>
      <Separator className="my-2" />
      <PlaceFeatureForm placeId={place.id} />
      <Separator className="my-2" />
      <PlaceFoodForm placeId={place.id} />
      <div className="h-[10rem]"></div>
    </>
  );
};

export default UpdatePlaceForm;
