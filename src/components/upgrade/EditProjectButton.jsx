import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProjectButton({ 
  onClick, 
  variant = 'outline',
  size = 'default',
  className = ''
}) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={`${className}`}
      style={{ minHeight: size === 'sm' ? '40px' : '44px' }}
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit Project
    </Button>
  );
}