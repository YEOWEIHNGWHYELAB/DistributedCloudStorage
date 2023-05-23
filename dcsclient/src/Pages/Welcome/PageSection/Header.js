import React from "react";

import "../Styling/Header.css";

const Header = () => {
    return (
        <header className="header">
            <nav className="navigation">
                <div className="logo">Your System Logo</div>
                <ul className="menu">
                    <li>
                        <a href="#features">Features</a>
                    </li>
                    <li>
                        <a href="#how-it-works">How It Works</a>
                    </li>
                    <li>
                        <a href="#integration">Integration</a>
                    </li>
                    <li>
                        <a href="#pricing">Pricing</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                    <li>
                        <a href="#contact">Contact</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
