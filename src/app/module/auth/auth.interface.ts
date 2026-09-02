import { Role } from "../../../../generated/prisma/enums";

export interface IUserRegisterPayload {
	name: string;
	email: string;
	password: string;
	profilePhoto: string;
	role: Role;
	isActive: boolean;
	phone: string;
}
