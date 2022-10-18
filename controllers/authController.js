import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import logger from "../utils/logger.js";
import Admin from "../models/admin.js";
import Company from "../models/company.js";

export const adminLogin = async (req, res) => {
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
        res.status(401).json({ error: "Invalid Credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    logger.error(error);
    if (error.errors)
      res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  }
};

export const companyLogin = async (req, res) => {
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
        res.status(401).json({ error: "Incorrect credentials" });
      }
    } else res.status(401).json({ error: "Incorrect credentials" });
  } catch (error) {
    logger.error(error);
    if (error.errors)
      res.status(400).json({ error: error.errors[0].message });
    else res.status(400).json({ error });
  }
};
