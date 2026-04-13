/**
 * Agent Page
 * Full agent workspace with lead inbox, detail view, and appointment scheduling
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout, { brokerNavItems } from '@/components/dashboard/DashboardLayout';
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
import { getPropertyById } from '@/data/propertyData';

interface Lead {
  id: string;
  user_id: string;
  lead_type: string;
  status: string;
  priority: string | null;
  notes: string | null;
  ai_summary: string | null;
  created_at: string;
  property_id: string | null;
  agent_id: string | null;
  user_profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
  shortlisted_properties?: string[];
}

interface Appointment {
  id: string;
  user_id: string;
  property_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  appointment_type: string;
  status: string | null;
  notes: string | null;
  created_at: string;
}

interface Agent {
  id: string;
  user_id: string;
  agency_name: string | null;
  areas_served: string[] | null;
  specialization: string[] | null;
}

const AgentPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
    if (user) {
      fetchAgentData();
    }
  }, [user]);

  const fetchAgentData = async () => {
    try {
      // First get agent profile
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (agentError) throw agentError;
      setAgentProfile(agent);

      // Fetch leads assigned to this agent (if agent profile exists) or all leads for broker role
      let leadsQuery = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (agent) {
        leadsQuery = leadsQuery.eq('agent_id', agent.id);
      }

      const { data: leadsData, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      // Fetch user profiles for leads
      const leadsWithProfiles = await Promise.all(
        (leadsData || []).map(async (lead) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', lead.user_id)
            .maybeSingle();
          
          // Parse shortlisted properties from notes or a separate field if available
          let shortlisted: string[] = [];
          if (lead.notes) {
            try {
              const parsed = JSON.parse(lead.notes);
              if (parsed.shortlisted_property_ids) {
                shortlisted = parsed.shortlisted_property_ids;
              }
            } catch {
              // Notes is not JSON, that's fine
            }
          }
          
          return { 
            ...lead, 
            user_profile: profile || undefined,
            shortlisted_properties: shortlisted
          };
        })
      );
      setLeads(leadsWithProfiles);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

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
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      toast.success(`Lead marked as ${newStatus}`);

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'lead_status_updated',
        entity_type: 'lead',
        entity_id: leadId,
        details: { new_status: newStatus }
      });
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
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          user_id: selectedLead.user_id,
          agent_id: agentProfile?.id,
          property_id: selectedLead.property_id,
          scheduled_date: scheduleForm.date,
          scheduled_time: scheduleForm.time,
          appointment_type: scheduleForm.type,
          notes: scheduleForm.notes,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead status to scheduled
      await updateLeadStatus(selectedLead.id, 'scheduled');

      setAppointments([...appointments, appointment]);
      setShowScheduleModal(false);
      setScheduleForm({ date: '', time: '', type: 'site_visit', notes: '' });
      toast.success('Appointment scheduled successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'appointment_scheduled',
        entity_type: 'appointment',
        entity_id: appointment.id,
        details: { lead_id: selectedLead.id }
      });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700';
      case 'qualified':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLeadTypeLabel = (type: string) => {
    switch (type) {
      case 'viewing':
        return 'Property Viewing';
      case 'agent_help':
        return 'Agent Assistance';
      case 'mortgage':
        return 'Mortgage Inquiry';
      case 'developer_inquiry':
        return 'Developer Inquiry';
      default:
        return type;
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true;
    return lead.status === activeTab;
  });

  const leadCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    scheduled: leads.filter(l => l.status === 'scheduled').length,
    all: leads.length,
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Agent Workspace" navItems={brokerNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Only brokers and admins can access
  if (role !== 'broker' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout title="Agent Workspace" navItems={brokerNavItems}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{leadCounts.scheduled}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
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
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="new" className="text-xs">
                  New ({leadCounts.new})
                </TabsTrigger>
                <TabsTrigger value="contacted" className="text-xs">
                  Contacted
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="text-xs">
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
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
                          {lead.user_profile?.full_name || 'Unknown'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {getLeadTypeLabel(lead.lead_type)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
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
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-lg font-medium text-foreground">
                      {selectedLead.user_profile?.full_name || 'Unknown User'}
                    </p>
                    {selectedLead.user_profile?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${selectedLead.user_profile.email}`} className="text-primary hover:underline">
                          {selectedLead.user_profile.email}
                        </a>
                      </div>
                    )}
                    {selectedLead.user_profile?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${selectedLead.user_profile.phone}`} className="text-primary hover:underline">
                          {selectedLead.user_profile.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Summary */}
                {selectedLead.ai_summary && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      AI Summary
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">{selectedLead.ai_summary}</p>
                    </div>
                  </div>
                )}

                {/* Shortlisted Properties */}
                {selectedLead.shortlisted_properties && selectedLead.shortlisted_properties.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Shortlisted Properties
                    </h3>
                    <div className="space-y-2">
                      {selectedLead.shortlisted_properties.map((propId) => {
                        const property = getPropertyById(propId);
                        return (
                          <div key={propId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            {property?.imageUrl && (
                              <img src={property.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {property?.title || `Property #${propId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {property?.location || 'Location unavailable'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Primary Property */}
                {selectedLead.property_id && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Primary Interest
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      {(() => {
                        const property = getPropertyById(selectedLead.property_id!);
                        return property ? (
                          <div className="flex items-center gap-4">
                            {property.imageUrl && (
                              <img src={property.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{property.title}</p>
                              <p className="text-sm text-muted-foreground">{property.location}</p>
                              <p className="text-sm font-semibold text-primary">{property.price}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Property ID: {selectedLead.property_id}</p>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedLead.notes && !selectedLead.notes.startsWith('{') && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Notes</h3>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {/* Status & Meta */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline">{getLeadTypeLabel(selectedLead.lead_type)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedLead.priority)}`}>
                      {selectedLead.priority || 'medium'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {selectedLead.status === 'new' && (
                    <Button onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mark Contacted
                    </Button>
                  )}
                  
                  {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                    <Button variant="secondary" onClick={() => setShowScheduleModal(true)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  )}

                  {selectedLead.status !== 'closed' && selectedLead.status !== 'lost' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => updateLeadStatus(selectedLead.id, 'qualified')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Qualify
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateLeadStatus(selectedLead.id, 'lost')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Mark Lost
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apt-date">Date *</Label>
              <Input
                id="apt-date"
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-time">Time *</Label>
              <Select 
                value={scheduleForm.time} 
                onValueChange={(v) => setScheduleForm({ ...scheduleForm, time: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                  <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                  <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                  <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                  <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                  <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-type">Appointment Type</Label>
              <Select 
                value={scheduleForm.type} 
                onValueChange={(v) => setScheduleForm({ ...scheduleForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site_visit">Site Visit</SelectItem>
                  <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="video_call">Video Call</SelectItem>
                  <SelectItem value="office_meeting">Office Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-notes">Notes (optional)</Label>
              <Textarea
                id="apt-notes"
                placeholder="Any additional notes..."
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={scheduleAppointment} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentPage;
