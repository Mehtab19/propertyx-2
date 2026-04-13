/**
 * User Role Badge Component
 * Displays colored badges for user roles
 */

import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  developer: 'bg-blue-100 text-blue-700 border-blue-200',
  investor: 'bg-green-100 text-green-700 border-green-200',
  buyer: 'bg-amber-100 text-amber-700 border-amber-200',
};

export const UserRoleBadge = ({ role, size = 'md' }: UserRoleBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium capitalize rounded-full border',
        roleColors[role] || 'bg-muted text-muted-foreground border-border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      )}
    >
      {role}
    </span>
  );
};

export default UserRoleBadge;
