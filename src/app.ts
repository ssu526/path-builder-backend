import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import flowRoutes from "./routes/flows_routes";
import userRoutes from "./routes/users_routes";
import morgan from "morgan";
import HttpError from "./utils/HttpError";
import session from "express-session";
import MongoStore from "connect-mongo";
import { checkAuthentication } from "./middleware/auth";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
    }),
  })
);

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/flows", checkAuthentication, flowRoutes);

// Error Handlers
app.use((req, res, next) => {
  next(new HttpError(404, "Page not found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;

  if (error instanceof HttpError) {
    errorMessage = error.message;
    statusCode = error.statusCode;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
