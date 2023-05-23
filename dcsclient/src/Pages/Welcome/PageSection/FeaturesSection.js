import React from "react";

import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ShareIcon from '@mui/icons-material/Share';
import AdsClickIcon from '@mui/icons-material/AdsClick';

import "../Styling/FeaturesSection.css";

const FeaturesSection = () => {
    return (
        <section id="features" className="features-section">
            <h2>Features</h2>
            <div className="feature-card-container">
                <div className="feature-card">
                    <CloudSyncIcon />
                    <h3>Cloud Storage</h3>
                    <p>
                        SMCO supports the storing of your data through our
                        distributed cloud storage system.
                    </p>
                </div>
                <div className="feature-card">
                    <ShareIcon />
                    <h3>Multi-Platform Support</h3>
                    <p>
                        DCS supports multiple social media platform inclduing 
                        GitHub and YouTube.
                    </p>
                </div>
                <div className="feature-card">
                    <AdsClickIcon />
                    <h3>Ease of Use</h3>
                    <p>
                        Load in your authentication access tokens and start 
                        playing!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
