import { UploadApiResponse } from "cloudinary";
import { sCode } from "..";
import ApiError from "../../error-handler/ApiError";
import { sanitizeFilename } from "../../utils/sanitizeFilename";
import { cloudinary } from "./cloudinary.config";
import { streamFromBuffer } from "./streamFromBuffer";

/**
 * Uploads a buffer (e.g. PDF) to Cloudinary under 'pdf/' folder
 * @param buffer - The file content as a buffer
 * @param filename - Original file name
 * @returns Cloudinary UploadApiResponse
 */

export const uploadBufferToCloud = async (
  buffer: Buffer,
  filename: string,
): Promise<UploadApiResponse> => {
  const public_id = sanitizeFilename(filename);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id,
        folder: "pdf",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error", {
            error: error.message,
            filename,
          });
          return reject(error);
        }

        if (!result) {
          const fallbackError = new ApiError(
            sCode.EXPECTATION_FAILED,
            "Cloudinary returned no result",
          );
          console.error("Upload failed", { filename });
          return reject(fallbackError);
        }

        resolve(result);
      },
    );

    const stream = streamFromBuffer(buffer);
    stream.pipe(uploadStream);
  });
};
