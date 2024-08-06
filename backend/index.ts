import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import indexRouter from "./routes/indexRouter";
import authRouter from "./routes/authRouter";
import postRouter from "./routes/post.router";
import userRouter from "./routes/userRouter";
import placeRouter from "./routes/place.router";
import notificationRouter from "./routes/notificationRouter";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(function (req, res, next) {
//   res.header("Content-Type", "application/json;charset=UTF-8");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/review", postRouter);
app.use("/api/user", userRouter);
app.use("/api/place", placeRouter);
app.use("/api/notification", notificationRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.status(400).send(err);
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Application listening on port: " + process.env.PORT || 8080)
);
