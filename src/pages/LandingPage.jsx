import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import SocialProofBar from '../components/landing/SocialProofBar';
import PainSection from '../components/landing/PainSection';
import StorySection from '../components/landing/StorySection';
import MethodSection from '../components/landing/MethodSection';
import TransformationProof from '../components/landing/TransformationProof';
import ProductSection from '../components/landing/ProductSection';
import PersonaPathsSection from '../components/landing/PersonaPathsSection';
import PricingSection from '../components/landing/PricingSection';
import OfferSection from '../components/landing/OfferSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SocialProofBar />
      <PainSection />
      <StorySection />
      <MethodSection />
      <TransformationProof />
      <ProductSection />
      <PersonaPathsSection />
      <PricingSection />
      <OfferSection />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}