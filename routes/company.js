import { Router } from "express";
import bcrypt from 'bcrypt';

import logger from "../utils/logger.js";
import uploadCompanyFile from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Company from "../models/company.js";
import cloudinaryUploader, { cloudinaryUpdater } from "../utils/cloudinaryUtils.js";

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
    logger.info("On create company route");

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
            await deleteFromFs(banner, logo)
            return res.status(400).json({ error: "Field password not provided" })
        }

        const { url: bannerURL, id: bannerID } = await cloudinaryUploader(banner[0]);
        const { url: logoURL, id: logoID } = await cloudinaryUploader(logo[0]);

        if (bannerURL && logoURL) {
            const company = await Company.create({ name, email, address, password: encrpytedPassword, bannerURL, logoURL, bannerID, logoID });
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
        await deleteFromFs(banner, logo)
    }
});

router.patch("/:id", postOptions, async (req, res) => {
    logger.info("On update company route");

    const { name, email, address, password } = req.body;
    const { banner, logo } = req.files;
    const { id } = req.params;

    try {
        const company = await Company.findByPk(id);

        if (!company)
            return res.status(400).json({ error: "Company with given id not found" });

        let encrpytedPassword = "";
        if (password) {
            encrpytedPassword = await bcrypt.hash(password, 10);
            company.password = encrpytedPassword;
        }

        if (name)
            company.name = name;
        if (email)
            company.email = email;
        if (address)
            company.address = address;

        if (banner) {
            const { url: bannerURL, id: bannerID } = await cloudinaryUpdater(company.bannerID, banner[0]);
            company.bannerURL = bannerURL
            company.bannerID = bannerID;
        }

        if (logo) {
            const { url: logoURL, id: logoID } = await cloudinaryUpdater(company.logoID, logo[0]);
            company.logoURL = logoURL
            company.logoID = logoID;
        }

        const updatedCompany = await company.save();
        if (updatedCompany) {
            delete updatedCompany.dataValues.password;
            res.status(200).json({ message: "Company updated", company: updatedCompany });
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ error });
    }
    finally {
        await deleteFromFs(banner, logo)
    }
});

export default router;