import React from "react";

import "../Styling/Header.css";

const Header = () => {
    return (
        <header className="headerwelcome">
            <nav className="navigationwelcome">
                <div className="logowelcome">Distributed Cloud Storage System</div>
                <ul className="menuwelcome">
                    <li>
                        <a href="#features">Features</a>
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
