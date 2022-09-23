import { Router } from "express";

import logger from "../utils/logger.js";

const router = Router();

router.post("/login", async (req, res) => {
    logger.info("On login route");

})

export default router;