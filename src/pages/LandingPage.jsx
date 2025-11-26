import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import SocialProofBar from '../components/landing/SocialProofBar';
import PainSection from '../components/landing/PainSection';
import StorySection from '../components/landing/StorySection';
import MethodSection from '../components/landing/MethodSection';
import TransformationProof from '../components/landing/TransformationProof';
import ProductSection from '../components/landing/ProductSection';
import PersonaPathsSection from '../components/landing/PersonaPathsSection';
import OfferSection from '../components/landing/OfferSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTA from '../components/landing/FinalCTA';
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
      <HeroSection onJoinWaitlist={scrollToOffer} />
      <SocialProofBar />
      <PainSection />
      <StorySection />
      <MethodSection />
      <TransformationProof />
      <ProductSection />
      <PersonaPathsSection />
      <OfferSection />
      <FAQSection />
      <FinalCTA onJoinWaitlist={scrollToOffer} />
      <LandingFooter />
    </div>
  );
}