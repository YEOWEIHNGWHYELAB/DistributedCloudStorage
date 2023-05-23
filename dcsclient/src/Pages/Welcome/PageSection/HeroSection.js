import React from "react";

import "../Styling/HeroSection.css"

const HeroSection = () => {
    return (
        <section className="mainwelcomehero">
            <div>
                <h1>Social Media & Cloud Overlord</h1>
                <p>Store, Share, and Sync Your Content Across Platforms</p>
                <button className="cta-button">Get Started</button>
            </div>
        </section>
    );
};

export default HeroSection;
