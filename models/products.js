import { DataTypes, Sequelize } from "sequelize";

import sequelize from "../utils/database.js";

class Product extends Sequelize.Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageURL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageID: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: "product" }
);

export default Product;
