import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "micahzakashansky@gmail.com",
    pass: "iqrf urvu lyrz dnyz",
  },
});

router.post("/contact", async (req: Request, res: Response) => {
  const { email, subject, message } = req.body;

  if (!email || !message) {
    res.status(400).json({ error: "Email and message are required" });
    return;
  }

  try {
    const mailOptions = {
      from: "micahzakashansky@gmail.com",
      to: "micahzakashansky@gmail.com",
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
