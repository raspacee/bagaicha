import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import { v2 as cloudinary } from "cloudinary";

const get_user_info = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const slug = req.params.slug;
  try {
    const user = await User.get_user_all_info(slug);
    if (user == null) {
      return next(new Error("User not found"));
    }
    return res.status(200).send({
      status: "ok",
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const change_profile_picture = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const picture_path = req.file!.path;
    const picture_upload = await cloudinary.uploader.upload(picture_path);

    await User.change_profile_pic_url(
      res.locals.user.user_id,
      picture_upload.secure_url,
    );

    return res.status(200).send({
      status: "ok",
      message: "Profile picture changed",
    });
  } catch (err) {
    return next(err);
  }
};

const exporter = {
  get_user_info,
  change_profile_picture,
};

export default exporter;
