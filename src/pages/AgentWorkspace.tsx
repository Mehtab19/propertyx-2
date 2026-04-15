/**
 * Agent Page
 * Full agent workspace with lead inbox, detail view, and appointment scheduling
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout, { agentNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, Calendar, Clock, ChevronRight, Mail, Phone, User, FileText, 
  MessageSquare, Building2, MapPin, Plus, Check, X, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Lead {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  source: string | null;
  message: string | null;
  created_at: string | null;
  property_id: string | null;
  agent_id: string | null;
  user_profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface Agent {
  id: string;
  user_id: string;
  agency_name: string | null;
  areas_covered: string[] | null;
  specializations: string[] | null;
}

const AgentPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agentProfile, setAgentProfile] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('new');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    type: 'site_visit',
    notes: '',
  });

  useEffect(() => {
    if (user) fetchAgentData();
  }, [user]);

  const fetchAgentData = async () => {
    try {
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (agentError) throw agentError;
      if (agent) {
        setAgentProfile({
          id: agent.id,
          user_id: agent.user_id,
          agency_name: agent.agency_name,
          areas_covered: agent.areas_covered,
          specializations: agent.specializations,
        });
      }

      let leadsQuery = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (agent) {
        leadsQuery = leadsQuery.eq('agent_id', agent.id);
      }

      const { data: leadsData, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      const leadsWithProfiles = await Promise.all(
        (leadsData || []).map(async (lead) => {
          let profile = null;
          if (lead.user_id) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, email, phone')
              .eq('id', lead.user_id)
              .maybeSingle();
            profile = data;
          }
          return { ...lead, user_profile: profile || undefined } as Lead;
        })
      );
      setLeads(leadsWithProfiles);
    } catch (error) {
      console.error('Error fetching agent data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus as any })
        .eq('id', leadId);
      if (error) throw error;
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus });
      toast.success(`Lead marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const scheduleAppointment = async () => {
    if (!selectedLead || !scheduleForm.date || !scheduleForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: selectedLead.user_id,
          agent_id: agentProfile?.id,
          property_id: selectedLead.property_id,
          scheduled_at: `${scheduleForm.date}T${scheduleForm.time}`,
          notes: scheduleForm.notes,
          status: 'scheduled',
        });
      if (error) throw error;
      await updateLeadStatus(selectedLead.id, 'contacted');
      setShowScheduleModal(false);
      setScheduleForm({ date: '', time: '', type: 'site_visit', notes: '' });
      toast.success('Appointment scheduled successfully');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'qualified': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true;
    return lead.status === activeTab;
  });

  const leadCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    all: leads.length,
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Agent Workspace" navItems={agentNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (role !== 'agent' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout title="Agent Workspace" navItems={agentNavItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{leadCounts.new}</p>
              <p className="text-xs text-muted-foreground">New Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{leadCounts.contacted}</p>
              <p className="text-xs text-muted-foreground">Contacted</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{leadCounts.all}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Inbox */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Lead Inbox</h2>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="new" className="text-xs">New ({leadCounts.new})</TabsTrigger>
                <TabsTrigger value="contacted" className="text-xs">Contacted</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads in this category</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedLead?.id === lead.id
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted/50 hover:bg-muted border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-foreground text-sm">
                          {lead.user_profile?.full_name || lead.name || 'Unknown'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{lead.source || 'Direct'}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>

        {/* Lead Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Lead Details</h2>
          </div>
          <div className="p-6">
            {!selectedLead ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a lead to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-lg font-medium text-foreground">
                      {selectedLead.user_profile?.full_name || selectedLead.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedLead.message && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Message / AI Summary
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">{selectedLead.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  {selectedLead.source && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Source:</span>
                      <Badge variant="outline">{selectedLead.source}</Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  {selectedLead.status === 'new' && (
                    <Button onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}>
                      <MessageSquare className="w-4 h-4 mr-2" /> Mark Contacted
                    </Button>
                  )}
                  {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                    <Button variant="secondary" onClick={() => setShowScheduleModal(true)}>
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Appointment
                    </Button>
                  )}
                  {selectedLead.status !== 'closed' && selectedLead.status !== 'lost' && (
                    <>
                      <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => updateLeadStatus(selectedLead.id, 'qualified')}>
                        <Check className="w-4 h-4 mr-2" /> Qualify
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateLeadStatus(selectedLead.id, 'lost')}>
                        <X className="w-4 h-4 mr-2" /> Mark Lost
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Select value={scheduleForm.time} onValueChange={(v) => setScheduleForm({ ...scheduleForm, time: v })}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={scheduleAppointment} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" /> Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentPage;
