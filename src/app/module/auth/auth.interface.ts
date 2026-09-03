import { Role } from "../../../../generated/prisma/enums";

// User register
export interface IUserRegisterPayload {
  name: string;
  email: string;
  password: string;
  profilePhoto: string;
  role: Role;
  isActive: boolean;
  phone: string;
}

// User login
export interface IUserLoginPayload {
  email: string;
  password: string;
}
