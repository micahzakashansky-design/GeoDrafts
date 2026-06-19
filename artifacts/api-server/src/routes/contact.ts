import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "darabrawl1@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/contact", async (req: Request, res: Response) => {
  const { email, subject, message } = req.body;

  if (!email || !message) {
    res.status(400).json({ error: "Email and message are required" });
    return;
  }

  if (!process.env.EMAIL_PASS) {
    req.log?.error("EMAIL_PASS not configured");
    res.status(500).json({ error: "Email service not configured" });
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "darabrawl1@gmail.com",
      to: "darabrawl1@gmail.com",
      subject: `[GeoDrafts Suggestion] ${subject || "No Subject"}`,
      text: `From: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    req.log?.error(error, "Failed to send email");
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
