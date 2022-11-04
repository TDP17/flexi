import { validationResult } from "express-validator";
import createError from "http-errors";

import logger from "../utils/logger.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Product from "../models/products.js";
import Company from "../models/company.js";
import cloudinaryHandler from "../utils/cloudinaryHandler.js";

export const getAllProducts = async (req, res, next) => {
  logger.info("On get all products route");

  try {
    const products = await Product.findAll();
    res.status(200).json({ products });
  } catch (error) {
    logger.error(error);
    next(createError(error));
    return;
  }
};

export const getProudctById = async (req, res, next) => {
  logger.info("On get product by id route");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ error: errors.array()[0].msg });
    next(createError(400, errors.array()[0].msg));
    return;
  }

  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      attributes: { exclude: "password" },
    });
    if (product && product !== undefined) res.status(200).json({ product });
    else {
      // res.status(400).json({ error: "No product with given id found" });
      next(createError(400, "No product with given id found"));
      return;
    }
  } catch (error) {
    logger.error(error);
    if (error.errors) {
      // res.status(400).json({ error: error.errors[0].message });
      next(createError(400, error.errors[0].message));
      return;
    } else {
      // res.status(400).json({ error });
      next(createError(400, error));
      return;
    }
  }
};

export const getProductByCompanyId = async (req, res, next) => {
  logger.info("On get products for specific company route via association");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ error: errors.array()[0].msg });
    next(createError(400, errors.array()[0].msg));
    return;
  }

  const { company_id } = req.params;
  const { limit, page } = req.query;

  try {
    const company = await Company.findOne({
      where: { id: company_id },
      include: [
        {
          model: Product,
          limit: limit,
          offset: limit * (page - 1),
        },
      ],
    });
    if (company) {
      // delete company.dataValues.password;
      res.status(200).json({ products: company.products });
    } else {
      res.status(400).json({ error: "Company with given id not found" });
    }
  } catch (error) {
    logger.error(error);
    if (error.errors) {
      // res.status(400).json({ error: error.errors[0].message });
      next(createError(400, error.errors[0].message));
      return;
    } else {
      // res.status(400).json({ error });
      next(createError(400, error));
      return;
    }
  }
};

export const postProduct = async (req, res, next) => {
  logger.info("On product creation route");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ error: errors.array()[0].msg });
    next(createError(400, errors.array()[0].msg));
    return;
  }

  if (!req.company_id) {
    // return res.status(401).json({ error: "Unauthorized to use this route" });
    next(createError(401, "Unauthorized to use this route"));
    return;
  }

  const company_id = req.company_id;
  const { name, price, description } = req.body;
  const image = req.file;

  try {
    if (image !== undefined) {
      const { url: imageURL, id: imageID } = await cloudinaryHandler.uploadFile(
        image
      );
      const product = await Product.create({
        name,
        price,
        description,
        company_id,
        imageURL,
        imageID,
      });
      res.status(201).json({ message: "Product Created", product });
    } else {
      await deleteFromFs(image.path);
      // res.status(400).json({ error: "Image not found" });
      next(createError(400, "Image not found"));
      return;
    }
  } catch (error) {
    logger.error(error);
    await deleteFromFs(image.path);
    if (error.errors) {
      // res.status(400).json({ error: error.errors[0].message });
      next(createError(400, error.errors[0].message));
      return;
    } else {
      // res.status(400).json({ error });
      next(createError(400, error));
      return;
    }
  }
};

export const patchProduct = async (req, res, next) => {
  logger.info("On product updation route");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ error: errors.array()[0].msg });

    next(createError(400, errors.array()[0].msg));
    return;
  }

  if (!req.company_id) {
    // return res.status(401).json({ error: "Unauthorized to use this route" });
    next(createError(401, "Unauthorized to use this route"));
    return;
  }

  const { id } = req.params;
  const { name, price, description } = req.body;
  const image = req.file;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      // return res.status(400).json({ error: "Product with given id not found" });
      next(createError(400, "Product with given id not found"));
      return;
    }

    if (req.company_id !== product.company_id) {
      // return res.status(401).json({ error: "Unauthorized to use this route" });
      next(createError(401, "Unauthorized to use this route"));
      return;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;

    if (image) {
      const { url: imageURL, id: imageID } = await cloudinaryHandler.updateFile(
        product.imageID,
        image
      );
      product.imageURL = imageURL;
      product.imageID = imageID;
    }

    const updatedProduct = await product.save();
    if (updatedProduct) {
      res
        .status(200)
        .json({ message: "Product updated", product: updatedProduct });
    }
  } catch (error) {
    logger.error(error);
    if (error.errors) {
      // res.status(400).json({ error: error.errors[0].message });
      next(createError(400, error.errors[0].message));
      return;
    } else {
      // res.status(400).json({ error });
      next(createError(400, error));
      return;
    }
  } finally {
    if (image) await deleteFromFs(image);
  }
};

export const deleteProduct = async (req, res, next) => {
  logger.info("On product deletion route");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ error: errors.array()[0].msg });
    next(createError(400, errors.array()[0].msg));
    return;
  }

  if (!req.company_id) {
    // return res.status(401).json({ error: "Unauthorized to use this route" });
    next(createError(401, "Unauthorized to use this route"));
    return;
  }

  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      // return res.status(400).json({ error: "Product with given id not found" });

      next(createError(400, "Product with given id not found"));
      return;
    }

    if (req.company_id !== product.company_id) {
      // return res.status(401).json({ error: "Unauthorized to use this route" });
      next(createError(401, "Unauthorized to use this route"));
      return;
    }

    await product.destroy();
    res.status(200).json({ message: "Product deleted", id });
  } catch (error) {
    logger.error(error);
    if (error.errors) {
      // res.status(400).json({ error: error.errors[0].message });
      next(createError(400, error.errors[0].message));
      return;
    } else {
      // res.status(400).json({ error });
      next(createError(400, error));
      return;
    }
  }
};
