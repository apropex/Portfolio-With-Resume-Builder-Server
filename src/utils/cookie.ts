import { Response } from "express";
import { isDev } from "../config";

const cookieOptions = {
  httpOnly: true,
  secure: !isDev,
  sameSite: !isDev ? ("none" as const) : ("lax" as const),
};

export const setCookie = {
  accessToken(res: Response, token: string, maxAge?: number) {
    res.cookie("_p_access_token", token, {
      ...cookieOptions,
      maxAge: maxAge || 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  },

  refreshToken(res: Response, token: string, maxAge?: number) {
    res.cookie("_p_refresh_token", token, {
      ...cookieOptions,
      maxAge: maxAge || 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  },

  allTokens(res: Response, accessToken: string, refreshToken: string) {
    this.accessToken(res, accessToken);
    this.refreshToken(res, refreshToken);
  },

  clearCookies(res: Response) {
    res.clearCookie("_p_access_token", cookieOptions);
    res.clearCookie("_p_refresh_token", cookieOptions);
  },
};
