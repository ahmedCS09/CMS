import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, filePath) {
  try {
    console.log(`✉️ Attempting to send email to: ${to}`);
    console.log(`📎 Attachment path: ${filePath}`);

    if (!to) {
      throw new Error("No recipient email address provided.");
    }

    const info = await transporter.sendMail({
      from: `"MediConnect Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Medicine Invoice",
      text: "Thank you for your purchase. Please find your invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          path: filePath
        }
      ]
    });

    console.log("✅ Email sent successfully!", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
}


export default sendEmail;