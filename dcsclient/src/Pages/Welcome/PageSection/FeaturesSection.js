import React from "react";

import "../Styling/FeaturesSection.css";

const FeaturesSection = () => {
    return (
        <section id="features" className="features-section">
            <h2>Key Features</h2>
            <div className="features-list">
                <div className="feature-item">
                    <div className="feature-icon">
                        <i className="fa fa-cloud" aria-hidden="true"></i>
                    </div>
                    <h3>Cloud Storage</h3>
                    <p>
                        Store your files securely in the cloud and access them
                        from anywhere.
                    </p>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">
                        <i className="fa fa-share-alt" aria-hidden="true"></i>
                    </div>
                    <h3>Cross-Platform Sharing</h3>
                    <p>
                        Share your content seamlessly across different platforms
                        with a single upload.
                    </p>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">
                        <i className="fa fa-code" aria-hidden="true"></i>
                    </div>
                    <h3>Integration with Popular Platforms</h3>
                    <p>
                        Integrate with GitHub, YouTube, Google Drive, Facebook,
                        and more.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
