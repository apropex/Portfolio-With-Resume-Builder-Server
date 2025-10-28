import { sCode } from "..";
import ApiError from "../../error-handler/ApiError";
import { extractPublicIdFromUrl } from "../../utils/extractPublicIdFromUrl";
import { cloudinary } from "./cloudinary.config";

export const deleteImageFromCloud = async (url: string) => {
  const publicId = extractPublicIdFromUrl(url);
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch {
    throw new ApiError(sCode.BAD_REQUEST, "Cloudinary image deletion failed");
  }
};
