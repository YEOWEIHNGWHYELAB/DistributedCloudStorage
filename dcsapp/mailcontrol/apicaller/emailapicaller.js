// Contact us email
exports.contactus = async (req, res, sgMail) => {
    const { name, email, message } = req.body;

    const msg = {
        to: "", // Your company email
        from: "", // Email address to send from
        subject: "Contact for DCS",
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
        // Send the email using SendGrid
        await sgMail.send(msg);

        // Send a response back to the front-end
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        // console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
};
