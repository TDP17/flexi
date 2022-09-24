import { Router } from "express";
import bcrypt from "bcrypt";

import sequalize from "../utils/database.js";
import logger from "../utils/logger.js";
import uploadCompanyFile from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Company from "../models/company.js";
import cloudinaryHandler from "../utils/cloudinaryHandler.js";
import isAuthorized from "../utils/isAuthorized.js";

const router = Router();

router.get("/", async (req, res) => {
  logger.info("On get all companies route");

  try {
    await sequalize.transaction(async (transaction) => {
      const companies = await Company.findAll(
        { exclude: "password" },
        { transaction }
      );
      res.status(200).json({ companies });
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/:id", async (req, res) => {
  logger.info("On get company by id route");

  const { id } = req.params;

  try {
    await sequalize.transaction(async (transaction) => {
      const company = await Company.findByPk(
        id,
        { exclude: "password" },
        { transaction }
      );
      if (company && company !== undefined) res.status(200).json({ company });
      else res.status(400).json({ error: "No company with given id found" });
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

const postOptions = uploadCompanyFile.fields([
  { name: "banner", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

router.post("/", postOptions, isAuthorized, async (req, res) => {
  logger.info("On create company route");

  if (!req.is_admin)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  const { name, email, address, password } = req.body;
  const { banner, logo } = req.files;

  if (!banner || !logo)
    return res.status(400).json({ error: "Banner or logo not provided" });

  try {
    await sequalize.transaction(async (transaction) => {
      let encrpytedPassword = "";
      if (password) {
        encrpytedPassword = await bcrypt.hash(password, 10);
      } else {
        await deleteFromFs(banner, logo);
        return res.status(400).json({ error: "Field password not provided" });
      }

      const { url: bannerURL, id: bannerID } =
        await cloudinaryHandler.uploadFile(banner[0]);
      const { url: logoURL, id: logoID } = await cloudinaryHandler.uploadFile(
        logo[0]
      );

      if (bannerURL && logoURL) {
        const company = await Company.create(
          {
            name,
            email,
            address,
            password: encrpytedPassword,
            bannerURL,
            logoURL,
            bannerID,
            logoID,
          },
          { transaction }
        );
        if (company) {
          delete company.dataValues.password;
          res.status(201).json({ message: "Company created", company });
        }
      } else res.status(500).json({ error: "Error uploading files" });
    });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error });
  } finally {
    await deleteFromFs(banner, logo);
  }
});

router.patch("/:id", postOptions, async (req, res) => {
  logger.info("On update company route");

  if (!req.is_admin && !req.company_id)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  const { name, email, address, password } = req.body;
  const { banner, logo } = req.files;
  const { id } = req.params;

  if (id !== req.company_id)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  try {
    await sequalize.transaction(async (transaction) => {
      const company = await Company.findByPk(id, { transaction });

      if (!company)
        return res
          .status(400)
          .json({ error: "Company with given id not found" });

      let encrpytedPassword = "";
      if (password) {
        encrpytedPassword = await bcrypt.hash(password, 10);
        company.password = encrpytedPassword;
      }

      if (name && req.is_admin) company.name = name;
      if (email) company.email = email;
      if (address) company.address = address;

      if (banner) {
        const { url: bannerURL, id: bannerID } =
          await cloudinaryHandler.uploadFile(company.bannerID, banner[0]);
        company.bannerURL = bannerURL;
        company.bannerID = bannerID;
      }

      if (logo) {
        const { url: logoURL, id: logoID } = await cloudinaryHandler.uploadFile(
          company.logoID,
          logo[0]
        );
        company.logoURL = logoURL;
        company.logoID = logoID;
      }

      const updatedCompany = await company.save({ transaction });
      if (updatedCompany) {
        delete updatedCompany.dataValues.password;
        res
          .status(200)
          .json({ message: "Company updated", company: updatedCompany });
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ error });
  } finally {
    await deleteFromFs(banner, logo);
  }
});

export default router;
