import {
  useFetchAllDatabaseFeatures,
  useFetchPlaceFeatures,
} from "@/api/FeatureApi";
import { useGetTopPlaces } from "@/api/PlaceApi";
import { getUserLocation } from "@/api/UserApi";
import FilterByFoods from "@/components/forms/FilterByFoods";
import PlaceListItem from "@/components/place/PlaceListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FILTER_FOODS } from "@/lib/config";
import {
  Distance,
  FetchedFeature,
  FindPlaceSearchState,
  placeFeatureSchema,
} from "@/lib/types";
import { Check, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

const FindPlacesPage = () => {
  const [searchState, setSearchState] = useState<FindPlaceSearchState>({
    selectedDistance: null,
    selectedFeatures: [],
    selectedFoods: [],
    userLocation: null,
  });
  const [pageState, setPageState] = useState({
    currentPage: 1,
    showAllFeatures: false,
    showAllFoods: false,
  });

  const setUserLocation = async () => {
    const userLocation = await getUserLocation();
    setSearchState({ ...searchState, userLocation });
  };

  useEffect(() => {
    setUserLocation();
  }, []);

  const { features, isLoading: isFeaturesLoading } =
    useFetchAllDatabaseFeatures();

  const {
    places,
    totalPages = 0,
    isLoading,
  } = useGetTopPlaces(searchState, pageState.currentPage);

  const handlePlaceFeatureChange = (
    event: ChangeEvent<HTMLInputElement>,
    feature: FetchedFeature
  ) => {
    const isChecked = event.target.checked;

    const newFeatures = isChecked
      ? [...searchState.selectedFeatures!, feature]
      : searchState.selectedFeatures!.filter((f) => f.id != feature.id);
    setSearchState({
      ...searchState,
      selectedFeatures: newFeatures,
    });

    setPageState((prevState) => ({ ...prevState, currentPage: 1 }));
  };

  const handlePlaceFoodChange = (
    event: ChangeEvent<HTMLInputElement>,
    food: string
  ) => {
    const isChecked = event.target.checked;

    const newFoods = isChecked
      ? [...searchState.selectedFoods!, food]
      : searchState.selectedFoods!.filter((val) => val !== food);
    setSearchState({
      ...searchState,
      selectedFoods: newFoods,
    });
    setPageState((prevState) => ({ ...prevState, currentPage: 1 }));
  };

  // const setSelectedFoods = (foodsList: string[]) => {
  //   setSearchState((prevState) => ({
  //     ...prevState,
  //     selectedFoods: foodsList,
  //   }));

  //   setPageState((prevState) => ({ ...prevState, currentPage: 1 }));
  // };

  const renderPages = () => {
    const OFFSET = 2;
    const currentPage = pageState.currentPage;

    const left = currentPage - OFFSET >= 1 ? currentPage - OFFSET : 1;
    const right =
      currentPage + OFFSET <= totalPages ? currentPage + OFFSET : totalPages;
    const pageNos = Array.from(
      { length: right - left + 1 },
      (_, index) => left + index
    );
    return (
      <div className="flex flex-row">
        {left > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pageNos.map((pageNo) => (
          <PaginationItem key={pageNo}>
            <PaginationLink
              isActive={currentPage == pageNo}
              className="cursor-pointer"
              onClick={() =>
                setPageState((prevState) => ({
                  ...prevState,
                  currentPage: pageNo,
                }))
              }
            >
              {pageNo}
            </PaginationLink>
          </PaginationItem>
        ))}
        {right < totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
      </div>
    );
  };

  const Distances = [1, 2, 5, 10];

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="border-b md:border-b-0 md:border-r md:h-screen md:sticky md:top-0 py-3 px-2 flex flex-col gap-2 md:w-[33%]">
          <ScrollArea className="h-full w-full text-center">
            <h1 className="text-xl font-bold">Advanced Filters</h1>
            <div className="flex flex-col gap-2 items-center">
              <h1 className="text-sm font-bold text-muted-foreground">
                Filter By Features
              </h1>
              {isFeaturesLoading && <LoaderCircle className="animate-spin" />}
              {features && (
                <div className="flex flex-wrap gap-1">
                  {features
                    .slice(0, pageState.showAllFeatures ? features.length : 5)
                    .map((feature) => {
                      const isSelected =
                        searchState.selectedFeatures!.filter(
                          (val) => val.id === feature.id
                        ).length > 0;
                      return (
                        <div key={feature.id}>
                          <Input
                            type="checkbox"
                            className="hidden"
                            id={`placeFeature_${feature.id}`}
                            value={feature.id}
                            checked={isSelected}
                            onChange={(e) =>
                              handlePlaceFeatureChange(e, feature)
                            }
                          />
                          <Label
                            htmlFor={`placeFeature_${feature.id}`}
                            className={`flex flex-1 items-center cursor-pointer text-sm rounded-full px-4 py-2 font-semibold
                      ${
                        isSelected
                          ? "border border-green-600 text-green-600"
                          : "border border-slate-300"
                      }`}
                          >
                            {isSelected && <Check size={20} />}
                            {feature.featureName}
                          </Label>
                        </div>
                      );
                    })}
                </div>
              )}
              <div>
                {pageState.showAllFeatures ? (
                  <Button
                    variant="link"
                    onClick={() =>
                      setPageState((prevState) => ({
                        ...prevState,
                        showAllFeatures: false,
                      }))
                    }
                    className="flex gap-1 items-center justify-center"
                  >
                    <ChevronUp /> Show Less
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() =>
                      setPageState((prevState) => ({
                        ...prevState,
                        showAllFeatures: true,
                      }))
                    }
                    className="flex gap-1 items-center justify-center"
                  >
                    <ChevronDown />
                    Show More
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-2 items-center">
              <h1 className="text-sm font-bold text-muted-foreground">
                Filter By Foods
              </h1>
              <div className="flex flex-row flex-wrap gap-1">
                {FILTER_FOODS.slice(
                  0,
                  pageState.showAllFoods ? FILTER_FOODS.length : 6
                ).map((food, index) => {
                  const isSelected =
                    searchState.selectedFoods!.filter((val) => val === food)
                      .length > 0;
                  return (
                    <div key={index} className="flex flex-row gap-1">
                      <Input
                        type="checkbox"
                        className="hidden"
                        id={`placeFood_${food}`}
                        value={food}
                        checked={isSelected}
                        onChange={(e) => handlePlaceFoodChange(e, food)}
                      />
                      <Label
                        htmlFor={`placeFood_${food}`}
                        className={`flex flex-1 items-center cursor-pointer text-sm rounded-full px-4 py-2 font-semibold
                      ${
                        isSelected
                          ? "border border-green-600 text-green-600"
                          : "border border-slate-300"
                      }`}
                      >
                        {isSelected && <Check size={20} />}
                        {food}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <div>
                {pageState.showAllFoods ? (
                  <Button
                    variant="link"
                    onClick={() =>
                      setPageState((prevState) => ({
                        ...prevState,
                        showAllFoods: false,
                      }))
                    }
                    className="flex gap-1 items-center justify-center"
                  >
                    <ChevronUp /> Show Less
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() =>
                      setPageState((prevState) => ({
                        ...prevState,
                        showAllFoods: true,
                      }))
                    }
                    className="flex gap-1 items-center justify-center"
                  >
                    <ChevronDown />
                    Show More
                  </Button>
                )}
              </div>

              {/* <FilterByFoods
                foodsList={searchState.selectedFoods!}
                onChange={setSelectedFoods}
              /> */}
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <h1 className="font-bold text-sm text-muted-foreground">
                Filter By Distance
              </h1>
              {searchState.userLocation === null && (
                <p className="text-xs">
                  Please
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setUserLocation();
                    }}
                    className="mx-1 font-semibold text-blue-800 cursor-pointer"
                  >
                    allow
                  </a>
                  location to filter by distance
                </p>
              )}
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
                    <div className="flex items-center gap-2" key={distance}>
                      <RadioGroupItem
                        value={distance.toString()}
                        id={`distance_within_${distance}`}
                        className="hidden"
                        disabled={searchState.userLocation === null}
                        onClick={(e) => {
                          if (
                            parseInt(e.currentTarget.value) ===
                            searchState.selectedDistance
                          ) {
                            setSearchState((prevState) => ({
                              ...prevState,
                              selectedDistance: null,
                            }));
                          }

                          setPageState((prevState) => ({
                            ...prevState,
                            currentPage: 1,
                          }));
                        }}
                      />
                      <Label
                        htmlFor={`distance_within_${distance}`}
                        className={`px-6 border  py-3 rounded-full flex items-center gap-1 cursor-pointer
                      ${
                        isSelected
                          ? "border-green-600 text-green-600"
                          : "border-slate-300"
                      } ${
                          searchState.userLocation === null &&
                          "text-muted-foreground cursor-not-allowed"
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
            <div className="min-h-10"></div>
          </ScrollArea>
        </div>
        <div className="w-full">
          {isLoading ? (
            "Loading.."
          ) : places && places.length > 0 ? (
            places.map((place) => (
              <div key={place.id}>
                <PlaceListItem place={place} />
                <Separator />
              </div>
            ))
          ) : (
            <h1>No Place Found</h1>
          )}
        </div>
      </div>

      <div>
        {totalPages && (
          <Pagination className="mt-3">
            <PaginationContent className="flex flex-row flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={pageState.currentPage <= 1}
                  tabIndex={pageState.currentPage <= 1 ? -1 : undefined}
                  className={
                    pageState.currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={() =>
                    pageState.currentPage > 1
                      ? setPageState((prevState) => ({
                          ...prevState,
                          currentPage: prevState.currentPage - 1,
                        }))
                      : ""
                  }
                />
              </PaginationItem>
              {renderPages()}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={pageState.currentPage >= totalPages}
                  tabIndex={
                    pageState.currentPage >= totalPages ? -1 : undefined
                  }
                  className={
                    pageState.currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={() =>
                    pageState.currentPage < totalPages
                      ? setPageState((prevState) => ({
                          ...prevState,
                          currentPage: prevState.currentPage + 1,
                        }))
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      <div className="min-h-20"></div>
    </>
  );
};

export default FindPlacesPage;
