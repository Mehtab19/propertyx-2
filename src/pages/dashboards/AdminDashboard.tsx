/**
 * Admin Dashboard
 */
import { useEffect, useState } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Building2, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [propertyCount, setPropertyCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [profilesRes, propertiesRes, appointmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
      ]);
      setUsers((profilesRes.data || []) as UserProfile[]);
      setPropertyCount(propertiesRes.count || 0);
      setAppointmentCount(appointmentsRes.count || 0);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'developer': return 'bg-blue-100 text-blue-700';
      case 'investor': return 'bg-green-100 text-green-700';
      case 'agent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalUsers = users.length;
  const buyerCount = users.filter(u => u.role === 'buyer').length;
  const investorCount = users.filter(u => u.role === 'investor').length;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalUsers}</p><p className="text-sm text-muted-foreground">Total Users</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center"><Building2 className="w-6 h-6 text-secondary-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{propertyCount}</p><p className="text-sm text-muted-foreground">Properties</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center"><Calendar className="w-6 h-6 text-accent-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{appointmentCount}</p><p className="text-sm text-muted-foreground">Appointments</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><TrendingUp className="w-6 h-6 text-muted-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{investorCount}</p><p className="text-sm text-muted-foreground">Investors</p></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Users</h2></div>
        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-8"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No users yet</p></div>
          ) : (
            <div className="space-y-4">
              {users.slice(0, 8).map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {u.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{u.full_name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(u.role)}`}>{u.role || 'none'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
