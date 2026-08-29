import cloudinary from "../config/cloudinary.js";

/**
 * Upload an in-memory Multer file (memoryStorage) buffer to Cloudinary.
 * Mirrors the upload_stream pattern already used in doctorController /
 * patientController for report uploads.
 *
 * @param {{ buffer: Buffer, mimetype: string, originalname?: string }} file
 * @param {string} folder  Cloudinary folder, e.g. "uhcs/licenses"
 * @returns {Promise<object>} Cloudinary upload result (has secure_url, public_id)
 */
export const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const isPdf = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");
    const resourceType = isPdf ? "raw" : isImage ? "image" : "raw";

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

export default uploadBufferToCloudinary;
