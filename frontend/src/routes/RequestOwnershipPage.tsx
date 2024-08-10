import { useGetPlaceData, useRequestOwnership } from "@/api/PlaceApi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OwnershipRequestForm, ownershipRequestFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const RequestOwnershipPage = () => {
  const { placeId } = useParams();
  const { place, isLoading } = useGetPlaceData(placeId as string);
  const { requestOwnership, isPending } = useRequestOwnership(
    placeId as string
  );

  const form = useForm<OwnershipRequestForm>({
    resolver: zodResolver(ownershipRequestFormSchema),
    defaultValues: {
      placeId: placeId,
    },
  });

  const onSubmit = (formDataJson: OwnershipRequestForm) => {
    const formData = new FormData();
    formData.append("placeId", formDataJson.placeId);
    formData.append("documentImage", formDataJson.documentImageFile);
    requestOwnership(formData);
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!place) {
    return <h1>Place not found</h1>;
  }

  return (
    <div className="w-full md:w-[80%] bg-white rounded-md shadow px-4 py-10 flex flex-col gap-3 items-center">
      <h1 className="text-3xl font-extrabold mb-5">
        Place Ownership Request Form
      </h1>
      <p>Document verification may take upto 5 days</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-3 items-center"
        >
          <FormField
            control={form.control}
            name="placeId"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Place ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    disabled={true}
                    className="text-lg"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Place Name</FormLabel>
            <Input
              type="text"
              disabled={true}
              value={place.name}
              className="text-lg"
            />
          </FormItem>
          <FormField
            control={form.control}
            name="documentImageFile"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Upload Document</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormDescription>
            Only pictures of business registration or tax documents are accepted
          </FormDescription>
          <Button type="submit" className="px-10" disabled={isPending}>
            Request Ownership
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RequestOwnershipPage;
