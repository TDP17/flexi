import { Router } from "express";

import logger from "../utils/logger.js";
import { uploadProductFile } from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Product from "../models/products.js";
import Company from "../models/company.js";
import cloudinaryUploader, { cloudinaryUpdater } from "../utils/cloudinaryUtils.js";

const router = Router();

router.post("/", (req, res) => {
    console.log(req.body);
    res.send(req.body);
})

export default router;