/**
 * Dashboard Layout Component
 * Shared layout for all role-based dashboards
 */

import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '@/hooks/useAuth';
import {
  Menu, X, LogOut, Home, Heart, Calendar, MessageSquare, Settings,
  Users, Building2, BarChart3, TrendingUp, FileText, ChevronDown,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

const DashboardLayout = ({ children, title, navItems }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-white font-extrabold text-sm">PX</div>
            <span className="font-extrabold text-primary">PrimeX</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Home className="w-5 h-5" />
            Back to Website
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>

          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                <Link to={`${getDashboardRoute(role)}/settings`} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setIsProfileOpen(false)}>
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

export const buyerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/buyer/dashboard', icon: Home },
  { label: 'Saved Properties', href: '/buyer/dashboard/saved', icon: Heart },
  { label: 'Comparisons', href: '/buyer/dashboard/comparisons', icon: FileText },
  { label: 'Visit Requests', href: '/buyer/dashboard/visits', icon: Calendar },
  { label: 'Messages', href: '/buyer/dashboard/messages', icon: MessageSquare },
  { label: 'Settings', href: '/buyer/dashboard/settings', icon: Settings },
];

export const investorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/investor/dashboard', icon: Home },
  { label: 'Portfolio', href: '/investor/dashboard/portfolio', icon: TrendingUp },
  { label: 'ROI Analytics', href: '/investor/dashboard/analytics', icon: BarChart3 },
  { label: 'Saved Properties', href: '/investor/dashboard/saved', icon: Heart },
  { label: 'Messages', href: '/investor/dashboard/messages', icon: MessageSquare },
  { label: 'Settings', href: '/investor/dashboard/settings', icon: Settings },
];

export const developerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/developer/dashboard', icon: Home },
  { label: 'My Listings', href: '/developer/dashboard/listings', icon: Building2 },
  { label: 'Add Property', href: '/developer/dashboard/add-property', icon: FileText },
  { label: 'Leads & Inquiries', href: '/developer/dashboard/leads', icon: MessageSquare },
  { label: 'Analytics', href: '/developer/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/developer/dashboard/settings', icon: Settings },
];

export const agentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/agent/dashboard', icon: Home },
  { label: 'My Listings', href: '/agent/dashboard/listings', icon: Building2 },
  { label: 'Assigned Leads', href: '/agent/dashboard/leads', icon: Users },
  { label: 'Appointments', href: '/agent/dashboard/appointments', icon: Calendar },
  { label: 'Settings', href: '/agent/dashboard/settings', icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'User Management', href: '/admin/dashboard/users', icon: Users },
  { label: 'Lead Management', href: '/admin/dashboard/leads', icon: MessageSquare },
  { label: 'Property Approvals', href: '/admin/dashboard/approvals', icon: Building2 },
  { label: 'Agent Management', href: '/admin/dashboard/agents', icon: Users },
  { label: 'Platform Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { label: 'Meeting Requests', href: '/admin/dashboard/meetings', icon: Calendar },
  { label: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];
