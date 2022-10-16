import sequelize from "./database.js";
import Company from "../models/company.js";
import Product from "../models/products.js";

const initializeDatabase = async () => {
  Company.hasMany(Product, {
    foreignKey: { name: "company_id", allowNull: false },
  });
  Product.belongsTo(Company, {
    foreignKey: { name: "company_id", allowNull: false },
  });

  await sequelize.authenticate();
  await sequelize.sync();
};

export default initializeDatabase;
