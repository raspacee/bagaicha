import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  useCreateOperatingHour,
  useDeleteOperatingHour,
  useGetOperatingHours,
} from "@/api/PlaceApi";
import { DateTime } from "luxon";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddOperatingHourForm,
  addOperatingHourSchema,
  OperatingHourForm,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS } from "@/lib/config";
import { TimePicker } from "../ui/time-picker";
import { extractTimeFromDate } from "@/lib/helpers";

type Props = {
  placeId: string;
};

const PlaceOperatingHourForm = ({ placeId }: Props) => {
  const { isLoading, operatingHours } = useGetOperatingHours(placeId);
  const form = useForm<AddOperatingHourForm>({
    resolver: zodResolver(addOperatingHourSchema),
    defaultValues: {
      placeId: placeId,
    },
  });

  const [addingOperatingHour, setAddingOperatingHour] = useState(false);

  const closeAddingForm = () => {
    setAddingOperatingHour(false);
    form.reset();
  };
  const { createOperatingHour, isPending: isCreating } = useCreateOperatingHour(
    placeId,
    closeAddingForm
  );
  const { deleteOperatingHour, isPending: isDeleting } =
    useDeleteOperatingHour(placeId);

  const onSubmit = (formDataJson: AddOperatingHourForm) => {
    let newForm: OperatingHourForm = {
      day: formDataJson.day,
      placeId: placeId,
    };
    if (formDataJson.openingTime && formDataJson.closingTime) {
      newForm.openingTime = extractTimeFromDate(formDataJson.openingTime);
      newForm.closingTime = extractTimeFromDate(formDataJson.closingTime);
    }
    createOperatingHour(newForm);
  };

  if (isLoading) return <LoaderCircle className="animate-spin" />;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold mb-4">Operating Hours</h2>
      {isLoading && <p>Loading...</p>}
      {!isLoading &&
        operatingHours &&
        operatingHours.length > 0 &&
        operatingHours.map((operatingHour) => (
          <div
            key={operatingHour.id!}
            className="flex flex-row gap-3 items-center"
          >
            <p className="font-semibold">{operatingHour.day}</p>
            {operatingHour.openingTime && operatingHour.closingTime && (
              <p>
                {`${DateTime.fromFormat(
                  operatingHour.openingTime,
                  "hh:mm:ss"
                ).toFormat("hh:mm a")}
                - ${DateTime.fromFormat(
                  operatingHour.closingTime,
                  "hh:mm:ss"
                ).toFormat("hh:mm a")}`}
              </p>
            )}
            <Button
              onClick={() => deleteOperatingHour(operatingHour.id!)}
              variant="ghost"
              className="text-red-600 px-0"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting" : "Delete"}
            </Button>
          </div>
        ))}
      {!isLoading && !operatingHours && (
        <h2>Add some operating hours from below</h2>
      )}
      {addingOperatingHour && (
        <div className="flex flex-row gap-3 items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2 items-center justify-center border px-4 py-3 rounded-md"
            >
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.filter(
                            (day) =>
                              !operatingHours?.some(
                                (el) =>
                                  el.day.toLowerCase() === day.toLowerCase()
                              )
                          ).map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <p className="text-red-600 text-sm">
                      {form.formState.errors.day?.message}
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openingTime"
                render={({ field }) => (
                  <FormItem>
                    <h4 className="text-sm font-normal">
                      Opening Time (24 Hour format)
                    </h4>
                    <FormControl>
                      <TimePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="closingTime"
                render={({ field }) => (
                  <FormItem>
                    <h4 className="text-sm font-normal">
                      Closing Time (24 Hour format)
                    </h4>
                    <FormControl>
                      <TimePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <p className="text-red-600 text-sm">
                {form.formState.errors.openingTime?.message}
              </p>
              <div className="flex flex-row justify-between gap-2">
                <Button
                  type="submit"
                  variant="ghost"
                  className="text-green-600"
                  disabled={isCreating}
                >
                  {isCreating ? "Saving" : "Save"}
                </Button>
                <Button
                  onClick={closeAddingForm}
                  type="reset"
                  variant="ghost"
                  className="text-red-600"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      {(!operatingHours || (operatingHours && operatingHours.length < 7)) && (
        <Button
          type="button"
          className="flex gap-2 bg-white text-black border border-black hover:bg-gray-300 hover:border-gray-300 w-fit"
          onClick={() => setAddingOperatingHour(true)}
          disabled={addingOperatingHour}
        >
          <Plus />
          Add an operating hour
        </Button>
      )}
    </div>
  );
};

export default PlaceOperatingHourForm;
