import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { useState } from "react";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { useAppDispatch, useAppSelector } from "../hooks";
import { updateState } from "../slice/addPlaceSlice";
import Stepper from "../components/stepper/Stepper";

const BasicInfoForm = () => {
  const state = useAppSelector((state) => state.addplace);
  const dispatch = useAppDispatch();
  return (
    <div>
      <p className="text-md font-medium">
        Are you the place owner or a customer?
      </p>
      <div className="flex justify-around mt-2">
        <button
          className={`px-4 py-2 rounded-md text-white font-medium ${state.relation == "owner" ? "bg-blue-600" : "bg-gray-400"}`}
          onClick={() => dispatch(updateState({ ...state, relation: "owner" }))}
        >
          Owner
        </button>
        <button
          className={`px-4 py-2 rounded-md text-white font-medium ${state.relation == "customer" ? "bg-blue-600" : "bg-gray-400"}`}
          onClick={() =>
            dispatch(updateState({ ...state, relation: "customer" }))
          }
        >
          Customer
        </button>
      </div>
    </div>
  );
};

const PlaceDetailsForm = () => {
  const popular_foods = [
    "Thukpa",
    "Momo",
    "Samosa",
    "Chowmein",
    "Sekuwa",
    "Burger",
    "Pizza",
    "Hot dog",
    "Pasta",
    "Noodles",
    "Sushi",
    "Sandwich",
  ];
  const traditional_foods = [
    "Thakali",
    "Chatamari",
    "Sel Roti",
    "Choila",
    "Gundruk",
    "Dhindo",
  ];
  const drinks = [
    "Lassi",
    "Tea",
    "Coffee",
    "Fruit Juice",
    "Smoothie",
    "Boba Tea",
  ];
  const state = useAppSelector((state) => state.addplace);
  const dispatch = useAppDispatch();

  return (
    <div className="border border-gray-300">
      <div className="px-8 py-3 flex flex-col">
        <label className="text-xl font-regular font-sans">
          Name & location
        </label>
        <input
          placeholder="Enter place name"
          className="my-1"
          value={state.placeName}
          onChange={(e) =>
            dispatch(updateState({ ...state, placeName: e.target.value }))
          }
        />
        <span className="my-1">
          <input
            placeholder="Enter latitude"
            className="mr-2"
            value={state.placeLat}
            onChange={(e) =>
              dispatch(updateState({ ...state, placeLat: e.target.value }))
            }
          />
          <input
            placeholder="Enter longitude"
            value={state.placeLong}
            onChange={(e) =>
              dispatch(updateState({ ...state, placeLong: e.target.value }))
            }
          />
        </span>
      </div>
      <Divider />
      <div className="px-8 py-3">
        <label className="text-xl font-sans">Images</label>
        <span className="flex justify-between my-1">
          <label className="text-md font-regular text-gray-600">
            Add a display picture of the place
          </label>
          <label
            htmlFor="display-picture"
            className="bg-blue-600 text-white w-fit px-3 py-1 font-medium rounded-full cursor-pointer"
          >
            <AddPhotoAlternateIcon />
            Upload
          </label>
          <input
            type="file"
            hidden
            id="display-picture"
            accept="image/*"
            onChange={(e) =>
              dispatch(updateState({ ...state, displayPic: e.target.files[0] }))
            }
          />
        </span>
      </div>
      <Divider />
      <div className="px-8 py-3">
        <label className="text-xl">Foods & Beverages</label>
        <label className="text-gray-600 block">
          Click on the foods that this place is famous for
        </label>
        <form>
          <p className="text-gray-600 text-sm font-medium">Popular foods</p>
          <div className="grid grid-cols-6">
            {popular_foods.map((label) => {
              return (
                <span
                  key={label}
                  className="flex justify-between mx-1 items-center"
                >
                  <label htmlFor={label}>{label}</label>
                  <input
                    type="checkbox"
                    id={label}
                    name="foods"
                    value={label}
                    checked={state.foods.includes(label.toLowerCase())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          updateState({
                            ...state,
                            foods: [...state.foods, label.toLowerCase()],
                          }),
                        );
                      } else {
                        dispatch(
                          updateState({
                            ...state,
                            foods: state.foods.filter(
                              (f) => f != label.toLowerCase(),
                            ),
                          }),
                        );
                      }
                    }}
                  />
                </span>
              );
            })}
          </div>
          <p className="text-gray-600 text-sm font-medium">Traditional foods</p>
          <div className="grid grid-cols-6">
            {traditional_foods.map((label) => {
              return (
                <span
                  key={label}
                  className="flex justify-between mx-1 items-center"
                >
                  <label htmlFor={label}>{label}</label>
                  <input
                    type="checkbox"
                    id={label}
                    name="foods"
                    value={label}
                    checked={state.foods.includes(label.toLowerCase())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          updateState({
                            ...state,
                            foods: [...state.foods, label.toLowerCase()],
                          }),
                        );
                      } else {
                        dispatch(
                          updateState({
                            ...state,
                            foods: state.foods.filter(
                              (f) => f != label.toLowerCase(),
                            ),
                          }),
                        );
                      }
                    }}
                  />
                </span>
              );
            })}
          </div>
          <label className="text-gray-600 block mt-2">
            Click on the drinks that this place is famous for
          </label>
          <div className="grid grid-cols-6">
            {drinks.map((label) => {
              return (
                <span
                  key={label}
                  className="flex justify-between mx-1 items-center"
                >
                  <label htmlFor={label}>{label}</label>
                  <input
                    type="checkbox"
                    id={label}
                    name="foods"
                    value={label}
                    checked={state.drinks.includes(label.toLowerCase())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          updateState({
                            ...state,
                            drinks: [...state.drinks, label.toLowerCase()],
                          }),
                        );
                      } else {
                        dispatch(
                          updateState({
                            ...state,
                            drinks: state.drinks.filter(
                              (d) => d != label.toLowerCase(),
                            ),
                          }),
                        );
                      }
                    }}
                  />
                </span>
              );
            })}
          </div>
          <span className="flex justify-between mt-3 items-center">
            <label className="text-gray-600">
              Does this place offer alcohol?
            </label>
            <select
              className="text-sm"
              value={state.alcoholAllowed ? "yes" : "no"}
              onChange={(e) =>
                dispatch(
                  updateState({
                    ...state,
                    alcoholAllowed: e.target.value == "yes" ? true : false,
                  }),
                )
              }
            >
              <option selected value="no">
                No
              </option>
              <option value="yes">Yes</option>
            </select>
          </span>
        </form>
      </div>
      <Divider />
      <div className="px-8 py-3 my-1">
        <label className="text-xl">Trivial Infos</label>
        <span className="flex justify-between">
          <label className="text-gray-600">
            When was the place established ? (optional)
          </label>
          <input type="date" />
        </span>
      </div>
    </div>
  );
};

const WrapUp = () => {
  const state = useAppSelector((state) => state.addplace);
  return (
    <div className="border border-gray-300 min-w-[400px]">
      <div className="px-8 py-3">
        <p className="text-xl">Name & Location</p>
        <p className="text-gray-600 font-medium">{state.placeName}</p>
        <p className="text-gray-600 font-medium">
          {state.placeLat}, {state.placeLong}
        </p>
      </div>
      <Divider />
      <div className="px-8 py-3">
        <img src={URL.createObjectURL(state.displayPic)} alt="Picture here" />
      </div>
      <Divider />
      <div className="px-8 py-3">
        <p className="text-xl">Foods</p>
        <div className="grid grid-cols-5 gap-1">
          {state.foods.map((f) => (
            <Chip label={f} variant="outlined" />
          ))}
        </div>
      </div>
      <Divider />
      <div className="px-8 py-3">
        <p className="text-xl">Beverages</p>
        <div className="grid grid-cols-5 gap-2">
          {state.drinks.map((f) => (
            <Chip label={f} variant="outlined" />
          ))}
        </div>
        <span className="flex justify-between items-center">
          <label>Alcohol allowed?</label>
          <select disabled value={state.alcoholAllowed ? "yes" : "no"}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </span>
      </div>
      <Divider />
      <div className="px-8 py-3">
        <p className="text-gray-600">
          If everything is complete, submit your form below
        </p>
      </div>
    </div>
  );
};

const steps = [
  { label: "Basic info", component: <BasicInfoForm /> },
  { label: "Place details", component: <PlaceDetailsForm /> },
  { label: "Finish wrapping up", component: <WrapUp /> },
];

export default function AddPlace() {
  return (
    <div className="shadow-lg px-4 py-3 bg-white mt-3 ml-2 rounded-md mr-2 flex flex-col items-center h-fit min-h-[400px]">
      <div className="text-center">
        <h1 className="text-2xl">Cannot find the place you are looking for?</h1>
        <h2>You can add them!</h2>
      </div>
      <div className="w-3/4 mt-2">
        <Stepper steps={steps} />
      </div>
    </div>
  );
}
