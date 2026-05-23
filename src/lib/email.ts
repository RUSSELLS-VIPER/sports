import nodemailer from "nodemailer";

function getEmailConfig() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || "587");
  const secure = (process.env.EMAIL_SECURE || "false") === "true";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error("Missing email SMTP configuration in environment");
  }

  // Gmail commonly rejects custom `from` addresses unless configured as aliases.
  const normalizedHost = host.toLowerCase();
  const effectiveFrom = normalizedHost.includes("gmail.com") ? user : from;

  return { host, port, secure, user, pass, from: effectiveFrom };
}

export async function sendOtpEmail(to: string, otp: string) {
  const cfg = getEmailConfig();
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: "Your OTP for Athlete Registration",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  });
}
