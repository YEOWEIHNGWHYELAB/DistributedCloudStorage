import React from "react";

import Header from "./Header";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import ContactSection from './ContactSection';
import Footer from "./Footer";

const MainLanding = () => {
    return (
        <div>
            <Header />
            <HeroSection />
            <FeaturesSection />
            <ContactSection /> 
            <Footer />
        </div>
    );
};

export default MainLanding;
