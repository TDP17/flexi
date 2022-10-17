import { DataTypes, Sequelize } from "sequelize";

import sequelize from "../utils/database.js";

class Company extends Sequelize.Model {}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bannerURL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logoURL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bannerID: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logoID: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue: "pending",
      allowNull: false,
      validate: {
        customValidator: (value) => {
          const enums = ["pending", "accepted", "rejected"];
          if (!enums.includes(value)) {
            throw new Error("Invalid status, please send a status that is pending/accepted/rejected");
          }
        },
      },
    },
  },
  { sequelize, paranoid: true, modelName: "company" }
);

export default Company;
