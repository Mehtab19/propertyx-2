/**
 * Role Permissions Hook
 * Centralized permissions management for role-based access control
 */

import { useAuth, AppRole } from '@/hooks/useAuth';

// Define permissions for each action
type Permission = 
  | 'browse_properties'
  | 'save_favorites'
  | 'compare_properties'
  | 'request_viewing'
  | 'request_mortgage'
  | 'chat_ai'
  | 'create_listings'
  | 'upload_brochures'
  | 'view_own_leads'
  | 'view_assigned_leads'
  | 'manage_appointments'
  | 'approve_listings'
  | 'manage_agents'
  | 'manage_partners'
  | 'audit_ai'
  | 'manage_users'
  | 'view_analytics'
  | 'access_admin_dashboard';

// Permission matrix - which roles have which permissions
const permissionMatrix: Record<Permission, AppRole[]> = {
  browse_properties: ['buyer', 'investor', 'developer', 'broker', 'mortgage_partner', 'admin'],
  save_favorites: ['buyer', 'investor', 'admin'],
  compare_properties: ['buyer', 'investor', 'admin'],
  request_viewing: ['buyer', 'investor', 'admin'],
  request_mortgage: ['buyer', 'investor', 'admin'],
  chat_ai: ['buyer', 'investor', 'developer', 'broker', 'mortgage_partner', 'admin'],
  create_listings: ['developer', 'broker', 'admin'],
  upload_brochures: ['developer', 'broker', 'admin'],
  view_own_leads: ['developer', 'admin'],
  view_assigned_leads: ['broker', 'mortgage_partner', 'admin'],
  manage_appointments: ['broker', 'admin'],
  approve_listings: ['admin'],
  manage_agents: ['admin'],
  manage_partners: ['admin'],
  audit_ai: ['admin'],
  manage_users: ['admin'],
  view_analytics: ['developer', 'broker', 'mortgage_partner', 'admin'],
  access_admin_dashboard: ['admin'],
};

// Role display names
export const roleDisplayNames: Record<AppRole, string> = {
  buyer: 'Buyer',
  investor: 'Investor',
  developer: 'Developer',
  broker: 'Broker/Agent',
  mortgage_partner: 'Mortgage Partner',
  admin: 'Administrator',
};

// Role descriptions
export const roleDescriptions: Record<AppRole, string> = {
  buyer: 'Browse, save favorites, compare properties, request viewings and mortgage',
  investor: 'Investment analysis, ROI tracking, portfolio management',
  developer: 'Create and manage property listings, view leads',
  broker: 'Manage listings, receive assigned leads, schedule appointments',
  mortgage_partner: 'Manage loan products, process mortgage leads',
  admin: 'Full platform access, approvals, user and partner management',
};

export const useRolePermissions = () => {
  const { role, isAuthenticated } = useAuth();

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !role) return false;
    
    // Admin has all permissions
    if (role === 'admin') return true;
    
    return permissionMatrix[permission]?.includes(role) ?? false;
  };

  /**
   * Check if current user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  /**
   * Check if current user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  /**
   * Get all permissions for current user
   */
  const getAllPermissions = (): Permission[] => {
    if (!isAuthenticated || !role) return [];
    
    if (role === 'admin') {
      return Object.keys(permissionMatrix) as Permission[];
    }
    
    return (Object.entries(permissionMatrix) as [Permission, AppRole[]][])
      .filter(([_, roles]) => roles.includes(role))
      .map(([permission]) => permission);
  };

  /**
   * Check if user can access a feature based on their role
   */
  const canAccessFeature = (feature: 'mortgage' | 'compare' | 'favorites' | 'create_listing' | 'leads'): boolean => {
    switch (feature) {
      case 'mortgage':
        return hasPermission('request_mortgage');
      case 'compare':
        return hasPermission('compare_properties');
      case 'favorites':
        return hasPermission('save_favorites');
      case 'create_listing':
        return hasPermission('create_listings');
      case 'leads':
        return hasAnyPermission(['view_own_leads', 'view_assigned_leads']);
      default:
        return false;
    }
  };

  return {
    role,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    canAccessFeature,
    roleDisplayName: role ? roleDisplayNames[role] : null,
    roleDescription: role ? roleDescriptions[role] : null,
  };
};

export type { Permission };
export { permissionMatrix };
