import dotenv from "dotenv";

import { Sequelize } from "sequelize";
import logger from "./logger.js";

dotenv.config();

// const sequelize = new Sequelize(
//   "postgres://postgres:postgres@127.0.0.1/flexi",
//   // "postgres://postgres:postgres@172.17.0.2/flexi",
//   {
//     logging: (msg) => logger.debug(msg),
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   }
// );

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
