/**
 * Admin Dashboard
 * Full platform management dashboard for administrators
 */

import { useEffect, useState } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { SAMPLE_PROPERTIES } from '@/data/propertyData';

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  full_name?: string;
}

interface MeetingRequest {
  id: string;
  property_id: string;
  property_title: string;
  full_name: string;
  email: string;
  status: string;
  preferred_date: string;
  preferred_time: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles to get user details
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Merge roles with profile data
      const usersWithProfiles = (roles || []).map((role) => {
        const profile = profiles?.find((p) => p.user_id === role.user_id);
        return {
          ...role,
          email: profile?.email || 'N/A',
          full_name: profile?.full_name || 'Unknown User',
        };
      });

      setUsers(usersWithProfiles);

      // Fetch all meeting requests
      const { data: meetings, error: meetingsError } = await supabase
        .from('meeting_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingsError) throw meetingsError;
      setMeetingRequests(meetings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('meeting_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setMeetingRequests(meetingRequests.map((m) => (m.id === id ? { ...m, status } : m)));
      toast.success(`Meeting ${status}`);
    } catch (error) {
      toast.error('Failed to update meeting');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'developer':
        return 'bg-blue-100 text-blue-700';
      case 'investor':
        return 'bg-green-100 text-green-700';
      case 'buyer':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const buyerCount = users.filter((u) => u.role === 'buyer').length;
  const investorCount = users.filter((u) => u.role === 'investor').length;
  const developerCount = users.filter((u) => u.role === 'developer').length;
  const pendingMeetings = meetingRequests.filter((m) => m.status === 'pending').length;
  const confirmedMeetings = meetingRequests.filter((m) => m.status === 'confirmed').length;

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" navItems={adminNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{SAMPLE_PROPERTIES.length}</p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingMeetings}</p>
              <p className="text-sm text-muted-foreground">Pending Meetings</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confirmedMeetings}</p>
              <p className="text-sm text-muted-foreground">Confirmed Meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{buyerCount}</p>
            <p className="text-sm text-muted-foreground">Buyers</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{investorCount}</p>
            <p className="text-sm text-muted-foreground">Investors</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{developerCount}</p>
            <p className="text-sm text-muted-foreground">Developers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Recent Users</h2>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {u.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{u.full_name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meeting Requests */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Meeting Requests</h2>
          </div>
          <div className="p-6">
            {meetingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meeting requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetingRequests.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{meeting.full_name}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          meeting.status
                        )}`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{meeting.property_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.preferred_date).toLocaleDateString()} at{' '}
                      {meeting.preferred_time}
                    </p>
                    {meeting.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateMeetingStatus(meeting.id, 'confirmed')}
                          className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}
                          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
