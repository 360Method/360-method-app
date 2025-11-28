import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES, ROLE_CONFIG } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Building,
  Wrench,
  Shield,
  ChevronDown,
  Check,
  Plus,
  ArrowRight
} from 'lucide-react';

// Map role config icons to actual components
const ICON_MAP = {
  Home,
  Building,
  Wrench,
  Shield
};

export default function RoleSwitcher({ variant = 'default', showAddRole = true }) {
  const navigate = useNavigate();
  const {
    user,
    roles,
    activeRole,
    switchRole,
    hasRole,
    getDefaultRoute
  } = useAuth();

  if (!user || roles.length === 0) {
    return null;
  }

  const activeConfig = ROLE_CONFIG[activeRole] || ROLE_CONFIG[ROLES.OWNER];
  const ActiveIcon = ICON_MAP[activeConfig.icon] || Home;

  const handleRoleSwitch = async (newRole) => {
    if (newRole === activeRole) return;

    const success = await switchRole(newRole);
    if (success) {
      // Navigate to the default route for the new role
      const config = ROLE_CONFIG[newRole];
      navigate(config?.defaultRoute || '/Dashboard');
    }
  };

  const handleBecomeOperator = () => {
    navigate('/BecomeOperator');
  };

  // Color classes for roles
  const getColorClasses = (role, isActive = false) => {
    const config = ROLE_CONFIG[role];
    if (!config) return {};

    const colorMap = {
      blue: {
        bg: isActive ? 'bg-blue-100' : 'hover:bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700'
      },
      orange: {
        bg: isActive ? 'bg-orange-100' : 'hover:bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        badge: 'bg-orange-100 text-orange-700'
      },
      green: {
        bg: isActive ? 'bg-green-100' : 'hover:bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-700'
      },
      purple: {
        bg: isActive ? 'bg-purple-100' : 'hover:bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-700'
      }
    };

    return colorMap[config.color] || colorMap.blue;
  };

  // Single role - just show badge, no dropdown
  if (roles.length === 1 && !showAddRole) {
    const colors = getColorClasses(activeRole, true);
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.badge}`}>
        <ActiveIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{activeConfig.shortLabel}</span>
      </div>
    );
  }

  // Compact variant for mobile/header
  if (variant === 'compact') {
    const colors = getColorClasses(activeRole, true);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 h-8 px-2 ${colors.badge} border ${colors.border}`}
          >
            <ActiveIcon className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">
              {activeConfig.shortLabel}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: '#FFFFFF' }}>
          <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
            Switch Portal
          </DropdownMenuLabel>
          {roles.map(role => {
            const config = ROLE_CONFIG[role];
            const Icon = ICON_MAP[config?.icon] || Home;
            const isActive = role === activeRole;
            const colors = getColorClasses(role, isActive);

            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`gap-3 cursor-pointer ${isActive ? colors.bg : ''}`}
              >
                <Icon className={`w-4 h-4 ${colors.text}`} />
                <div className="flex-1">
                  <div className="font-medium">{config?.label}</div>
                </div>
                {isActive && <Check className="w-4 h-4 text-green-600" />}
              </DropdownMenuItem>
            );
          })}

          {showAddRole && !hasRole(ROLES.OPERATOR) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBecomeOperator}
                className="gap-3 cursor-pointer text-orange-600"
              >
                <Plus className="w-4 h-4" />
                <span>Become an Operator</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default/full variant
  const colors = getColorClasses(activeRole, true);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${colors.badge} border ${colors.border}`}
        >
          <ActiveIcon className="w-4 h-4" />
          <span className="font-medium">{activeConfig.label}</span>
          {roles.length > 1 && <ChevronDown className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" style={{ backgroundColor: '#FFFFFF' }}>
        <DropdownMenuLabel>Your Portals</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {roles.map(role => {
          const config = ROLE_CONFIG[role];
          const Icon = ICON_MAP[config?.icon] || Home;
          const isActive = role === activeRole;
          const colors = getColorClasses(role, isActive);

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={`gap-3 cursor-pointer py-3 ${isActive ? colors.bg : ''}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.badge}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{config?.label}</div>
                <div className="text-xs text-gray-500">
                  {role === ROLES.OWNER && 'Manage your properties'}
                  {role === ROLES.OPERATOR && 'Run your service business'}
                  {role === ROLES.CONTRACTOR && 'View and complete jobs'}
                  {role === ROLES.ADMIN && 'Platform administration'}
                </div>
              </div>
              {isActive && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}

        {showAddRole && !hasRole(ROLES.OPERATOR) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleBecomeOperator}
              className="gap-3 cursor-pointer py-3"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-dashed border-orange-300">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-orange-600">Become an Operator</div>
                <div className="text-xs text-gray-500">
                  Start your property service business
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline role badge for display purposes
export function RoleBadge({ role, size = 'default' }) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  const Icon = ICON_MAP[config.icon] || Home;

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    default: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorMap[config.color]} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {config.shortLabel}
    </span>
  );
}
