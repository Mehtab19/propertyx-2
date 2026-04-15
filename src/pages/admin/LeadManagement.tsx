import { useState, useEffect, useMemo } from 'react';
import { Users, MessageSquare, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { EmptyState } from '@/components/admin/EmptyState';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  source: string | null;
  message: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  agent_id: string | null;
  property_id: string | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

const LeadManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch leads' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus as any }).eq('id', leadId);
      if (error) throw error;
      toast({ title: 'Status Updated', description: `Lead status changed to ${newStatus}` });
      fetchLeads();
      setShowDetailsModal(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Unable to update lead status' });
    }
  };

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
  }, [leads, searchQuery]);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
  };

  return (
    <DashboardLayout title="Lead Management" navItems={adminNavItems}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Leads</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{stats.new}</p><p className="text-sm text-muted-foreground">New</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{stats.contacted}</p><p className="text-sm text-muted-foreground">Contacted</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{stats.qualified}</p><p className="text-sm text-muted-foreground">Qualified</p></CardContent></Card>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4">
          {isLoading ? <TableSkeleton rows={5} columns={5} /> : filteredLeads.length === 0 ? (
            <EmptyState icon={Users} title="No leads found" description="No leads match your filters" />
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => { setSelectedLead(lead); setShowDetailsModal(true); }}>
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[lead.status] || 'bg-muted'}>{lead.status}</Badge>
                    <span className="text-xs text-muted-foreground">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selectedLead.name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedLead.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedLead.phone || '-'}</p></div>
                <div><p className="text-muted-foreground">Source</p><p className="font-medium">{selectedLead.source || '-'}</p></div>
              </div>
              {selectedLead.message && (
                <div><p className="text-muted-foreground text-sm">Message</p><p className="text-sm mt-1">{selectedLead.message}</p></div>
              )}
              <div className="flex gap-2 flex-wrap pt-4 border-t">
                {['contacted', 'qualified', 'negotiating', 'closed', 'lost'].map(s => (
                  <Button key={s} size="sm" variant={selectedLead.status === s ? 'default' : 'outline'}
                    onClick={() => updateLeadStatus(selectedLead.id, s)}>{s}</Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LeadManagement;
