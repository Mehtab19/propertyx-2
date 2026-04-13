/**
 * User Details Modal Component
 * Shows full user profile information
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserAvatar } from './UserAvatar';
import { UserRoleBadge } from './UserRoleBadge';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, Clock, Eye, MessageSquare } from 'lucide-react';

export interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login?: string | null;
  suspension_reason?: string | null;
}

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
}

export const UserDetailsModal = ({ open, onOpenChange, user }: UserDetailsModalProps) => {
  if (!user) return null;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatRelativeTime = (date: string | null | undefined) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{user.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <UserRoleBadge role={user.role} size="sm" />
                <StatusBadge status={user.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Activity
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Registered</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Last Login</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatRelativeTime(user.last_login)}
                </p>
              </div>
            </div>
          </div>

          {/* Suspension Reason */}
          {user.status === 'suspended' && user.suspension_reason && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-red-600 uppercase tracking-wide">
                Suspension Reason
              </h4>
              <p className="text-sm text-foreground bg-red-50 p-3 rounded-lg border border-red-200">
                {user.suspension_reason}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
