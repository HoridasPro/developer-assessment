// /** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
// import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

// // create token
// const createToken = (
//   payload: JwtPayload,
//   secret: string,
//   expiresIn: SignOptions,
// ) => {
//   const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
//   return token;
// };

// // verify token
// const verifyToken = (token: string, secret: string) => {
//   try {
//     const verifyedToken = jwt.verify(token, secret) as JwtPayload;
//     return {
//       success: true,
//       data: verifyedToken,
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

// export const jwtUtils = {
//   createToken,
//   verifyToken,
// };
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

// Create token
const createToken = (
  payload: JwtPayload,
  secret: string,
  options: SignOptions,
) => {
  return jwt.sign(payload, secret, options);
};

// Verify token
const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret) as JwtPayload;

    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
