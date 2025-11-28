import React from 'react';
import { Rocket, Star, Zap, TrendingUp, Shield } from 'lucide-react';

const CTA_VARIANTS = {
  dashboard: {
    icon: Shield,
    title: "Want This Peace of Mind for Your Home?",
    subtitle: "Join 400+ property owners protecting their investments",
    buttonText: "Start Free Today",
    color: "green"
  },
  scale: {
    icon: TrendingUp,
    title: "Ready to Build Long-Term Wealth?",
    subtitle: "Start your 360° Method journey today",
    buttonText: "Create Free Account",
    color: "purple"
  },
  preserve: {
    icon: Zap,
    title: "Unlock Premium Features",
    subtitle: "Full resource library, advanced analytics, and more",
    buttonText: "Start Free Today",
    color: "blue"
  },
  default: {
    icon: Rocket,
    title: "Love What You See?",
    subtitle: "Create your free account and get started",
    buttonText: "Start Free Today",
    color: "blue"
  }
};

export default function ContextualWaitlistCTA({ variant = 'default', className = '' }) {
  const config = CTA_VARIANTS[variant] || CTA_VARIANTS.default;
  const IconComponent = config.icon;

  const colorClasses = {
    blue: {
      gradient: 'from-blue-600 to-sky-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-white',
      buttonText: 'text-blue-600',
      buttonHover: 'hover:bg-gray-100'
    },
    green: {
      gradient: 'from-green-600 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-white',
      buttonText: 'text-green-600',
      buttonHover: 'hover:bg-gray-100'
    },
    purple: {
      gradient: 'from-purple-600 to-pink-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonBg: 'bg-white',
      buttonText: 'text-purple-600',
      buttonHover: 'hover:bg-gray-100'
    }
  };

  const colors = colorClasses[config.color];

  return (
    <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-6 sm:p-8 text-white shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.iconColor}`} />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            {config.title}
          </h3>
          <p className="text-sm sm:text-base text-white/90">
            {config.subtitle}
          </p>
        </div>

        <button
          onClick={() => navigate('/Login')}
          className={`${colors.buttonBg} ${colors.buttonText} px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg ${colors.buttonHover} active:scale-95 transition-all shadow-lg whitespace-nowrap flex items-center gap-2`}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {config.buttonText}
          <Rocket className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}