import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const signup_handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { first_name, last_name, password, email } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const default_profile_picture_url =
      "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712744937/dub6gcp7xqu14hp1klnl.jpg";

    await User.create_user(
      id,
      email,
      first_name,
      last_name,
      hashed_password,
      created_at,
      default_profile_picture_url,
    );

    return res.status(200).send({
      status: "ok",
      message: "Successfully signed up. You can log in now.",
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const login_handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  try {
    const user = await User.get_user_all_info(email);
    if (user == null) {
      return res.status(200).send({
        status: "error",
        message: "Email not found",
      });
    }
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_picture_url: user.profile_picture_url,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" },
      );
      console.log(token);
      return res.status(200).send({ status: "ok", token });
    } else {
      return res.status(200).send({
        status: "error",
        message: "Email or password is incorrect",
      });
    }
  } catch (err) {
    return next(err);
  }
};

const auth_handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.status(200).send({
      status: "ok",
      user: res.locals.user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const mod_authenticate = async (req: Request, res: Response) => {
  return res.status(200).send({
    status: "ok",
  });
};

const exporter = {
  signup_handler,
  login_handler,
  auth_handler,
  mod_authenticate,
};

export default exporter;
