/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

// create token
const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

// verify token
const verifyToken = (token: string, secret: string) => {
  try {
    const verifyedToken = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      data: verifyedToken,
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
