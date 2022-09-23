import { Router } from "express";
import bcrypt from 'bcrypt';

import logger from "../utils/logger.js";
import uploadCompanyFile from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Company from "../models/company.js";
import cloudinaryUploader from "../utils/cloudinaryUploader.js";

const router = Router();

router.get("/", async (req, res) => {
    logger.info("On get all companies route");

    try {
        const companies = await Company.findAll({ exclude: "password" });
        res.status(200).json({ companies })
    } catch (error) {
        res.status(400).json({ error });
    }
});

router.get("/:id", async (req, res) => {
    logger.info("On get company by id route");

    const { id } = req.params;

    try {
        const company = await Company.findByPk(id, { exclude: "password" });
        if (company && (company !== undefined))
            res.status(200).json({ company })
        else res.status(400).json({ error: "No company with given id found" })
    } catch (error) {
        res.status(400).json({ error });
    }
});

const postOptions = uploadCompanyFile.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }])
router.post("/", postOptions, async (req, res) => {
    const { name, email, address, password } = req.body;
    const { banner, logo } = req.files;

    if (!banner || !logo)
        return res.status(400).json({ error: "Banner or logo not provided" });

    try {
        let encrpytedPassword = "";
        if (password) {
            encrpytedPassword = await bcrypt.hash(password, 10);
        }
        else {
            await deleteFromFs(banner[0], logo[0])
            return res.status(400).json({ error: "Field password not provided" })
        }

        const bannerURL = await cloudinaryUploader(banner[0]);
        const logoURL = await cloudinaryUploader(logo[0]);

        if (bannerURL && logoURL) {
            const company = await Company.create({ name, email, address, password: encrpytedPassword, banner: bannerURL, logo: logoURL });
            if (company) {
                delete company.dataValues.password;
                res.status(201).json({ message: "Company created", company });
            }
        }
        else res.status(500).json({ error: "Error uploading files" })
    } catch (error) {
        logger.error(error);
        res.status(400).json({ error });
    }
    finally {
        await deleteFromFs(banner[0], logo[0])
    }
});

export default router;