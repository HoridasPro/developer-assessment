import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./app/config";

// import { AuhtRoutes } from "./app/module/auth/auth.route";

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

// app.use("/api/v1/auth", AuhtRoutes);

app.get("/", async (req: Request, res: Response) => {
	res.send("Welcome ph helth care");
});

export default app;
