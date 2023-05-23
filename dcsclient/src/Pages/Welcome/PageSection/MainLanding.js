import React from "react";

import Header from "./Header";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
// import HowItWorksSection from './HowItWorksSection';
// import IntegrationSection from './IntegrationSection';
// import PricingSection from './PricingSection';
// import AboutSection from './AboutSection';
// import TestimonialsSection from './TestimonialsSection';
import ContactSection from './ContactSection';
import Footer from "./Footer";

import "../Styling/MainLanding.css";

const MainLanding = () => {
    return (
        <div>
            <Header />
            <HeroSection />
            <FeaturesSection />
            {/* <HowItWorksSection />
            <IntegrationSection />
            <PricingSection />
            <AboutSection />
            <TestimonialsSection />
            */}
            <ContactSection /> 
            <Footer />
        </div>
    );
};

export default MainLanding;
