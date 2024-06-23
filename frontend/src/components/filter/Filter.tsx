import { useAppDispatch, useAppSelector } from "../../hooks";
import "../../App.css";
import {
  setCategory,
  setSuggested,
  setDistance,
} from "../../slice/filterSlice";
import { Distances } from "../../lib/enums";
import { type FilterType } from "../../lib/types";

interface SuggestedInterface {
  key: keyof FilterType["suggested"];
  label: string;
}

interface CategoryInterface {
  key: keyof FilterType["category"];
  label: string;
}

interface DistanceInterface {
  enum: Distances;
  value: string;
  label: string;
}

const suggested: SuggestedInterface[] = [
  {
    key: "delivery",
    label: "Places that offers delivery",
  },
  {
    key: "takeout",
    label: "Places that offers takeout",
  },
  {
    key: "petFriendly",
    label: "Pet friendly places",
  },
  {
    key: "veryClean",
    label: "Very clean places",
  },
  {
    key: "affordable",
    label: "Affordable places",
  },
];

const category: CategoryInterface[] = [
  {
    key: "burger",
    label: "Burger",
  },
  {
    key: "sekuwa",
    label: "Sekuwa",
  },
  {
    key: "momo",
    label: "Momo",
  },
  {
    key: "lafing",
    label: "Lafing",
  },
  {
    key: "coffee",
    label: "Coffee",
  },
];

const distance: DistanceInterface[] = [
  {
    enum: Distances.ONE,
    value: "1",
    label: "Within 1 km",
  },
  {
    enum: Distances.TWO,
    value: "2",
    label: "Within 2 km",
  },
  {
    enum: Distances.FIVE,
    value: "5",
    label: "Within 5 km",
  },
  {
    enum: Distances.TEN,
    value: "10",
    label: "Within 10 km",
  },
];

export default function Filter() {
  const dispatch = useAppDispatch();
  const suggestedFilter = useAppSelector((state) => state.filter.suggested);
  const categoryFilter = useAppSelector((state) => state.filter.category);
  const distanceFilter = useAppSelector((state) => state.filter.distance);

  return (
    <div className="bg-white px-3 py-1 rounded-md shadow-xl h-fit">
      <h1 className="font-bold text-xl">Filters</h1>
      <div className="w-full border-t-2 my-1"></div>
      <h2 className="font-normal text-lg">Suggested</h2>
      <div className="w-full">
        {suggested.map((s) => {
          return (
            <div key={s.key}>
              <input
                type="checkbox"
                name="suggested"
                value="open-now"
                className="p-2 rounded-sm border-gray-400"
                id={s.key}
                onChange={(e) =>
                  dispatch(
                    setSuggested({ key: s.key, value: e.target.checked })
                  )
                }
                checked={suggestedFilter[s.key]}
              />
              <label className="ml-2 font-light select-none" htmlFor={s.key}>
                {s.label}
              </label>
            </div>
          );
        })}
      </div>
      <div className="border-t-2 my-2"></div>
      <h2 className="font-normal text-lg">Category</h2>
      <div className="grid grid-cols-2">
        {category.map((c) => {
          return (
            <div key={c.key}>
              <input
                type="checkbox"
                name="category"
                value="burger"
                className="p-2 rounded-sm border-gray-400"
                onChange={(e) =>
                  dispatch(setCategory({ key: c.key, value: e.target.checked }))
                }
                checked={categoryFilter[c.key]}
              />
              <label className="ml-2 font-light">{c.label}</label>
            </div>
          );
        })}
      </div>
      <div className="border-t-2 my-2"></div>
      <h2 className="font-normal text-lg">Distance</h2>
      <div>
        {distance.map((d) => {
          return (
            <div key={d.value}>
              <input
                type="radio"
                value={d.value}
                name="distance"
                onChange={() => dispatch(setDistance(d.enum))}
                checked={distanceFilter.distancePicked == d.enum}
              />
              <label className="ml-2 font-light">{d.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
