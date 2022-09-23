import { promises as fsp } from "fs";

/**
 * Deletes files created in case of errors
 * @param {*} banner 
 * @param {*} logo 
 */
const deleteFromFs = async (banner, logo) => {
    if (banner !== undefined)
        await fsp.unlink(banner.path);
    if (logo !== undefined)
        await fsp.unlink(logo.path);
}

export default deleteFromFs;