import { promises as fsp } from "fs";
import logger from "./logger.js";

/**
 * Deletes files created in case of errors
 * @param {*} banner 
 * @param {*} logo 
 */
const deleteFromFs = async (...images) => {
    images.forEach(async (image) => {
        if (Array.isArray(image))
            await fsp.unlink(image[0].path);
        else if (typeof (image) === "object")
            await fsp.unlink(image.path);
        else logger.warn("Using not supported type", typeof (image), image);
    })
}

export default deleteFromFs;