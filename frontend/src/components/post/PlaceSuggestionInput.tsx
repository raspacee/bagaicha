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
import { useState } from "react";
import { Button } from "../ui/button";
import { ControllerRenderProps, useFormContext } from "react-hook-form";
import { Place } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

const PlaceSuggestionInput = () => {
  const [open, setOpen] = useState(false);

  const { watch, setValue } = useFormContext();

  const placeId: string = watch("placeId");
  const placeName: string = watch("placeName");

  const [debouncedQuery] = useDebounce(placeName, 250);

  const BASE_API_URL = import.meta.env.VITE_API_URL;

  const getPlaceSuggestionRequest = async (): Promise<Place[]> => {
    const response = await fetch(
      `${BASE_API_URL}/place/suggestion/${placeName}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Error getting place suggestion");
    }
    return response.json();
  };

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", debouncedQuery],
    queryFn: getPlaceSuggestionRequest,
    enabled: placeName.length > 0,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1"
        >
          {placeId && suggestions
            ? suggestions.find((suggestion) => suggestion.id == placeId)?.name
            : "Search Place"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="">
        <Command>
          <CommandInput
            placeholder="Search Place"
            name="placeName"
            value={placeName}
            onValueChange={(value) => {
              setValue("placeName", value);
            }}
          />
          <CommandList>
            <CommandEmpty>No Place Found</CommandEmpty>
            <CommandGroup>
              {suggestions?.map((suggestion) => {
                const value = suggestion.road
                  ? `${suggestion.name}, ${suggestion.road}, ${suggestion.neighbourhood}`
                  : `${suggestion.name}, ${suggestion.neighbourhood}`;

                return (
                  <CommandItem
                    key={suggestion.id}
                    value={suggestion.name}
                    onSelect={(currentName) => {
                      setValue("placeId", suggestion.id);
                      setValue("placeName", currentName);
                      setOpen(false);
                    }}
                  >
                    {value}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PlaceSuggestionInput;
