import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import createError from "http-errors";

import logger from "../utils/logger.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Company from "../models/company.js";
import cloudinaryHandler from "../utils/cloudinaryHandler.js";

export const getAllCompanies = async (req, res, next) => {
  logger.info("On get all companies route");

  try {
    const companies = await Company.findAll({
      attributes: { exclude: ["password"] },
    });
    res.status(200).json({ companies });
  } catch (error) {
    // res.status(400).json({ error });
    next(createError(400, error.message));
  }
};

export const getAllCompaniesByStatus = async (req, res) => {
  logger.info("On get all companies by status route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { status } = req.params;

  try {
    const companies = await Company.findAndCountAll({
      where: { status: status },
      attributes: { exclude: "password" },
    });
    res.status(200).json({ companies });
  } catch (error) {
    // res.status(400).json({ error });
    next(createError(400, error));
  }
};

export const getCompanyById = async (req, res) => {
  logger.info("On get company by id route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { id } = req.params;

  try {
    const company = await Company.findByPk(id, {
      attributes: { exclude: "password" },
    });
    if (company && company !== undefined) res.status(200).json({ company });
    else res.status(400).json({ error: "No company with given id found" });
  } catch (error) {
    logger.error(error);
    if (error.errors) res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  }
};

export const postCompany = async (req, res) => {
  logger.info("On create company route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { name, email, address, password } = req.body;
  const { banner, logo } = req.files;

  try {
    const encrpytedPassword = await bcrypt.hash(password, 10);

    const { url: bannerURL, id: bannerID } = await cloudinaryHandler.uploadFile(
      banner[0]
    );
    const { url: logoURL, id: logoID } = await cloudinaryHandler.uploadFile(
      logo[0]
    );

    if (bannerURL && logoURL) {
      const company = await Company.create({
        name,
        email,
        address,
        password: encrpytedPassword,
        bannerURL,
        logoURL,
        bannerID,
        logoID,
      });
      if (company) {
        delete company.dataValues.password;
        res.status(201).json({ message: "Company created", company });
      }
    } else res.status(500).json({ error: "Error uploading files" });
  } catch (error) {
    logger.error(error);
    if (error.errors) res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  } finally {
    await deleteFromFs(banner, logo);
  }
};

export const patchCompany = async (req, res) => {
  logger.info("On update company route");

  if (!req.is_admin && !req.company_id)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  const { name, email, address, password } = req.body;

  let banner, logo;
  if (req.files) {
    const { b, l } = req.files;
    banner = b;
    logo = l;
  }
  const { id } = req.params;

  if (!req.is_admin && id !== req.company_id)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  try {
    const company = await Company.findByPk(id);

    if (!company)
      return res.status(400).json({ error: "Company with given id not found" });

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

    const updatedCompany = await company.save();
    if (updatedCompany) {
      delete updatedCompany.dataValues.password;
      res
        .status(200)
        .json({ message: "Company updated", company: updatedCompany });
    }
  } catch (error) {
    logger.error(error);
    if (error.errors) res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  } finally {
    await deleteFromFs(banner, logo);
  }
};

export const patchCompanyStatus = async (req, res) => {
  logger.info("On update company status route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { id } = req.params;
  const { status } = req.body;

  if (!req.is_admin)
    return res.status(401).json({ error: "Unauthorized to use this route" });

  try {
    const company = await Company.findByPk(id);

    if (!company)
      return res.status(400).json({ error: "Company with given id not found" });

    company.status = status;

    const updatedCompany = await company.save();
    if (updatedCompany) {
      delete updatedCompany.dataValues.password;
      res
        .status(200)
        .json({ message: "Company updated", company: updatedCompany });
    }
  } catch (error) {
    logger.error(error);
    if (error.errors) res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  }
};
