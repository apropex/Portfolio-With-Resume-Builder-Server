import { Response } from "express";
import { sCode } from "../../config";

export default function _response<T>(
  res: Response,
  jsonData: {
    statusCode?: number;
    success?: boolean;
    message: string;
    meta?: {
      total_data?: number;
      filtered_data?: number;
      present_data?: number;
      total_page?: number;
      present_page?: number;
      skip?: number;
      limit?: number;
      options?: Record<string, any>;
    };
    data?: T | null | undefined;
  },
) {
  res.status(jsonData.statusCode || sCode.OK).json({
    success: jsonData.success || true,
    message: jsonData.message,
    meta: jsonData.meta ?? null,
    data: jsonData.data ?? null,
  });
}
