import { useGetTopPlaces } from "@/api/PlaceApi";
import FilterByFoods from "@/components/forms/FilterByFoods";
import PlaceListItem from "@/components/place/PlaceListItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Distance,
  FindPlaceSearchState,
  FoodsOffered,
  PlaceFeature,
  placeFeatureSchema,
} from "@/lib/types";
import { Check } from "lucide-react";
import { ChangeEvent, useState } from "react";

const FindPlacesPage = () => {
  const [searchState, setSearchState] = useState<FindPlaceSearchState>({
    selectedDistance: null,
    selectedFeatures: [],
    selectedFoods: [],
  });

  const { places, isLoading } = useGetTopPlaces(searchState);

  const handlePlaceFeatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const clickedFeature = event.target.value;
    const isChecked = event.target.checked;

    const newFeatures = isChecked
      ? [...searchState.selectedFeatures, clickedFeature]
      : searchState.selectedFeatures.filter(
          (feature) => feature != clickedFeature
        );
    setSearchState({
      ...searchState,
      selectedFeatures: newFeatures as PlaceFeature[],
    });
  };

  const setSelectedFoods = (foodsList: FoodsOffered[]) => {
    setSearchState((prevState) => ({
      ...prevState,
      selectedFoods: foodsList,
    }));
  };

  const Distances = [1, 2, 5, 10];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="border-b md:border-b-0 md:border-r md:h-screen md:sticky md:top-0 py-3 px-2 flex flex-col gap-2 md:w-[33%]">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">Filter By Features</h1>
            <div className="flex flex-wrap gap-2">
              {placeFeatureSchema.options.map((feature) => {
                const isSelected =
                  searchState.selectedFeatures.includes(feature);
                return (
                  <div>
                    <Input
                      type="checkbox"
                      className="hidden"
                      id={`placeFeature_${feature}`}
                      value={feature}
                      checked={isSelected}
                      onChange={handlePlaceFeatureChange}
                    />
                    <Label
                      htmlFor={`placeFeature_${feature}`}
                      className={`flex flex-1 items-center cursor-pointer text-sm rounded-full px-4 py-2 font-semibold
                      ${
                        isSelected
                          ? "border border-green-600 text-green-600"
                          : "border border-slate-300"
                      }`}
                    >
                      {isSelected && <Check size={20} />}
                      {feature}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <h1 className="font-bold text-xl">Filter By Foods</h1>
            <FilterByFoods
              foodsList={searchState.selectedFoods}
              onChange={setSelectedFoods}
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-xl">Filter By Distance</h1>
            <RadioGroup
              className="flex flex-col gap-1"
              onValueChange={(newValue) => {
                const newDistance: Distance = parseInt(newValue) as Distance;
                setSearchState((prevState) => ({
                  ...prevState,
                  selectedDistance: newDistance,
                }));
              }}
            >
              {Distances.map((distance) => {
                const isSelected = searchState.selectedDistance == distance;
                return (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value={distance.toString()}
                      id={`distance_within_${distance}`}
                      className="hidden"
                    />
                    <Label
                      htmlFor={`distance_within_${distance}`}
                      className={`px-6 border  py-3 rounded-full flex items-center gap-1 cursor-pointer
                      ${
                        isSelected
                          ? "border-green-600 text-green-600"
                          : "border-slate-300"
                      }
                      `}
                    >
                      {isSelected && <Check size={20} />}
                      {`Within ${distance} KM`}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </ScrollArea>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {isLoading ? (
          "Loading.."
        ) : places && places.length > 0 ? (
          places.map((place) => <PlaceListItem place={place} key={place.id} />)
        ) : (
          <h1>No Place Found</h1>
        )}
      </div>
    </div>
  );
};

export default FindPlacesPage;
