import { v2 } from "cloudinary";

import _env from "..";

v2.config({
  cloud_name: _env.cloudinary.cloud_name,
  api_key: _env.cloudinary.api_key,
  api_secret: _env.cloudinary.api_secret,
});

export const cloudinary = v2;
