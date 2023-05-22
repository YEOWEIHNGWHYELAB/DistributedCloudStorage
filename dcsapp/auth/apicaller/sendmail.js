exports.sendEmailResetPasswordKickStart = async (sgMail, username, email, code) => {
    const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER,
        subject: 'SMCOverlord Password Reset',
        text: `
        Dear ${username},

        Your code to reset password is ${code}

        Please enter it within a minute!

        Thank you!

        Best Regards,
        WHYELAB

        This is a system generated email. Please do not reply!
        `,
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        // console.error(error);
    }
};

exports.sendEmailPasswordConfirmation = async (sgMail, username, email, new_password) => {
    const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER,
        subject: 'SMCOverlord Password Reset',
        text: `
        Dear ${username},

        Your new password is: ${new_password}

        Please change your password immediately after logging in.

        Thank you!

        Best Regards,
        WHYELAB

        This is a system generated email. Please do not reply!
        `,
    };

    try {
        await sgMail.send(msg);
        // console.log('Email sent successfully!');
    } catch (error) {
        // console.error(error);
    }
};
