import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cloudinary from 'cloudinary';

import sequelize from './utils/database.js';
import logger from './utils/logger.js';
import companyRoutes from './routes/company.js';
import productRoutes from './routes/product.js';
import authRoutes from './routes/auth.js';
import Company from './models/company.js';
import Product from './models/products.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/product", productRoutes);

app.use('/', (req, res) => {
    res.json("Welcome to Future API");
});

app.listen(port, async () => {
    try {
        Company.hasMany(Product, { foreignKey: { name: "company_id", allowNull: false } });
        Product.belongsTo(Company, { foreignKey: { name: "company_id", allowNull: false } });

        await sequelize.authenticate();
        await sequelize.sync();

        logger.info(`Connection has been established successfully, server listening on PORT ${port}`);
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
    }
});