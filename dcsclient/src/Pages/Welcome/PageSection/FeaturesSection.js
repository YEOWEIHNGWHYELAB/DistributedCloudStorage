import React from "react";
import "../Styling/FeaturesSection.css";

const FeaturesSection = () => {
    return (
        <section id="features" className="features-section">
            <h2>Features</h2>
            <div className="feature-card">
                <img src="path/to/feature-1.png" alt="Feature 1" />
                <h3>Feature 1</h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam rutrum tincidunt risus in fermentum.
                </p>
            </div>
            <div className="feature-card">
                <img src="path/to/feature-2.png" alt="Feature 2" />
                <h3>Feature 2</h3>
                <p>
                    Morbi et odio at nibh vestibulum interdum vitae id magna.
                    Suspendisse potenti.
                </p>
            </div>
            <div className="feature-card">
                <img src="path/to/feature-3.png" alt="Feature 3" />
                <h3>Feature 3</h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam rutrum tincidunt risus in fermentum.
                </p>
            </div>
        </section>
    );
};

export default FeaturesSection;
