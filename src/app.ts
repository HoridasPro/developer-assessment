import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./app/config";

import { AuhtRoutes } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./app/middleware/globalErrorHandle";
import { UserRoutes } from "./app/module/user/user.route";
// import { AssessmentRoutes } from "./app/module/assessment/assessment.route";
import { QuestionRoutes } from "./app/module/question/question.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", AuhtRoutes);
app.use("/api/v1/users", UserRoutes);
// app.use("/api/v1/", AssessmentRoutes);
app.use("/api/v1/questions", QuestionRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome developer assessment & coding platform");
});

app.use(globalErrorHandler);

export default app;
