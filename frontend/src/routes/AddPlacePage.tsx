import { useCreatePlace } from "@/api/PlaceApi";
import { useGetMyUserData } from "@/api/UserApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NEPAL_STATES } from "@/lib/config";
import { AddPlaceForm, addPlaceFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

const AddPlacePage = () => {
  const form = useForm<AddPlaceForm>({
    resolver: zodResolver(addPlaceFormSchema),
    defaultValues: {
      name: "",
      city: "",
      lat: 0,
      lon: 0,
      neighbourhood: "",
      ownedBy: undefined,
      road: "",
      state: "",
      imageFiles: [],
      instagramLink: "",
      websiteLink: "",
    },
  });
  const { createPlace, isPending } = useCreatePlace();

  const { myUser } = useGetMyUserData();

  const images: File[] | undefined = form.watch("imageFiles");

  const onSubmit = (formDataJson: AddPlaceForm) => {
    const formData = new FormData();
    formData.append("name", formDataJson.name);
    formData.append("road", formDataJson.road);
    formData.append("neighbourhood", formDataJson.neighbourhood);
    formData.append("city", formDataJson.city);
    formData.append("state", formDataJson.state);
    formData.append("instagramLink", formDataJson.instagramLink || "");
    formData.append("websiteLink", formDataJson.websiteLink || "");
    formData.append("lat", formDataJson.lat.toString());
    formData.append("lon", formDataJson.lon.toString());
    formData.append("imageFiles[]", formDataJson.imageFiles[0]);
    formData.append("imageFiles[]", formDataJson.imageFiles[1]);
    formData.append("ownedBy", JSON.stringify(formDataJson.ownedBy));
    createPlace(formData);
  };

  return (
    <div className="px-2 md:px-4 py-2 pb-10">
      <h1 className="text-3xl font-black mb-4">Add Place Page</h1>
      <h2 className="text-sm font-bold text-muted-foreground">
        * are required fields
      </h2>
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
                <FormLabel>Place Name*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter place name" />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.name?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageFiles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Place Images (atleast 2 required)*</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      field.onChange(
                        e.target.files ? Array.from(e.target.files) : []
                      )
                    }
                    multiple
                  />
                </FormControl>
                <FormDescription className="w-full flex flex-col md:flex-row gap-2">
                  {images &&
                    images.map((image) => (
                      <div className="w-full md:w-[35rem]">
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={URL.createObjectURL(image)}
                            className="object-cover rounded-md h-full w-full"
                          />
                        </AspectRatio>
                      </div>
                    ))}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="road"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Road Location*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter road location" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.road?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighbourhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Neighbourhood Location*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter neighbourhood location"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.neighbourhood?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city location" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.city?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State*</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[14rem]">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="h-[12rem]">
                      {NEPAL_STATES.map((state) => (
                        <SelectItem value={state} key={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.city?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Latitude*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter place latitude"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.lat?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Longitude*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter place longitude"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.lon?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="websiteLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Link</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business website link" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.websiteLink?.message}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instagramLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter business instagram link"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-red-500">
                  {form.formState.errors.instagramLink?.message}
                </FormDescription>
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
