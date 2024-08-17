import { FormControl, FormItem, FormLabel } from "../ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { PlaceFeature, placeFeatureSchema } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

const SearchPlaceFeatureInput = () => {
  const [open, setOpen] = useState(false);
  const form = useFormContext();

  const placeFeatures: PlaceFeature[] | undefined = form.watch("placeFeatures");

  return (
    <FormItem className="flex flex-col gap-2">
      <FormLabel>Search features that your place offers</FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[10rem] justify-between"
            >
              Add a Feature Item
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[14rem] p-0">
            <Command>
              <CommandInput placeholder="Type a feature" />
              <CommandList>
                <CommandEmpty>No item found</CommandEmpty>
                <CommandGroup>
                  {placeFeatureSchema.options.map((feature) => (
                    <CommandItem
                      key={feature}
                      value={feature}
                      onSelect={(currentValue) => {
                        setOpen(false);
                        const oldFeatures =
                          form.getValues("placeFeatures") || [];
                        if (!oldFeatures.includes(currentValue)) {
                          form.setValue("placeFeatures", [
                            currentValue,
                            ...oldFeatures,
                          ]);
                        }
                      }}
                    >
                      {feature}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Place Features</CardTitle>
          <CardDescription>
            Make your place more appealing to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[8rem] w-full">
            <div className="flex gap-1 flex-wrap">
              {placeFeatures &&
                placeFeatures.map((item) => (
                  <Badge variant="default" key={item}>
                    {item}
                  </Badge>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </FormItem>
  );
};

export default SearchPlaceFeatureInput;
