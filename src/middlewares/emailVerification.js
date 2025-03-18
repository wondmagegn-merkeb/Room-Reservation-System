import nodemailer from "nodemailer"
import { prisma } from "../prismaClient.js";

// configure SMTP transporter
const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    }
})

// define the middleware for email verification
export const verifyEmailMiddleware =async (req,res , next)=>{
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email",
            text: `you're email has been verified`,
        })
        next()// if no error that means it is verified
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid email address" })
    }
}
export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; 
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D89EF;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #555;">
              Thank you for signing up! Please confirm your email by clicking the button below.
            </p>
            <a href="${verificationUrl}" 
              style="display: inline-block; background-color: #2D89EF; color: white; padding: 12px 20px; text-decoration: none; 
                      font-size: 16px; border-radius: 5px; margin-top: 10px;">
              Verify Email
            </a>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">
              If you didn’t request this email, please ignore it.
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);

    if (error.response) {
      console.error("SMTP Error Response: ", error.response);
    }

    // Return the error instead of using `res`
    return { success: false, message: "Error sending verification email", error: error.message || "Unknown error" };
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        verificationToken: null, // Remove token after verification
      },
    });

   return res.redirect(`${process.env.CLIENT_URL}/login`);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};


