import { Router } from "express";
import { body } from "express-validator";

import { adminLogin, companyLogin } from "../controllers/authController.js";

const router = Router();

router.post(
  "/login/admin",
  [
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password must not be empty")
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Email is invalid")
      .not()
      .isEmpty()
      .withMessage("Email must not be empty")
      .trim()
      .escape(),
  ],
  adminLogin
);

router.post(
  "/login/company",
  [
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password must not be empty")
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Email is invalid")
      .not()
      .isEmpty()
      .withMessage("Email must not be empty")
      .trim()
      .escape(),
  ],
  companyLogin
);

export default router;
