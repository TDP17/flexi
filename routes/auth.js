import { Router } from "express";
import { body } from "express-validator";

import {
  adminLogin,
  companyLogin,
  registerAdmin,
} from "../controllers/authController.js";

import isAuthorized from "../utils/isAuthorized.js";

const router = Router();

router.post(
  "/register/admin",
  // isAuthorized,
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
  registerAdmin
);

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
