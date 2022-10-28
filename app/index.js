import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cloudinary from "cloudinary";

import logger from "./utils/logger.js";
import companyRoutes from "./routes/company.js";
import productRoutes from "./routes/product.js";
import authRoutes from "./routes/auth.js";

import Database from "./models/index.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/product", productRoutes);

app.use("*", (req, res) => {
  res.status(400).send({ status: false, message: "Not Found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: false,
    enviroment: process.env.MODE || "production",
    message:
      err.status === 403
        ? err.message
        : process.env.MODE === "development"
        ? err.message
        : "Error Occoured",
  });
});

app.listen(port, async () => {
  try {
    await Database.sequelize.authenticate();
    logger.info("Database authenticated");
    await Database.sequelize.sync();
    logger.info(
      `Connection has been established successfully, server listening on PORT ${port}`
    );
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
});
