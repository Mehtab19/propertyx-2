/**
 * Developer Dashboard
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout, { developerNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string | null;
  property_type: string;
  created_at: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  source: string | null;
  created_at: string | null;
}

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, leadsRes] = await Promise.all([
        supabase.from('properties').select('id, title, location, price, status, property_type, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      if (propertiesRes.error) throw propertiesRes.error;
      if (leadsRes.error) throw leadsRes.error;
      setProperties((propertiesRes.data || []) as Property[]);
      setLeads((leadsRes.data || []) as Lead[]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" navItems={developerNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Developer Dashboard" navItems={developerNavItems}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{properties.length}</p><p className="text-sm text-muted-foreground">My Properties</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center"><MessageSquare className="w-6 h-6 text-secondary-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{leads.length}</p><p className="text-sm text-muted-foreground">Leads</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <Link to="/submit-listing"><Button className="gap-2 w-full"><Plus className="w-4 h-4" />Add Property</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Properties</h2></div>
          <div className="p-6 space-y-4">
            {properties.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No properties yet</p>
            ) : properties.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.location}</p>
                </div>
                <Badge variant="outline">{p.status || 'available'}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Leads</h2></div>
          <div className="p-6 space-y-4">
            {leads.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No leads yet</p>
            ) : leads.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold text-foreground">{l.name}</p>
                  <p className="text-sm text-muted-foreground">{l.email}</p>
                </div>
                <Badge variant="outline">{l.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
