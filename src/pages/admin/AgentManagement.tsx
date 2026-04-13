/**
 * Agent Management Page
 * Admin page for managing agents - verify/unverify, activate/deactivate
 */

import { useState, useEffect } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  MoreHorizontal,
  Eye,
  Users,
  Star,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  verified: boolean;
  rating: number | null;
  total_reviews: number | null;
  areas_served: string[];
  specialization: string[];
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  };
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

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // Fetch associated profiles
      const userIds = agentsData?.map(a => a.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, status')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const agentsWithProfiles = (agentsData || []).map(agent => ({
        ...agent,
        areas_served: agent.areas_served || [],
        specialization: agent.specialization || [],
        profile: profiles?.find(p => p.user_id === agent.user_id) || undefined,
      }));

      setAgents(agentsWithProfiles);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (agent: Agent) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', agent.id);

      if (error) throw error;

      // Log audit event
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'agent_verified',
        entity_type: 'agent',
        entity_id: agent.id,
        details: { agent_name: agent.profile?.full_name || agent.agency_name },
      });

      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, verified: true } : a
      ));
      toast.success('Agent verified successfully');
    } catch (error) {
      console.error('Error verifying agent:', error);
      toast.error('Failed to verify agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverify = async (agent: Agent) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ verified: false, updated_at: new Date().toISOString() })
        .eq('id', agent.id);

      if (error) throw error;

      // Log audit event
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'agent_unverified',
        entity_type: 'agent',
        entity_id: agent.id,
        details: { agent_name: agent.profile?.full_name || agent.agency_name },
      });

      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, verified: false } : a
      ));
      toast.success('Agent verification removed');
    } catch (error) {
      console.error('Error unverifying agent:', error);
      toast.error('Failed to remove verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (agent: Agent) => {
    if (!agent.profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('user_id', agent.user_id);

      if (error) throw error;

      // Log audit event
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'agent_activated',
        entity_type: 'agent',
        entity_id: agent.id,
        details: { agent_name: agent.profile?.full_name || agent.agency_name },
      });

      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, profile: { ...a.profile!, status: 'active' } } : a
      ));
      toast.success('Agent activated');
    } catch (error) {
      console.error('Error activating agent:', error);
      toast.error('Failed to activate agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (agent: Agent) => {
    if (!agent.profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('user_id', agent.user_id);

      if (error) throw error;

      // Log audit event
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'agent_deactivated',
        entity_type: 'agent',
        entity_id: agent.id,
        details: { agent_name: agent.profile?.full_name || agent.agency_name },
      });

      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, profile: { ...a.profile!, status: 'suspended' } } : a
      ));
      toast.success('Agent deactivated');
    } catch (error) {
      console.error('Error deactivating agent:', error);
      toast.error('Failed to deactivate agent');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    // Tab filter
    if (activeTab === 'verified' && !agent.verified) return false;
    if (activeTab === 'unverified' && agent.verified) return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        agent.profile?.full_name?.toLowerCase().includes(q) ||
        agent.profile?.email?.toLowerCase().includes(q) ||
        agent.agency_name?.toLowerCase().includes(q) ||
        agent.license_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: agents.length,
    verified: agents.filter(a => a.verified).length,
    unverified: agents.filter(a => !a.verified).length,
    active: agents.filter(a => a.profile?.status === 'active').length,
  };

  return (
    <DashboardLayout title="Agent Management" navItems={adminNavItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.unverified}</p>
              <p className="text-xs text-muted-foreground">Unverified</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border">
        {/* Tabs */}
        <div className="border-b border-border px-4 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                All Agents
              </TabsTrigger>
              <TabsTrigger
                value="verified"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Verified
              </TabsTrigger>
              <TabsTrigger
                value="unverified"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Unverified
                {stats.unverified > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    {stats.unverified}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredAgents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No agents found"
              description="No agents match your current filters"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {agent.profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {agent.profile?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {agent.profile?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground">{agent.agency_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground font-mono text-sm">
                        {agent.license_number || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {agent.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{agent.rating}</span>
                          <span className="text-muted-foreground text-sm">
                            ({agent.total_reviews || 0})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No ratings</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.profile?.status === 'active' ? 'default' : 'secondary'}>
                        {agent.profile?.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {agent.verified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedAgent(agent);
                            setDetailsOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {agent.verified ? (
                            <DropdownMenuItem 
                              onClick={() => handleUnverify(agent)}
                              disabled={actionLoading}
                            >
                              <ShieldOff className="w-4 h-4 mr-2" />
                              Remove Verification
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleVerify(agent)}
                              disabled={actionLoading}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Verify Agent
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {agent.profile?.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleDeactivate(agent)}
                              disabled={actionLoading}
                              className="text-destructive"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleActivate(agent)}
                              disabled={actionLoading}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
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

      {/* Agent Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {selectedAgent.profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedAgent.profile?.full_name || 'Unknown'}
                  </h3>
                  <p className="text-muted-foreground">{selectedAgent.agency_name || 'Independent Agent'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedAgent.profile?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedAgent.profile?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium font-mono">{selectedAgent.license_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    {selectedAgent.rating ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{selectedAgent.rating}</span>
                        <span className="text-muted-foreground">({selectedAgent.total_reviews} reviews)</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No ratings yet</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedAgent.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bio</p>
                  <p className="text-foreground">{selectedAgent.bio}</p>
                </div>
              )}

              {selectedAgent.areas_served.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Areas Served</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.areas_served.map((area, i) => (
                      <Badge key={i} variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgent.specialization.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.specialization.map((spec, i) => (
                      <Badge key={i} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                {selectedAgent.verified ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUnverify(selectedAgent)}
                    disabled={actionLoading}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Remove Verification
                  </Button>
                ) : (
                  <Button onClick={() => handleVerify(selectedAgent)} disabled={actionLoading}>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Agent
                  </Button>
                )}
                {selectedAgent.profile?.status === 'active' ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeactivate(selectedAgent)}
                    disabled={actionLoading}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => handleActivate(selectedAgent)}
                    disabled={actionLoading}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentManagement;
