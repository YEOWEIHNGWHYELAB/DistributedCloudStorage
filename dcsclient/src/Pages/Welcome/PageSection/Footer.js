import React from "react";
import "../Styling/Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>
                    &copy; {new Date().getFullYear()} Your Company. All rights
                    reserved.
                </p>
                <ul className="footer-menu">
                    <li>
                        <a href="#terms">Terms of Service</a>
                    </li>
                    <li>
                        <a href="#privacy">Privacy Policy</a>
                    </li>
                    <li>
                        <a href="#contact">Contact</a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
