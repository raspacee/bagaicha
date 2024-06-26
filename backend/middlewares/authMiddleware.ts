import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).send({
      status: "error",
      message: "Authentication token missing, try logging in again",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, function (err, decoded) {
    if (err) {
      return res.status(400).send({
        status: "error",
        message: "Invalid authentication token, try logging in again",
      });
    }
    res.locals.user = decoded;
    return next();
  });
};
