import { setCookie } from "../../../utils/cookie";
import catchAsync from "../../shared/catchAsync";
import _response from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const { data, access_token, refresh_token } = await AuthService.login(
    req.body,
  );

  setCookie.allTokens(res, access_token, refresh_token);

  _response(res, {
    message: "User logged in successfully",
    data,
  });
});

const authWithGoogle = catchAsync(async (req, res) => {
  const { data, access_token, refresh_token } =
    await AuthService.authWithGoogle(req.body);

  setCookie.allTokens(res, access_token, refresh_token);

  _response(res, {
    message: "User logged in successfully",
    data,
  });
});

export const AuthController = {
  login,
  authWithGoogle,
};
