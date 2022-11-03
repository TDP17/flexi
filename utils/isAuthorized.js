import jwt from "jsonwebtoken";
import createError from "http-errors";

/**
 * @param {*} req The request object
 * @param {*} res The result object
 * @param {*} next Used to move on to the next middleware
 * Unauthorized @returns 401, error
 * Authorized calls next middleware via next()
 */
const isAuthorized = (req, res, next) => {
  const authHeader = req.get("Authorization");
  let decodedToken;
  if (!authHeader) {
    return next(createError(401, "Unauthorized"));
  } else {
    const token = req.get("Authorization").trim().split(" ")[1];
    if (!token || token === "") {
      next(createError(401, "Unauthorized"));
      return;
    }
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      next(createError(401, "Invalid Token"));
    }
    if (!decodedToken) {
      next(createError(401, "Unauthorized"));
    }

    req.is_admin = decodedToken.is_admin;
    req.email = decodedToken.email;
    if (req.is_admin === false) req.company_id = decodedToken.company_id;
    next();
  }
};

export default isAuthorized;
