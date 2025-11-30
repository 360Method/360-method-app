import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, ArrowRight, Home, Zap, Droplets, Flame, Wind, Wrench } from 'lucide-react';

/**
 * RiskRevelationOverlay - First "Aha Moment"
 *
 * Shows immediately after address confirmation.
 * Dramatic reveal of systems at risk based on home age.
 * Personalizes the headline based on intent survey answers.
 *
 * This is THE moment users realize they need this app.
 */

// ============================================
// SYSTEM REPLACEMENT COSTS
// Used to calculate total risk amount
// ============================================
const SYSTEM_REPLACEMENT_COSTS = {
  'Roof': { min: 8000, max: 15000, emoji: '🏠', icon: Home, color: 'red' },
  'Roof System': { min: 8000, max: 15000, emoji: '🏠', icon: Home, color: 'red' },
  'HVAC': { min: 5000, max: 12000, emoji: '❄️', icon: Wind, color: 'orange' },
  'HVAC System': { min: 5000, max: 12000, emoji: '❄️', icon: Wind, color: 'orange' },
  'Water Heater': { min: 1200, max: 3000, emoji: '🔥', icon: Flame, color: 'yellow' },
  'Electrical': { min: 2000, max: 4000, emoji: '⚡', icon: Zap, color: 'blue' },
  'Electrical Panel': { min: 2000, max: 4000, emoji: '⚡', icon: Zap, color: 'blue' },
  'Electrical System': { min: 2000, max: 4000, emoji: '⚡', icon: Zap, color: 'blue' },
  'Plumbing': { min: 3000, max: 15000, emoji: '🚿', icon: Droplets, color: 'cyan' },
  'Plumbing System': { min: 3000, max: 15000, emoji: '🚿', icon: Droplets, color: 'cyan' },
  'Windows': { min: 5000, max: 20000, emoji: '🪟', icon: Home, color: 'purple' },
  'Furnace': { min: 3000, max: 8000, emoji: '🔥', icon: Flame, color: 'orange' },
  'Air Conditioner': { min: 4000, max: 10000, emoji: '❄️', icon: Wind, color: 'blue' },
  'Siding': { min: 8000, max: 25000, emoji: '🧱', icon: Home, color: 'gray' },
  'Foundation': { min: 5000, max: 30000, emoji: '🏗️', icon: Home, color: 'brown' },
  'Foundation & Structure': { min: 5000, max: 30000, emoji: '🏗️', icon: Home, color: 'brown' }
};

// Default for unknown systems
const DEFAULT_COST = { min: 2000, max: 5000, emoji: '🔧', icon: Wrench, color: 'slate' };

export default function RiskRevelationOverlay({
  propertyData,
  insights = [],
  intentData,
  onContinue
}) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [showTotal, setShowTotal] = useState(false);

  // Calculate home age
  const homeAge = propertyData?.year_built
    ? new Date().getFullYear() - propertyData.year_built
    : null;

  // Get systems at risk (filter to those with 'verify' status - past lifespan)
  const systemsAtRisk = insights
    .filter(i => i.status === 'verify')
    .slice(0, 4); // Max 4 for display

  // Calculate total risk amount
  const totalRiskAmount = systemsAtRisk.reduce((sum, system) => {
    const systemName = system.system || system.name;
    const costs = SYSTEM_REPLACEMENT_COSTS[systemName] || DEFAULT_COST;
    return sum + costs.max;
  }, 0);

  // Animate the total counting up
  useEffect(() => {
    if (!showTotal || totalRiskAmount === 0) return;

    const duration = 2000;
    const steps = 60;
    const increment = totalRiskAmount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalRiskAmount) {
        setAnimatedTotal(totalRiskAmount);
        clearInterval(timer);
      } else {
        setAnimatedTotal(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [showTotal, totalRiskAmount]);

  // Stagger animations
  useEffect(() => {
    const cardsTimer = setTimeout(() => setShowCards(true), 500);
    const totalTimer = setTimeout(() => setShowTotal(true), 1200);

    return () => {
      clearTimeout(cardsTimer);
      clearTimeout(totalTimer);
    };
  }, []);

  // Get personalized headline based on intent
  const headline = getPersonalizedHeadline(intentData, systemsAtRisk, homeAge);

  // If no systems at risk, show a positive message
  if (systemsAtRisk.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col justify-center"
      >
        <Card className="border-none shadow-2xl bg-gradient-to-br from-green-800 via-slate-900 to-slate-900 text-white overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <Shield className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                Your Home Looks Good!
              </h1>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                {homeAge ? (
                  <>Based on your {homeAge}-year-old home, your major systems are likely within their expected lifespans. Let's keep it that way!</>
                ) : (
                  <>Let's document your home systems to keep everything running smoothly and catch small issues before they become big problems.</>
                )}
              </p>

              <Button
                onClick={onContinue}
                className="gap-3 text-lg font-semibold"
                style={{ backgroundColor: '#f97316', minHeight: '56px' }}
              >
                <Shield className="w-5 h-5" />
                Let's Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex flex-col justify-center"
    >
      <Card className="border-none shadow-2xl bg-gradient-to-br from-red-900/80 via-slate-900 to-slate-900 text-white overflow-hidden">
        <CardContent className="p-6 md:p-10">
          {/* Alert Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {headline}
            </h1>
            <p className="text-slate-400">
              Your {homeAge ? `${homeAge}-year-old` : ''} home has{' '}
              <span className="text-red-400 font-semibold">
                {systemsAtRisk.length} system{systemsAtRisk.length > 1 ? 's' : ''}
              </span>{' '}
              past typical lifespan
            </p>
          </motion.div>

          {/* Risk Cards Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            {systemsAtRisk.map((system, idx) => (
              <motion.div
                key={system.system || system.name || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: showCards ? 1 : 0,
                  y: showCards ? 0 : 20
                }}
                transition={{ delay: idx * 0.15, duration: 0.4 }}
              >
                <RiskCard system={system} homeAge={homeAge} />
              </motion.div>
            ))}
          </div>

          {/* Total at Risk */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: showTotal ? 1 : 0.8,
              opacity: showTotal ? 1 : 0
            }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="bg-red-500/20 border-2 border-red-500/40 rounded-2xl p-5 md:p-6 text-center mb-6"
          >
            <p className="text-sm text-red-300 uppercase tracking-wide mb-1">
              Total Potential Risk
            </p>
            <p className="text-4xl md:text-5xl font-bold text-red-400">
              ${animatedTotal.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              if these systems fail without warning
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Button
              onClick={onContinue}
              className="w-full gap-3 text-lg font-semibold"
              style={{ backgroundColor: '#f97316', minHeight: '56px' }}
            >
              <Shield className="w-5 h-5" />
              Let's Protect Your Home
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              We'll help you track and prevent these disasters
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Individual risk card for a system
 */
function RiskCard({ system, homeAge }) {
  const systemName = system.system || system.name || 'System';
  const costs = SYSTEM_REPLACEMENT_COSTS[systemName] || DEFAULT_COST;

  // Calculate estimated age
  const systemAge = system.estimatedAge || system.yearsOld || homeAge || '?';

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
      <div className="text-3xl mb-2">{costs.emoji}</div>
      <h3 className="font-semibold text-white text-sm md:text-base truncate">
        {systemName.replace(' System', '')}
      </h3>
      <p className="text-xs md:text-sm text-slate-400">
        {systemAge}+ years old
      </p>
      <p className="text-lg md:text-xl font-bold text-red-400 mt-2">
        up to ${(costs.max / 1000).toFixed(0)}K
      </p>
    </div>
  );
}

/**
 * Get personalized headline based on user intent and risks
 */
function getPersonalizedHeadline(intent, systemsAtRisk, homeAge) {
  if (!intent) {
    return "Your Home Has Hidden Risks";
  }

  const { fear, goal, trigger } = intent;

  // Check if their specific fear matches a risk
  if (fear === 'hvac_failure') {
    const hasHVACRisk = systemsAtRisk.some(s =>
      (s.system || s.name || '').toLowerCase().includes('hvac') ||
      (s.system || s.name || '').toLowerCase().includes('furnace') ||
      (s.system || s.name || '').toLowerCase().includes('air conditioner')
    );
    if (hasHVACRisk) {
      return "Your HVAC System Needs Attention";
    }
  }

  if (fear === 'roof_leak') {
    const hasRoofRisk = systemsAtRisk.some(s =>
      (s.system || s.name || '').toLowerCase().includes('roof')
    );
    if (hasRoofRisk) {
      return "Your Roof May Be at Risk";
    }
  }

  // Trigger-based headlines
  if (trigger === 'just_bought') {
    return "Here's What Your New Home Needs";
  }

  if (trigger === 'had_emergency') {
    return "Let's Prevent Your Next Emergency";
  }

  // Goal-based headlines
  if (goal === 'prepare_sell') {
    return "Here's What Buyers Will Notice";
  }

  if (goal === 'save_money') {
    return "Here's Where Your Money's at Risk";
  }

  if (goal === 'build_wealth') {
    return "Protect Your Investment Property";
  }

  // Default headlines based on home age
  if (homeAge && homeAge > 30) {
    return "Your Home Has Hidden Risks";
  }

  if (homeAge && homeAge > 15) {
    return "Systems That Need Your Attention";
  }

  return "Your Home Has Hidden Risks";
}
