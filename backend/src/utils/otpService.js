import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Save OTP to Database
export const saveOTP = async (email) => {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

    await prisma.otp.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt }
    });

    return otp;
};

// ✅ Send OTP via Email
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; 
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #2D89EF;">Your OTP Code</h2>
                    <p style="font-size: 16px; color: #555;">
                        Use the code below to complete your verification. This code is valid for <strong>5 minutes</strong>.
                    </p>
                    <div style="font-size: 24px; font-weight: bold; color: #2D89EF; 
                                padding: 10px; background: #f1f1f1; display: inline-block; border-radius: 5px;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #999; margin-top: 20px;">
                        If you did not request this, please ignore this email.
                    </p>
                </div>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
};


// ✅ Verify OTP
export const verifyOTP = async (email, otp) => {
    const otpEntry = await prisma.otp.findUnique({ where: { email } });

    if (!otpEntry || otpEntry.otp !== otp) {
        throw new Error("Invalid or expired OTP.");
    }

    if (new Date() > otpEntry.expiresAt) {
        throw new Error("OTP has expired.");
    }

    await prisma.otp.delete({ where: { email } });

    return true;
};
