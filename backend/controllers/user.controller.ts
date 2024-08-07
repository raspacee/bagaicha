import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import PostModel from "../models/post.model";
import { v2 as cloudinary } from "cloudinary";

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

const change_profile_picture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const picture_path = req.file!.path;
    const picture_upload = await cloudinary.uploader.upload(picture_path);

    await UserModel.change_profile_pic_url(
      res.locals.user.user_id,
      picture_upload.secure_url
    );

    return res.status(200).send({
      status: "ok",
      message: "Profile picture changed",
    });
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

interface ImageInterface {
  new_profile_pic?: any;
}

const update_profile = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const { first_name, last_name, bio } = req.body;

    let profile_pic: string | null = null;
    const files = req.files as ImageInterface;
    if (files.new_profile_pic) {
      const picture_upload = await cloudinary.uploader.upload(
        files.new_profile_pic[0].path
      );
      profile_pic = picture_upload.secure_url;
    }
    await UserModel.update_profile(
      user.user_id,
      first_name,
      last_name,
      bio,
      profile_pic
    );

    return res.status(200).send({
      status: "ok",
      message: "Successfully updated user settings",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  change_profile_picture,
  update_profile,
  getMyUserData,
  getUserData,
  getUserPosts,
};

export default exporter;
