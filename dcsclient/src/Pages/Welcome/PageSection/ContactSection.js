import React from "react";
import "../Styling/ContactSection.css";

import useRequestSendEmail from "../../../Hooks/RequestSendEmail";

const ContactSection = () => {
    const { sendEmailContactUs, loading } = useRequestSendEmail();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get("name");
        const email = formData.get("email");
        const message = formData.get("message");

        // Send the form data to the server
        sendEmailContactUs({ name: name, email: email, message: message }, () => {
            alert("Message sent successfully!");
        });
    };

    return (
        <section id="contact" className="contact-section">
            <h2>Contact Us</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="feature-label" htmlFor="name">Name</label>
                    <input className="feature-input" type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                    <label className="feature-label" htmlFor="email">Email</label>
                    <input className="feature-input" type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                    <label className="feature-label" htmlFor="message">Message</label>
                    <textarea className="feature-textarea" id="message" name="message" required></textarea>
                </div>
                <button type="submit" className="submit-button">
                    Submit
                </button>
            </form>
        </section>
    );
};

export default ContactSection;
