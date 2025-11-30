import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Edit2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Home,
  Wind,
  Droplets,
  Zap,
  Flame,
  Wrench
} from 'lucide-react';

/**
 * SmartSystemConfirmation - Step 2 of onboarding
 *
 * Shows auto-populated system guesses based on home age.
 * User can tap to confirm, update, or mark as unknown.
 * Minimizes typing - just tap confirmations.
 */

// System icons mapping
const SYSTEM_ICONS = {
  'Roof': Home,
  'Roof System': Home,
  'HVAC': Wind,
  'HVAC System': Wind,
  'Water Heater': Flame,
  'Electrical': Zap,
  'Electrical System': Zap,
  'Electrical Panel': Zap,
  'Plumbing': Droplets,
  'Plumbing System': Droplets,
  'Foundation': Home,
  'Foundation & Structure': Home
};

// System emojis
const SYSTEM_EMOJIS = {
  'Roof': '🏠',
  'Roof System': '🏠',
  'HVAC': '❄️',
  'HVAC System': '❄️',
  'Water Heater': '🔥',
  'Electrical': '⚡',
  'Electrical System': '⚡',
  'Electrical Panel': '⚡',
  'Plumbing': '🚿',
  'Plumbing System': '🚿',
  'Foundation': '🏗️',
  'Foundation & Structure': '🏗️'
};

export default function SmartSystemConfirmation({
  propertyData,
  insights = [],
  onNext,
  onBack
}) {
  // Track confirmation status for each system
  const [confirmations, setConfirmations] = useState({});
  const [expandedSystem, setExpandedSystem] = useState(null);

  const homeAge = propertyData?.year_built
    ? new Date().getFullYear() - propertyData.year_built
    : null;

  // Get top systems to confirm (prioritize at-risk systems)
  const topSystems = insights
    .filter(i => i.status === 'verify' || i.status === 'monitor')
    .slice(0, 4);

  const handleConfirm = (systemName) => {
    setConfirmations(prev => ({
      ...prev,
      [systemName]: 'confirmed'
    }));
    setExpandedSystem(null);
  };

  const handleUpdated = (systemName) => {
    setConfirmations(prev => ({
      ...prev,
      [systemName]: 'updated'
    }));
    setExpandedSystem(null);
  };

  const handleUnknown = (systemName) => {
    setConfirmations(prev => ({
      ...prev,
      [systemName]: 'unknown'
    }));
    setExpandedSystem(null);
  };

  const handleContinue = () => {
    onNext({ systemConfirmations: confirmations });
  };

  const handleSkip = () => {
    onNext({ systemConfirmations: {} });
  };

  const toggleExpand = (systemName) => {
    setExpandedSystem(expandedSystem === systemName ? null : systemName);
  };

  // If no systems to confirm, skip this step
  if (topSystems.length === 0) {
    // Auto-advance after a brief moment
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onNext({ systemConfirmations: {} });
      }, 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header Card */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 md:p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Quick System Check</h1>
          <p className="text-slate-400 text-sm md:text-base">
            Based on your {homeAge ? `${homeAge}-year-old` : ''} home, we've made some guesses.
            <br className="hidden md:block" />
            <span className="text-slate-300">Tap to correct anything that's different.</span>
          </p>
        </CardContent>
      </Card>

      {/* System Cards */}
      <div className="space-y-3">
        {topSystems.map((system, idx) => (
          <SystemCard
            key={system.system || system.name || idx}
            system={system}
            homeAge={homeAge}
            yearBuilt={propertyData?.year_built}
            status={confirmations[system.system || system.name]}
            isExpanded={expandedSystem === (system.system || system.name)}
            onToggleExpand={() => toggleExpand(system.system || system.name)}
            onConfirm={() => handleConfirm(system.system || system.name)}
            onUpdated={() => handleUpdated(system.system || system.name)}
            onUnknown={() => handleUnknown(system.system || system.name)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleContinue}
          className="w-full gap-2 text-lg font-semibold"
          style={{ backgroundColor: '#f97316', minHeight: '56px' }}
        >
          <Check className="w-5 h-5" />
          Looks Good - Continue
          <ArrowRight className="w-5 h-5" />
        </Button>

        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2 transition-colors"
        >
          I'll update these later
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-slate-400 text-center px-4">
        Don't worry if you're not sure - you can always update this later in the app.
      </p>
    </div>
  );
}

/**
 * Individual system card with expandable confirmation options
 */
function SystemCard({
  system,
  homeAge,
  yearBuilt,
  status,
  isExpanded,
  onToggleExpand,
  onConfirm,
  onUpdated,
  onUnknown
}) {
  const systemName = system.system || system.name || 'System';
  const emoji = SYSTEM_EMOJIS[systemName] || '🔧';
  const IconComponent = SYSTEM_ICONS[systemName] || Wrench;

  // Generate smart suggestion based on home age
  const suggestion = generateSuggestion(system, homeAge, yearBuilt);

  // Status colors
  const getStatusStyles = () => {
    switch (status) {
      case 'confirmed':
        return 'border-green-300 bg-green-50';
      case 'updated':
        return 'border-blue-300 bg-blue-50';
      case 'unknown':
        return 'border-slate-300 bg-slate-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-xl border-2 transition-colors overflow-hidden ${getStatusStyles()}`}
    >
      {/* Main row - always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-slate-900">
              {systemName.replace(' System', '')}
            </h3>
            <p className="text-sm text-slate-600">{suggestion.text}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {status && (
            <Badge
              variant={status === 'confirmed' ? 'default' : 'secondary'}
              className={`text-xs ${
                status === 'confirmed' ? 'bg-green-500' :
                status === 'updated' ? 'bg-blue-500 text-white' :
                'bg-slate-400 text-white'
              }`}
            >
              {status === 'confirmed' ? 'Original' :
               status === 'updated' ? 'Replaced' : 'Unknown'}
            </Badge>
          )}

          {/* Expand/collapse icon */}
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <Edit2 className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3">Is this correct?</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  icon={Check}
                  label="Yes, original"
                  description="Never been replaced"
                  selected={status === 'confirmed'}
                  onClick={onConfirm}
                  color="green"
                />
                <OptionButton
                  icon={RefreshCw}
                  label="It's been replaced"
                  description="Updated since built"
                  selected={status === 'updated'}
                  onClick={onUpdated}
                  color="blue"
                />
                <OptionButton
                  icon={HelpCircle}
                  label="I'm not sure"
                  description="Will check later"
                  selected={status === 'unknown'}
                  onClick={onUnknown}
                  color="slate"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Option button for system confirmation
 */
function OptionButton({ icon: Icon, label, description, selected, onClick, color }) {
  const colorClasses = {
    green: selected ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-green-300',
    blue: selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300',
    slate: selected ? 'border-slate-500 bg-slate-100 text-slate-700' : 'border-slate-200 hover:border-slate-300'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${colorClasses[color]}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
}

/**
 * Generate smart suggestion text based on system and home age
 */
function generateSuggestion(system, homeAge, yearBuilt) {
  // Get expected lifespan from system data or use defaults
  const avgYears = system.avgYears || getDefaultLifespan(system.system || system.name);

  if (!homeAge) {
    return {
      text: 'Status unknown',
      status: 'unknown',
      confidence: 'low'
    };
  }

  const expectedReplacements = Math.floor(homeAge / avgYears);

  if (expectedReplacements === 0) {
    return {
      text: `Likely original (${homeAge} years old)`,
      status: 'original',
      confidence: 'high'
    };
  } else if (expectedReplacements === 1) {
    const estimatedYear = yearBuilt + avgYears;
    return {
      text: `Probably replaced around ${estimatedYear}`,
      status: 'replaced_once',
      estimatedYear,
      confidence: 'medium'
    };
  } else {
    return {
      text: `May have been replaced ${expectedReplacements}+ times`,
      status: 'replaced_multiple',
      confidence: 'low'
    };
  }
}

/**
 * Default lifespans for common systems
 */
function getDefaultLifespan(systemName) {
  const lifespans = {
    'Roof': 25,
    'Roof System': 25,
    'HVAC': 15,
    'HVAC System': 15,
    'Water Heater': 12,
    'Electrical': 40,
    'Electrical System': 40,
    'Electrical Panel': 40,
    'Plumbing': 50,
    'Plumbing System': 50,
    'Foundation': 100,
    'Foundation & Structure': 100,
    'Windows': 25,
    'Furnace': 20,
    'Air Conditioner': 15,
    'Siding': 30,
    'Garage Door': 20
  };

  return lifespans[systemName] || 20;
}
