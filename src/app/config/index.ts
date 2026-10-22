import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  app_url: process.env.APP_URL,
  database_url: process.env.DATABASE_URL,
  email_user: process.env.EMAIL_USER,
  email_password: process.env.EMAIL_PASSWORD,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  demo_candidate_email: process.env.DEMO_CANDIDATE_EMAIL,
  demo_company_email: process.env.DEMO_COMPANY_EMAIL,
  demo_admin_email: process.env.DEMO_ADMIN_EMAIL,
};
