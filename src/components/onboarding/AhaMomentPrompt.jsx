import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';

/**
 * AhaMomentPrompt - A reusable component for displaying aha moment prompts
 *
 * Can be rendered as:
 * - Modal dialog (default, for important moments)
 * - Inline card (for subtle reminders)
 * - Toast-like notification (for quick wins)
 */

export function AhaMomentModal({
  open,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  icon: Icon,
  iconBgColor = 'bg-orange-500',
  title,
  description,
  primaryLabel,
  secondaryLabel = 'Maybe Later',
  children,
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={`${iconBgColor} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              {Icon ? <Icon className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
            <DialogDescription className="text-white/90 text-base mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={onPrimaryAction}
              className="flex-1 gap-2 text-white"
              style={{ backgroundColor: '#f97316', minHeight: '48px' }}
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
            {secondaryLabel && (
              <Button
                onClick={onSecondaryAction || onClose}
                variant="outline"
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AhaMomentCard({
  onPrimaryAction,
  onDismiss,
  icon: Icon,
  iconBgColor = 'bg-orange-500',
  title,
  description,
  primaryLabel,
  secondaryLabel = 'Dismiss',
  variant = 'default', // 'default', 'compact', 'highlighted'
  className = '',
}) {
  if (variant === 'compact') {
    return (
      <Card className={`border-2 border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
              {Icon ? <Icon className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-xs text-slate-600 truncate">{description}</p>
            </div>
            <Button
              onClick={onPrimaryAction}
              size="sm"
              className="flex-shrink-0 text-white"
              style={{ backgroundColor: '#f97316' }}
            >
              {primaryLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'highlighted') {
    return (
      <Card className={`border-none shadow-lg overflow-hidden ${className}`}>
        <div className={`${iconBgColor} p-4`}>
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              {Icon ? <Icon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-white/90">{description}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 flex gap-3">
          <Button
            onClick={onPrimaryAction}
            className="flex-1 text-white"
            style={{ backgroundColor: '#f97316' }}
          >
            {primaryLabel}
          </Button>
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`border-2 border-orange-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            {Icon ? <Icon className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
            <p className="text-slate-600 text-sm mb-4">{description}</p>
            <div className="flex gap-3">
              <Button
                onClick={onPrimaryAction}
                className="gap-2 text-white"
                style={{ backgroundColor: '#f97316' }}
              >
                {primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>
              {onDismiss && (
                <Button onClick={onDismiss} variant="ghost">
                  {secondaryLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AhaMomentBanner({
  onAction,
  onDismiss,
  icon: Icon,
  message,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onAction}
            size="sm"
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            {actionLabel}
          </Button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AhaMomentModal;
