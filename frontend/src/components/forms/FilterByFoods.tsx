import { FoodsOffered } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { foodItems } from "@/config/foods";
import FoodsMenuCard from "../place/FoodsMenuCard";

type Props = {
  foodsList: FoodsOffered[];
  onChange: (foodsList: FoodsOffered[]) => void;
};

const FilterByFoods = ({ foodsList, onChange }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const selectedFood = value as FoodsOffered;
    if (!foodsList.includes(selectedFood)) {
      const newFoodsList = [...foodsList, selectedFood];
      onChange(newFoodsList);
    }
    setOpen(false);
  };

  const handleDeleteFoodItem = (food: FoodsOffered) => {
    const newFoodsList = foodsList.filter((item) => item !== food);
    onChange(newFoodsList);
  };

  return (
    <div className="flex flex-col gap-2">
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
                {foodItems
                  .filter((food) => !foodsList.includes(food))
                  .map((food) => (
                    <CommandItem
                      key={food + Math.random()}
                      value={food}
                      onSelect={handleSelect}
                    >
                      {food}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FoodsMenuCard
        description="Selected Foods Appear Below"
        foodsOffered={foodsList}
        onClick={handleDeleteFoodItem}
      />
    </div>
  );
};

export default FilterByFoods;
