import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from 'path';
import ejs from 'ejs';
dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log("SMTP Config:", {
  service: process.env.SMTP_SERVICE,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
});
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465", // Use true for 465, false for other ports
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Render an EJS email template


const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

// send an email using nodemailer

export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
  const html = await renderEmailTemplate(templateName, data);

  const mailOptions = {
    from: `<${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
