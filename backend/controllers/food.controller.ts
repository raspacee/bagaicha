import { Request, Response } from "express";
import { CreateFoodForm, createFoodSchema, FetchedFood } from "../types";
import FoodModel from "../models/food.model";
import z from "zod";

const getFoodsOfPlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    const foods = await FoodModel.fetchFoodsByPlaceId(placeId);
    return res.status(200).json(foods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error while getting foods" });
  }
};

const addFoodToPlace = async (req: Request, res: Response) => {
  try {
    /* No need to check if placeId exists as isAdminOrOwnerMiddleware 
    already handles it */
    const { placeId } = req.params;
    const form: CreateFoodForm = req.body;

    createFoodSchema.parse(form);
    const food = await FoodModel.createFood(placeId, form);
    return res.status(201).json(food);
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(400).json(err.formErrors);
    }
    return res.status(500).json({ message: "Error while creating food" });
  }
};

const deleteFoodOfPlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const { foodId } = req.body;
    if (!foodId)
      return res.status(400).json({ message: "Missing foodId in body" });

    /* TODO: Check for 404 */
    await FoodModel.deleteFoodById(placeId, foodId);
    return res.status(204).json({ message: "Deleted food item" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error while deleting food" });
  }
};

const updateFoodOfPlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const updatedForm: FetchedFood = req.body;

    createFoodSchema.parse(updatedForm);

    const updatedFood = await FoodModel.updateFoodById(placeId, updatedForm);
    return res.status(200).json(updatedFood);
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError)
      return res.status(400).json({ message: err.formErrors });
    return res.status(500).json({ message: "Error while updating food" });
  }
};

export default {
  getFoodsOfPlace,
  addFoodToPlace,
  deleteFoodOfPlace,
  updateFoodOfPlace,
};
