import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import indexRouter from "./routes/index.router";
import authRouter from "./routes/auth.router";
import postRouter from "./routes/post.router";
import userRouter from "./routes/user.router";
import placeRouter from "./routes/place.router";
import notificationRouter from "./routes/notification.router";
import { v2 as cloudinary } from "cloudinary";
import compression from "compression";
import winston from "winston";

const app = express();

const logger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const winstonMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(
    `Origin: ${req.headers.origin}, Method: ${req.method}, URL: ${req.url} - IP: ${req.ip}`
  );
  next();
};

app.use(winstonMiddleware);
app.use(compression());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        origin == process.env.FRONTEND_URL ||
        origin == process.env.FRONTEND_DOMAIN ||
        (!origin && process.env.NODE_ENV === "development")
      )
        callback(null, origin);
      else callback(new Error("Invalid Origin"), origin);
    },
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter);
app.use("/api/place", placeRouter);
app.use("/api/notifications", notificationRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.status(400).send(err);
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Application listening on port: " + process.env.PORT || 8080)
);
