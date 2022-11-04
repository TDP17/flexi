import { Router } from "express";
import { check, param, body, query } from "express-validator";

import {
  deleteProduct,
  getAllProducts,
  getProductByCompanyId,
  getProudctById,
  patchProduct,
  postProduct,
} from "../controllers/productController.js";
import { uploadProductFile } from "../utils/multer.js";
import isAuthorized from "../utils/isAuthorized.js";

const router = Router();

router.get("/", getAllProducts);

router.get(
  "/:id",
  [
    param("id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage("Query param id incorrect")
      .toInt(),
  ],
  getProudctById
);

router.get(
  "/company/:company_id",
  [
    param("company_id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage("Query param company_id incorrect")
      .toInt(),
    query("limit")
      .not()
      .isEmpty()
      .isInt({ min: 0 })
      .withMessage("Query string limit incorrect")
      .toInt(),
    query("page")
      .not()
      .isEmpty()
      .isInt({ min: 1 })
      .withMessage("Query string page incorrect")
      .toInt(),
  ],
  getProductByCompanyId
);

router.post(
  "/",
  uploadProductFile.single("image"),
  isAuthorized,
  [
    body("name")
      .not()
      .isEmpty()
      .withMessage("Name must not be empty")
      .trim()
      .escape(),
    body("price")
      .not()
      .isEmpty()
      .isInt({ min: 0 })
      .withMessage("Price must be an non empty positive integer")
      .toInt()
      .trim()
      .escape(),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Description must not be empty")
      .trim()
      .escape(),
    check("file")
      .custom((value, { req }) => req.file !== undefined)
      .withMessage("Image must be provided"),
  ],
  postProduct
);

router.patch(
  "/:id",
  uploadProductFile.single("image"),
  isAuthorized,
  [
    param("id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage("Query param id incorrect")
      .toInt(),
  ],
  patchProduct
);

router.delete(
  "/:id",
  isAuthorized,
  [
    param("id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage("Query param id incorrect")
      .toInt(),
  ],
  deleteProduct
);

export default router;
