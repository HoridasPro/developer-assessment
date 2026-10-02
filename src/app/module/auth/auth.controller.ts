// import { NextFunction, type Request, type Response } from "express";
// import { catchAsync } from "../../utils/catchAsync";
// import { sendResponse } from "../../utils/sendResponse";
// import { AuthService } from "./auth.service";
// import config from "../../config";

// const registerUserControllerDB = catchAsync(
//   async (req: Request, res: Response) => {
//     const payload = req.body;
//     const result = await AuthService.registerUser(payload);

//     sendResponse(res, {
//       success: true,
//       message: "Register is successfully",
//       data: result,
//     });
//   },
// );
// const verifyEmailOtp = async (req: Request, res: Response) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     sendResponse(res, {
//       success: false,
//       message: "Email and OTP are required",
//       data: null,
//     });
//   }

//   const result = await AuthService.verifyEmailOtp(email, otp);

//   sendResponse(res, {
//     success: true,
//     message: "Email verified successfully",
//     data: result,
//   });
// };

// const userLogin = async (req: Request, res: Response) => {
//   const result = await AuthService.userLogin(req.body);

//   sendResponse(res, {
//     success: true,
//     message: "Login OTP sent to your email",
//     data: result,
//   });
// };

// // const verifyLoginOtp = async (req: Request, res: Response) => {
// //   const { email, otp } = req.body;

// //   if (!email || !otp) {
// //     sendResponse(res, {
// //       success: false,
// //       message: "Email and OTP are required",
// //       data: null,
// //     });
// //   }

// //   const result = await AuthService.verifyLoginOtp(email, otp);

// //   sendResponse(res, {
// //     success: true,
// //     message: "Login successful",
// //     data: result,
// //   });
// // };

// // const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
// //   const { email, otp } = req.body;

// //   if (!email || !otp) {
// //     return sendResponse(res, {
// //       success: false,
// //       message: "Email and OTP are required",
// //       data: null,
// //     });
// //   }

// //   const result = await AuthService.verifyLoginOtp(email, otp);

// //   // 💡 কুকিতে টোকেন সেট করে দিন (যদি কুকিভিত্তিক অথ হয়)
// //   const isDevelopment = config.node_env === "development";
// //   res.cookie("accessToken", result.accessToken, {
// //     secure: !isDevelopment,
// //     sameSite: isDevelopment ? "lax" : "none",
// //     httpOnly: true,
// //   });

// //   sendResponse(res, {
// //     success: true,
// //     message: "Login successful",
// //     data: result,
// //   });
// // });

// // src/app/module/auth/auth.controller.ts

// const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return sendResponse(res, {
//       success: false,
//       message: "Email and OTP are required",
//       data: null,
//     });
//   }

//   const result = await AuthService.verifyLoginOtp(email, otp);
//   const { accessToken, refreshToken } = result;

//   const isDevelopment = config.node_env === "development";

//   // 💡 OTP যাচাইকরণের পর টোকেন কুকিতে সেট করে দেওয়া হলো
//   res.cookie("accessToken", accessToken, {
//     secure: !isDevelopment,
//     sameSite: isDevelopment ? "lax" : "none",
//     httpOnly: true,
//   });

//   res.cookie("refreshToken", refreshToken, {
//     secure: !isDevelopment,
//     sameSite: isDevelopment ? "lax" : "none",
//     httpOnly: true,
//   });

//   sendResponse(res, {
//     success: true,
//     message: "Login successful",
//     data: { accessToken, refreshToken },
//   });
// });
// const googleLogin = catchAsync(async (req: Request, res: Response) => {
//   const result = await AuthService.googleLogin(req.body);

//   const { accessToken, refreshToken } = result;
//   const isDevelopment = config.node_env === "development";

//   res.cookie("accessToken", accessToken, {
//     secure: isDevelopment ? false : true,
//     sameSite: isDevelopment ? "lax" : "none",
//     httpOnly: true,
//   });

//   res.cookie("refreshToken", refreshToken, {
//     secure: isDevelopment ? false : true,
//     sameSite: isDevelopment ? "lax" : "none",
//     httpOnly: true,
//   });

//   sendResponse(res, {
//     success: true,
//     message: "Google login successful!",
//     data: { accessToken, refreshToken },
//   });
// });
// const refreshTokenDB = catchAsync(async (req: Request, res: Response) => {
//   const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

//   if (!refreshToken) {
//     throw new Error("Refresh token is required");
//   }

//   const result = await AuthService.refreshToken(refreshToken);

//   sendResponse(res, {
//     success: true,
//     message: "Access token refreshed successfully",
//     data: result,
//   });
// });

// const logout = catchAsync(async (req: Request, res: Response) => {
//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");
//   sendResponse(res, {
//     success: true,
//     message: "Logout successfully",
//     data: null,
//   });
// });

// export const AuthController = {
//   registerUserControllerDB,
//   verifyEmailOtp,
//   userLogin,
//   verifyLoginOtp,
//   googleLogin,
//   refreshTokenDB,
//   logout,
// };
import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";

const isDevelopment = config.node_env === "development";

const cookieOptions = {
  secure: !isDevelopment,
  sameSite: isDevelopment ? ("lax" as const) : ("none" as const),
  httpOnly: true,
};

const registerUserControllerDB = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerUser(payload);

    sendResponse(res, {
      success: true,
      message: "Registration successfully completed",
      data: result,
    });
  },
);

const verifyEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendResponse(res, {
      success: false,
      message: "Email and OTP are required",
      data: null,
    });
  }

  const result = await AuthService.verifyEmailOtp(email, otp);

  sendResponse(res, {
    success: true,
    message: "Email verified successfully",
    data: result,
  });
});

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.userLogin(req.body);

  sendResponse(res, {
    success: true,
    message: "Login OTP sent to your email",
    data: result,
  });
});

const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendResponse(res, {
      success: false,
      message: "Email and OTP are required",
      data: null,
    });
  }

  const result = await AuthService.verifyLoginOtp(email, otp);
  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    success: true,
    message: "Login successful",
    data: { accessToken, refreshToken },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.googleLogin(req.body);
  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    success: true,
    message: "Google login successful!",
    data: { accessToken, refreshToken },
  });
});

const refreshTokenDB = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    success: true,
    message: "Logout successfully",
    data: null,
  });
});

export const AuthController = {
  registerUserControllerDB,
  verifyEmailOtp,
  userLogin,
  verifyLoginOtp,
  googleLogin,
  refreshTokenDB,
  logout,
};
