import { useCreatePlace } from "@/api/PlaceApi";
import { useGetMyUserData } from "@/api/UserApi";
import FilterByFoods from "@/components/forms/FilterByFoods";
import SearchPlaceFeatureInput from "@/components/forms/SearchPlaceFeatureInput";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AddPlaceForm, addPlaceFormSchema, daySchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

const AddPlacePage = () => {
  const form = useForm<AddPlaceForm>({
    resolver: zodResolver(addPlaceFormSchema),
  });
  const { createPlace, isPending } = useCreatePlace();

  const { myUser } = useGetMyUserData();

  const image: File | undefined = form.watch("imageFile");

  const onSubmit = (formDataJson: AddPlaceForm) => {
    const formData = new FormData();
    formData.append("name", formDataJson.name);
    formData.append("lat", formDataJson.lat);
    formData.append("lon", formDataJson.lon);
    formData.append("openDays", JSON.stringify(formDataJson.openDays));
    formData.append("foodsOffered", JSON.stringify(formDataJson.foodsOffered));
    formData.append(
      "placeFeatures",
      JSON.stringify(formDataJson.placeFeatures)
    );
    formData.append("imageFile", formDataJson.imageFile);
    formData.append("ownedBy", JSON.stringify(formDataJson.ownedBy));
    createPlace(formData);
  };

  return (
    <div className="px-2 md:px-4 py-2 pb-10">
      <h1 className="text-3xl font-black mb-4">Add Place Page</h1>
      {image && (
        <div className="w-full md:w-[35rem]">
          <AspectRatio ratio={16 / 9}>
            <img
              src={URL.createObjectURL(image)}
              className="object-cover rounded-md h-full w-full"
            />
          </AspectRatio>
        </div>
      )}
      <FormProvider {...form}>
        <form
          className="flex flex-col gap-2 w-full md:w-[25rem] mt-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter place name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Place Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) =>
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Latitude</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place latitude" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Longitude</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place longitude" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="foodsOffered"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foods Offered By The Place</FormLabel>
                <FormControl>
                  <FilterByFoods
                    foodsList={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeFeatures"
            render={({ field }) => <SearchPlaceFeatureInput />}
          />
          <FormField
            control={form.control}
            name="openDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select days when the place is open</FormLabel>
                {daySchema.options.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="openDays"
                    render={({ field }) => (
                      <FormItem
                        key={day.concat(day)}
                        className="flex space-x-2 items-center"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), day])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== day
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal !mb-1">
                          {day}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownedBy"
            render={({ field }) => (
              <FormItem className="flex gap-3 items-center">
                <FormLabel className="mt-2">Are you the place owner?</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value !== undefined}
                    onCheckedChange={(checked) =>
                      checked
                        ? field.onChange(myUser?.id)
                        : field.onChange(undefined)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-5" disabled={isPending}>
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddPlacePage;
