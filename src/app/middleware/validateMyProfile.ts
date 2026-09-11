// import { NextFunction } from "express";
// import { Role } from "../../../generated/prisma/enums";
// import { UserValidation } from "../module/user/user.validation";

// export const validateMyProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const schema =
//       req.data?.role === Role.CANDIDATE
//         ? UserValidation.updateCandidateProfileValidationSchema
//         : UserValidation.updateCompanyProfileValidationSchema;

//     await schema.parseAsync({
//       body: req.body,
//       params: req.params,
//       query: req.query,
//     });

//     next();
//   } catch (error) {
//     next(error);
//   }
// };