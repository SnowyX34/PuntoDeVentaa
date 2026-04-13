"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinaryConfig_1 = __importDefault(require("../../config/apis/cloudinaryConfig"));
class CloudinaryService {
    static async uploadImage(buffer, fileName, folder = 'products') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                folder: folder,
                public_id: `${Date.now()}- ${fileName.split('.')[0]}`,
                quality: 'auto',
                fetch_format: 'auto',
                dpr: 'auto',
                max_file_size: 5000000,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }, (error, result) => {
                if (error) {
                    console.error('Error uploading to Cloudinary:', error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            uploadStream.end(buffer);
        });
    }
    static async deleteImage(publicId) {
        try {
            const result = await cloudinaryConfig_1.default.uploader.destroy(publicId);
            console.log('Image deleted from Cloudinary:', result);
            return result;
        }
        catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            throw error;
        }
    }
    // Método auxiliar para extraer public_id de una URL de Cloudinary
    static extractPublicId(cloudinaryUrl) {
        try {
            const regex = /\/v\d+\/(.+)\./;
            const match = cloudinaryUrl.match(regex);
            return match ? match[1] : null;
        }
        catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
        }
    }
}
exports.CloudinaryService = CloudinaryService;
