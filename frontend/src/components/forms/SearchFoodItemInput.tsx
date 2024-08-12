import { FormControl, FormItem, FormLabel } from "../ui/form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { foodItems } from "@/config/foods";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import FoodsMenuCard from "../place/FoodsMenuCard";
import { useFormContext } from "react-hook-form";

const SearchFoodItemInput = () => {
  const [open, setOpen] = useState(false);
  const form = useFormContext();

  const foodsOffered = form.watch("foodsOffered");

  return (
    <FormItem className="flex flex-col gap-2">
      <FormLabel>Search delicious foods your place offers</FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[10rem] justify-between"
            >
              Add a Food Item
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[14rem] p-0">
            <Command>
              <CommandInput placeholder="Type a food name" />
              <CommandList>
                <CommandEmpty>No food item found</CommandEmpty>
                <CommandGroup>
                  {foodItems.map((food) => (
                    <CommandItem
                      key={food + Math.random()}
                      value={food}
                      onSelect={(currentValue) => {
                        setOpen(false);
                        const oldFoods = form.getValues("foodsOffered") || [];
                        if (!oldFoods.includes(currentValue)) {
                          form.setValue("foodsOffered", [
                            currentValue,
                            ...oldFoods,
                          ]);
                        }
                      }}
                    >
                      {food}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <FoodsMenuCard
              foodsOffered={foodsOffered}
              description="Selected Foods Appear Below"
            />
          </PopoverContent>
        </Popover>
      </FormControl>
    </FormItem>
  );
};

export default SearchFoodItemInput;
