import cloudinary from 'cloudinary';
import logger from './logger.js';

const cloudinaryUploader = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path)
        if (result.public_id) {
            return result.secure_url;
        }
    } catch (error) {
        logger.log(error);
    }
};

export default cloudinaryUploader;