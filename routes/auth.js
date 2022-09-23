import { Router } from 'express';
import jwt from 'jsonwebtoken';

import Admin from "../models/admin.js";
import Company from '../models/company.js';
import logger from "../utils/logger.js";

const router = Router();

router.post("/login/admin", async (req, res) => {
    logger.info("On admin login route");

    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Field email or password missing" });

    try {
        const admin = await Admin.findOne({ where: { email: email } });

        if (admin) {
            const passwordMatch = await bcrypt.compare(password, admin.password);

            if (passwordMatch) {
                const token = jwt.sign({ email: admin.email, is_admin: true }, process.env.JWT_SECRET);
                res.status(200).json({ token, is_admin: true });
            } else {
                res.status(401).json({ error: "Incorrect password" });
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ error });
    }
})

router.post("/login/company", async (req, res) => {
    logger.info("On company login route");

    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Field email or password missing" });

    try {
        const company = await Company.findOne({ where: { email: email } });

        if (company) {
            const passwordMatch = await bcrypt.compare(password, company.password);

            if (passwordMatch) {
                const token = jwt.sign({ email: company.email, company_id: company.id, is_admin: false }, process.env.JWT_SECRET);
                res.status(200).json({ token, is_admin: false });
            } else {
                res.status(401).json({ error: "Incorrect password" });
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ error });
    }
})

export default router;