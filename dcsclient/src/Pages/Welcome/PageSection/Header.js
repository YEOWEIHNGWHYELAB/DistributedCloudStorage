import React from "react";

import "../Styling/Header.css";

const Header = () => {
    return (
        <header className="headerwelcome">
            <nav className="navigationwelcome">
                <div className="logowelcome">Your System Logo</div>
                <ul className="menuwelcome">
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
