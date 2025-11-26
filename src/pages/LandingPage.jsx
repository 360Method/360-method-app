import React from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import SocialProofBar from '../components/landing/SocialProofBar';
import PainSection from '../components/landing/PainSection';
import MethodSection from '../components/landing/MethodSection';
import OfferSection from '../components/landing/OfferSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  const scrollToOffer = () => {
    const element = document.getElementById('offer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <HeroSection onJoinWaitlist={scrollToOffer} />
      <SocialProofBar />
      <PainSection />
      <MethodSection />
      <OfferSection />
      <LandingFooter />
    </div>
  );
}