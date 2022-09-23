import jwt from 'jsonwebtoken';

/**
 * @param {*} req The request object
 * @param {*} res The result object
 * @param {*} next Used to move on to the next middleware
 * Unauthorized @returns 401, error
 * Authorized calls next middleware via next()
 */
const isAuthorized = (req, res, next) => {
    const authHeader = req.get('Authorization');
    let decodedToken;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    else {
        const token = req.get('Authorization').split(' ')[1];
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Token expired or malformed" });
        }
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.is_admin = decodedToken.is_admin;
        req.email = decodedToken.email;
        if (req.is_admin === false)
            req.company_id = decodedToken.company_id;
        next();
    }
};

export default isAuthorized;