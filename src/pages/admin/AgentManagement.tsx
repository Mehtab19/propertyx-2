/**
 * Agent Management Page
 * Admin page for managing agents - verify/unverify
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Search, UserCheck, UserX, Shield, ShieldOff, MoreHorizontal, Eye, Users, Star, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { EmptyState } from '@/components/admin/EmptyState';

interface Agent {
  id: string;
  user_id: string;
  agency_name: string | null;
  bio: string | null;
  license_number: string | null;
  verified: boolean | null;
  rating: number | null;
  areas_covered: string[] | null;
  specializations: string[] | null;
  created_at: string | null;
  profile?: { full_name: string | null; email: string | null; phone: string | null };
}

type TabValue = 'all' | 'verified' | 'unverified';

const AgentManagement = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data: agentsData, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = agentsData?.map(a => a.user_id) || [];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, phone').in('id', userIds);

      const mapped: Agent[] = (agentsData || []).map(a => ({
        ...a,
        profile: (profiles as any[])?.find(p => p.id === a.user_id) || undefined,
      }));
      setAgents(mapped);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (agent: Agent, verified: boolean) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('agents').update({ verified }).eq('id', agent.id);
      if (error) throw error;
      setAgents(agents.map(a => a.id === agent.id ? { ...a, verified } : a));
      toast.success(verified ? 'Agent verified' : 'Verification removed');
    } catch (error) {
      toast.error('Failed to update agent');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      if (activeTab === 'verified' && !agent.verified) return false;
      if (activeTab === 'unverified' && agent.verified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          agent.profile?.full_name?.toLowerCase().includes(q) ||
          agent.profile?.email?.toLowerCase().includes(q) ||
          agent.agency_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agents, activeTab, searchQuery]);

  const stats = {
    total: agents.length,
    verified: agents.filter(a => a.verified).length,
    unverified: agents.filter(a => !a.verified).length,
  };

  return (
    <DashboardLayout title="Agent Management" navItems={adminNavItems}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-xs text-muted-foreground">Total Agents</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><Shield className="w-5 h-5 text-accent-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.verified}</p><p className="text-xs text-muted-foreground">Verified</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><ShieldOff className="w-5 h-5 text-muted-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.unverified}</p><p className="text-xs text-muted-foreground">Unverified</p></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="border-b border-border px-4 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3">All</TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3">Verified</TabsTrigger>
              <TabsTrigger value="unverified" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3">Unverified</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="p-4">
          {loading ? <TableSkeleton rows={5} columns={6} /> : filteredAgents.length === 0 ? (
            <EmptyState icon={Users} title="No agents found" description="No agents match your filters" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{agent.profile?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{agent.profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{agent.agency_name || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{agent.license_number || '-'}</TableCell>
                    <TableCell>
                      {agent.rating ? (
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span>{agent.rating}</span></div>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {agent.verified ? (
                        <Badge className="bg-accent/20 text-accent-foreground"><Shield className="w-3 h-3 mr-1" />Verified</Badge>
                      ) : (
                        <Badge variant="outline"><ShieldOff className="w-3 h-3 mr-1" />Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedAgent(agent); setDetailsOpen(true); }}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {agent.verified ? (
                            <DropdownMenuItem onClick={() => toggleVerification(agent, false)} disabled={actionLoading}><ShieldOff className="w-4 h-4 mr-2" />Remove Verification</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleVerification(agent, true)} disabled={actionLoading}><Shield className="w-4 h-4 mr-2" />Verify Agent</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Agent Details</DialogTitle></DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">{selectedAgent.profile?.full_name || 'Unknown'}</h3>
                <p className="text-muted-foreground">{selectedAgent.agency_name || 'Independent Agent'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedAgent.profile?.email || '-'}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedAgent.profile?.phone || '-'}</p></div>
                <div><p className="text-muted-foreground">License</p><p className="font-medium font-mono">{selectedAgent.license_number || '-'}</p></div>
                <div><p className="text-muted-foreground">Rating</p><p className="font-medium">{selectedAgent.rating || 'N/A'}</p></div>
              </div>
              {selectedAgent.bio && <div><p className="text-muted-foreground text-sm mb-1">Bio</p><p>{selectedAgent.bio}</p></div>}
              {selectedAgent.areas_covered && selectedAgent.areas_covered.length > 0 && (
                <div><p className="text-muted-foreground text-sm mb-1">Areas Covered</p>
                  <div className="flex flex-wrap gap-2">{selectedAgent.areas_covered.map((a, i) => <Badge key={i} variant="secondary"><MapPin className="w-3 h-3 mr-1" />{a}</Badge>)}</div>
                </div>
              )}
              {selectedAgent.specializations && selectedAgent.specializations.length > 0 && (
                <div><p className="text-muted-foreground text-sm mb-1">Specializations</p>
                  <div className="flex flex-wrap gap-2">{selectedAgent.specializations.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentManagement;
