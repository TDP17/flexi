import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import createError from "http-errors";

import logger from "../utils/logger.js";
import Admin from "../models/admin.js";
import Company from "../models/company.js";

export const adminLogin = async (req, res, next) => {
  logger.info("On admin login route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email: email } });

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        const token = jwt.sign(
          { email: admin.email, is_admin: true },
          process.env.JWT_SECRET
        );
        res.status(200).json({ token, is_admin: true });
      } else {
        next(createError(401, "Invalid Credentials"));
      }
    } else {
      next(createError(401, "Invalid Credentials"));
    }
  } catch (error) {
    logger.error(error);
    next(createError(500, "Internal Server Error"));
    // if (error.errors) res.status(400).json({ error: error.errors[0].message });
    // else next(createError(401, error.message));
    // // else res.status(400).json({ error });
  }
};

export const companyLogin = async (req, res, next) => {
  logger.info("On company login route");

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Field email or password missing" });

  try {
    const company = await Company.findOne({ where: { email: email } });

    if (company) {
      const passwordMatch = await bcrypt.compare(password, company.password);

      if (passwordMatch) {
        const token = jwt.sign(
          { email: company.email, company_id: company.id, is_admin: false },
          process.env.JWT_SECRET
        );
        res.status(200).json({ token, is_admin: false });
      } else {
        next(createError(403, "Invalid Credentials"));
      }
    } else next(createError(403, "Invalid Credentials"));
  } catch (error) {
    logger.error(error);
    next(createError(500, "Internal Server Error"));
    // if (error.errors) res.status(400).json({ error: error.errors[0].message });
    // else next(createError(400, error));
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    logger.info("On admin register route");
    const user = await Admin.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    console.log(req.body);
    const password = await bcrypt.hash(req.body.password, 10);
    const result = await Admin.create({
      email: req.body.email,
      password: password,
    });
    if (result) {
      res
        .status(201)
        .json({ status: true, message: "Admin created successfully" });
    } else {
      next(createError(400, "Error Occoured while creating admin"));
    }
  } catch (err) {
    next(createError(500, err || "Internal Server Error"));
  }
};
