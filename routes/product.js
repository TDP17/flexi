import { Router } from "express";

import logger from "../utils/logger.js";
import { uploadProductFile } from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Product from "../models/products.js";
import Company from "../models/company.js";
import cloudinaryHandler from "../utils/cloudinaryHandler.js";

const router = Router();

router.get("/", async (req, res) => {
    logger.info("On get all products route");

    try {
        const products = await Product.findAll();
        res.status(200).json({ products })
    } catch (error) {
        logger.error(error);

    }
});

/**
 * @TODO Decide between this and the one below
 */
router.get("/assoc/:company_id", async (req, res) => {
    logger.info("On get company with products for specific");

    // @TODO verify this with request.company_id later, else return unauthorized
    const { company_id } = req.params;

    try {
        const company = await Company.findOne({ where: { id: company_id }, include: Product });
        if (company) {
            delete company.dataValues.password;
            res.status(200).json({ company })
        }
        else res.status(400).json({ error: "Company with given id not found" })
    } catch (error) {
        logger.error(error);
    }
});

router.get("/:company_id", async (req, res) => {
    logger.info("On get products for specific company route via find products");

    // @TODO verify this with request.company_id later, else return unauthorized
    const { company_id } = req.params;

    try {
        const products = await Product.findAll({ where: { company_id } });
        if (products.length > 0)
            res.status(200).json({ products })
        else res.status(400).json({ error: "No products with given company_id found" })
    } catch (error) {
        logger.error(error);

    }
});

router.post("/", uploadProductFile.single('image'), async (req, res) => {
    logger.info("On product creation route");

    if (!req.company_id) return res.status(401).json({ error: "Unauthorized to use this route" });

    const company_id = req.company_id;
    const { name, price } = req.body;
    const image = req.file;

    try {
        if (image !== undefined) {
            const { url: imageURL, id: imageID } = await cloudinaryHandler.uploadFile(image);
            const product = await Product.create({ name, price, company_id, imageURL, imageID })
            res.status(201).json({ message: "Product Created", product });
        }
        else {
            await deleteFromFs(image.path);
            res.status(400).json({ error: "Image not found" })
        }
    } catch (error) {
        logger.error(error);

        await deleteFromFs(image.path);
        res.status(400).json({ error });
    }
});

router.patch("/:id", uploadProductFile.single('image'), async (req, res) => {
    logger.info("On product updation route");

    if (!req.company_id) return res.status(401).json({ error: "Unauthorized to use this route" });

    const { id } = req.params;
    const { name, price } = req.body;
    const image = req.file;

    try {
        const product = await Product.findByPk(id);

        if (req.company_id !== product.company_id) return res.status(401).json({ error: "Unauthorized to use this route" });

        if (!product)
            return res.status(400).json({ error: "Product with given id not found" });

        if (name)
            product.name = name;
        if (price)
            product.price = price;

        if (image) {
            const { url: imageURL, id: imageID } = await cloudinaryHandler.updateFile(product.imageID, image);
            product.imageURL = imageURL
            product.imageID = imageID;
        }

        const updatedProduct = await product.save();
        if (updatedProduct) {
            res.status(200).json({ message: "Product updated", product: updatedProduct });
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ error });
    }
    finally {
        if (image)
            await deleteFromFs(image)
    }
});

export default router;