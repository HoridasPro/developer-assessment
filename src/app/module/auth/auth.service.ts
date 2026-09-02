import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IUserRegisterPayload } from "./auth.interface";

const registerUser = async (payload: IUserRegisterPayload) => {
	const { name, password, profilePhoto, role, isActive, phone } = payload;
	const email = payload.email.trim().toLowerCase();

	// 1. Check if user exists
	const isUserExists = await prisma.user.findUnique({
		where: { email },
		omit: {
			password: true,
		},
	});

	if (isUserExists) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	// 3. Save user to DB using Prisma
	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			profilePhoto,
			phone,
			role,
			isActive,
		},
	});
	const result = {
		id: newUser.id,
		name: newUser.name,
		email: newUser.email,
		profilePhoto: newUser.profilePhoto,
		role: newUser.role,
		isActive: newUser.isActive,
		phone: newUser.phone,
	};

	return result;
};

export const AuthService = {
	registerUser,
};
