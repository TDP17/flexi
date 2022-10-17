import AdminModel from "./admin.js";
import CompanyModel from "./company.js";
import ProductModel from "./products.js";

import sequelize from "../utils/database.js";

const db = {
  sequelize: sequelize,
};

db.Admin = AdminModel;
db.Company = CompanyModel;
db.Product = ProductModel;

db.Company.hasMany(db.Product, {
  foreignKey: { name: "company_id", allowNull: false },
});

db.Product.belongsTo(db.Company, {
  foreignKey: { name: "company_id", allowNull: false },
});

export default db;
