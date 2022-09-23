import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

const cloudinaryUploader = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path)
        if (result.public_id) {
            return { url: result.secure_url, id: result.public_id };
        }
    } catch (error) {
        logger.error(error);
    }
};

export const cloudinaryUpdater = async (oldID, newFile) => {
    try {
        await cloudinary.api.delete_resources([oldID]);
        const result = await cloudinary.uploader.upload(newFile.path)
        if (result.public_id) {
            return { url: result.secure_url, id: result.public_id };
        }
    } catch (error) {
        logger.error(error);
    }
}

export default cloudinaryUploader;