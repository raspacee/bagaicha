import { CreateFoodForm, createFoodSchema, FetchedFood } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FOOD_CATEGORIES, FOOD_CUISINES } from "@/lib/config";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  useCreatePlaceFood,
  useDeletePlaceFood,
  useFetchPlaceFoods,
  useUpdatePlaceFood,
} from "@/api/FoodApi";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus } from "lucide-react";

type Props = { placeId: string };

const PlaceFoodForm = ({ placeId }: Props) => {
  const form = useForm<CreateFoodForm>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: { name: "", category: "", cuisine: "", price: 0 },
  });
  const [showAddFood, setShowAddFood] = useState(false);
  const { foods, isLoading: isFoodsLoading } = useFetchPlaceFoods(placeId);
  const { createFood, isPending: isCreating } = useCreatePlaceFood(placeId);
  const { deleteFood, isPending: isDeleting } = useDeletePlaceFood(placeId);
  const { updateFood, isPending: isUpdating } = useUpdatePlaceFood(placeId);

  const onSubmit = async (food: CreateFoodForm) => {
    await createFood(food);
    form.reset();
  };

  return (
    <div className="w-full">
      <h1 className="self-start font-bold text-xl">Foods</h1>
      {!showAddFood && (
        <Button
          className="my-2 flex gap-2"
          onClick={() => setShowAddFood(true)}
        >
          <Plus />
          Add New Food
        </Button>
      )}
      {showAddFood && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Food Name"
                      className="w-[15rem]"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cuisine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block">Food Cuisine</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[10rem]">
                        <SelectValue placeholder="Select Cuisine" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[16rem]">
                        {FOOD_CUISINES.map((value) => (
                          <SelectItem value={value} key={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Category</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[10rem]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[16rem]">
                        {FOOD_CATEGORIES.map((value) => (
                          <SelectItem value={value} key={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Price (in Rs)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter Food Price"
                      className="w-[15rem]"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors.price?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="reset"
                className="bg-red-700 hover:bg-red-800"
                onClick={() => {
                  setShowAddFood(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-fit bg-green-700 hover:bg-green-800"
                disabled={isCreating}
              >
                Add Food
              </Button>
            </div>
          </form>
        </Form>
      )}
      <div className="flex flex-col md:flex-row gap-2 flex-wrap mt-2">
        {foods ? (
          foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              deleteFood={deleteFood}
              isDeleting={isDeleting}
              updateFood={updateFood}
              isUpdating={isUpdating}
            />
          ))
        ) : (
          <h1>No Food Added Yet</h1>
        )}
      </div>
    </div>
  );
};

const FoodItem = ({
  food,
  isDeleting,
  deleteFood,
  updateFood,
  isUpdating,
}: {
  food: FetchedFood;
  isDeleting: boolean;
  deleteFood: (foodId: number) => void;
  updateFood: (food: FetchedFood) => Promise<void>;
  isUpdating: boolean;
}) => {
  const form = useForm<FetchedFood>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: {
      id: food.id,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      price: food.price,
    },
  });

  const onSubmit = async (formDataJson: FetchedFood) => {
    formDataJson.id = food.id;
    await updateFood(formDataJson);
  };

  return (
    <Card className="w-[250px]">
      <CardHeader>
        <CardTitle>{food.name}</CardTitle>
        <CardDescription>Price - Rs.{food.price}</CardDescription>
        <CardDescription>Category - {food.category}</CardDescription>
        <CardDescription>Cuisine - {food.cuisine}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Update</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Food</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Food name"
                          className="w-[15rem]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-[15rem]">
                            <SelectValue placeholder="Select Cuisine" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[16rem]">
                            {FOOD_CUISINES.map((value) => (
                              <SelectItem value={value} key={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-[10rem]">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[16rem]">
                            {FOOD_CATEGORIES.map((value) => (
                              <SelectItem value={value} key={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter Food Price"
                          className="w-[15rem]"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs">
                        {form.formState.errors.price?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving changes" : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Button
          type="button"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => deleteFood(food.id)}
          disabled={isDeleting}
        >
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlaceFoodForm;
