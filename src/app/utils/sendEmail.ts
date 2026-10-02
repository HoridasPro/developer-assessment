import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_password,
  },
});

export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  otp: string,
) => {
  await transporter.sendMail({
    from: `"DevAssess" <${config.email_user}>`,
    to: email,
    subject: "Verify your DevAssess account OTP",
    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        "
      >
        <h2 style="color: #6366f1;">
          Verify Your Email
        </h2>

        <p>Hello ${name},</p>

        <p>
          Use the following OTP to verify your DevAssess account:
        </p>

        <div
          style="
            margin: 25px 0;
            padding: 18px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p style="color: #6b7280;">
          If you did not create a DevAssess account,
          please ignore this email.
        </p>

        <p style="color: #6b7280;">
          Best regards,<br />
          DevAssess Team
        </p>
      </div>
    `,
  });
};

export const sendLoginOtpEmail = async (
  email: string,
  name: string,
  otp: string,
) => {
  await transporter.sendMail({
    from: `"DevAssess" <${config.email_user}>`,
    to: email,
    subject: "Your DevAssess Login OTP",
    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        "
      >
        <h2 style="color: #6366f1;">
          Login Verification
        </h2>

        <p>Hello ${name},</p>

        <p>
          Use the following OTP to complete your DevAssess login:
        </p>

        <div
          style="
            margin: 25px 0;
            padding: 18px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p style="color: #6b7280;">
          If you did not try to login to DevAssess,
          please ignore this email.
        </p>

        <p style="color: #6b7280;">
          Best regards,<br />
          DevAssess Team
        </p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  await transporter.sendMail({
    from: `"DevAssess" <${config.email_user}>`,
    to: email,
    subject: "Welcome to DevAssess 🎉",
    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        "
      >
        <h2 style="color: #6366f1;">
          Welcome to DevAssess, ${name}! 🎉
        </h2>

        <p>
          Your email has been successfully verified.
        </p>

        <p>
          We're happy to have you with us.
          You can now start using your DevAssess account.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${config.app_url}/login"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Go to Login
          </a>
        </div>

        <p style="color: #6b7280;">
          Thanks for joining DevAssess!
        </p>

        <p style="color: #6b7280;">
          Best regards,<br />
          DevAssess Team
        </p>
      </div>
    `,
  });
};
