const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL, // Use environment variables
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"LinkUp Connects the SRMAP Students" <${process.env.EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${options.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate error if needed
  }
};

module.exports = sendEmail;
