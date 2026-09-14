import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { AuhtRoutes } from "./app/module/auth/auth.route.ts";
import { globalErrorHandler } from "./app/middleware/globalErrorHandle.ts";
import { UserRoutes } from "./app/module/user/user.route";
import { AssessmentRoutes } from "./app/module/assessment/assessment.route.ts";
import { QuestionRoutes } from "./app/module/question/question.route.ts";
import { InvitationRoutes } from "./app/module/invitation/invitation.route.ts";
import { AttemptRoutes } from "./app/module/attempt/attempt.route.ts";
import { AnswerRoutes } from "./app/module/answer/answer.route.ts";
import { AdminRoutes } from "./app/module/admin/admin.route.ts";
import { PaymentRoutes } from "./app/module/payment/payment.route.ts";

const app: Application = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", AuhtRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1", AssessmentRoutes);
app.use("/api/v1/questions", QuestionRoutes);
app.use("/api/v1/invitations", InvitationRoutes);
app.use("/api/v1/attempts", AttemptRoutes);
app.use("/api/v1/attempts", AnswerRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/payments", PaymentRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome developer assessment & coding platform");
});

app.use(globalErrorHandler);

export default app;
