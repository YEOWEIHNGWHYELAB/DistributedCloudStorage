import React from "react";
import "../Styling/Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>
                    &copy; {new Date().getFullYear()} WHYELAB. All rights reserved.
                </p>
                <ul className="footer-menu">
                    <li>
                        <a href="https://docs.google.com/document/d/1wGXo5JCmCA9qSeHi0f5LXQEjpQx-n2yLhbiwMZd7bl0/edit?usp=sharing">
                            Terms of Service
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
