import { DataTypes, Sequelize } from "sequelize";

import sequelize from "../utils/database.js";

class Admin extends Sequelize.Model {}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
      /*
        test@gmail.com is valid
        achyut.shukla.btech2020@sitpune.edu.in is invalid

        needs a custom validator ie.regex validator
      */
      // validate: {
      //   isEmail: true,
      // },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, modelName: "admin" }
);

export default Admin;
