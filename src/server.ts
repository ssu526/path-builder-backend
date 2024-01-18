import app from "./app";
import "dotenv/config";
import mongoose from "mongoose";

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log("listenting on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
