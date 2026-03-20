const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your website to talk to this API
app.use(express.json());

// 1. Configure your own SMTP settings (The "Engine")
const transporter = nodemailer.createTransport({
    host: "your-mail-server.com", 
    port: 587,
    secure: false, 
    auth: {
        user: "website@linahernandez.com",
        pass: "your-secure-password"
    }
});

// 2. The Endpoint your website calls
app.post('/send-mail', async (req, res) => {
    const { name, email, reason, message } = req.body;

    const mailOptions = {
        from: '"Lina Website" <website@linahernandez.com>',
        to: "rekojmcdev@gmail.com",
        subject: `New Inquiry: ${reason}`,
        text: `From: ${name} (${email})\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: "Sent successfully" });
    } catch (error) {
        res.status(500).send({ error: "Failed to send" });
    }
});

app.listen(3000, () => console.log('Mail API running on port 3000'));