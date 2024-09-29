import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import PostModel from "../models/post.model";
import { v2 as cloudinary } from "cloudinary";
import { UpdateProfileForm } from "../types";
import { uploadImage } from "../utils/image";

const getUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.getDataById(userId);
    if (user == null) {
      return res.status(404).send();
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

const getMyUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.getDataById(req.jwtUserData!.userId);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

const getUserPosts = async (req: Request, res: Response) => {
  // TODO ADD PAGINATION
  try {
    const userId = req.params.userId;
    const posts = await PostModel.getUserPosts(userId, req.jwtUserData!.userId);
    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: err,
    });
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const formData = req.body as UpdateProfileForm;
    const userId = req.jwtUserData!.userId;

    const user = await UserModel.getDataById(userId);
    if (!user) {
      return res.status(404).json();
    }

    if (req.file) {
      const [url] = await uploadImage(req.file as Express.Multer.File);
      formData.profilePictureUrl = url;
    }

    await UserModel.updateProfileInfo(userId, formData);

    return res.status(200).json();
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  updateUserProfile,
  getMyUserData,
  getUserData,
  getUserPosts,
};

export default exporter;
