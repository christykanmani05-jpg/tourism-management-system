const nodemailer = require("nodemailer");

let cachedTransporter = null;

async function createTransporter() {
	if (cachedTransporter) return cachedTransporter;

	if (process.env.SMTP_USER && process.env.SMTP_PASS) {
		cachedTransporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || "smtp.gmail.com",
			port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
			secure: process.env.SMTP_SECURE === "true",
			pool: true,
			tls: { rejectUnauthorized: false },
			socketTimeout: process.env.SMTP_SOCKET_TIMEOUT ? Number(process.env.SMTP_SOCKET_TIMEOUT) : 20000,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
		return cachedTransporter;
	}

	try {
		const testAccount = await nodemailer.createTestAccount();
		cachedTransporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
		return cachedTransporter;
	} catch (err) {
		// Fall back to local JSON transport if Ethereal account creation fails (e.g., offline)
		cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
		return cachedTransporter;
	}
}

async function sendMail(options) {
	const transporter = await createTransporter();
	const info = await transporter.sendMail(options);
	const previewUrl = nodemailer.getTestMessageUrl(info);
	return { info, previewUrl };
}

module.exports = { createTransporter, sendMail };


