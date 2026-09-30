import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_password,
  },
});

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const verificationUrl = `${config.app_url}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"DevAssess" <${config.email_user}>`,
    to: email,
    subject: "Verify your DevAssess account",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to DevAssess, ${name}!</h2>

        <p>
          Thank you for creating your account.
          Please verify your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #6366f1;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Verify Email
        </a>

        <p style="margin-top: 20px;">
          This link will expire in 15 minutes.
        </p>
      </div>
    `,
  });
};
