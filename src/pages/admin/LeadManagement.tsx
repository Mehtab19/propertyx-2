import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Phone, Mail, Calendar, MessageSquare, Clock, 
  CheckCircle, XCircle, ArrowRight, Filter, Search,
  AlertCircle, TrendingUp, Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { EmptyState } from '@/components/admin/EmptyState';

interface Lead {
  id: string;
  lead_type: string;
  status: string;
  priority: string | null;
  ai_summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  agent_id: string | null;
  property_id: string | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const LeadManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch leads',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id || '',
        action: 'lead_status_update',
        entity_type: 'lead',
        entity_id: leadId,
        details: { old_status: selectedLead?.status, new_status: newStatus },
      });

      toast({
        title: 'Status Updated',
        description: `Lead status changed to ${newStatus}`,
      });

      fetchLeads();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Unable to update lead status',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedLead || !messageText.trim()) return;

    setIsUpdating(true);
    try {
      // Update lead notes with message
      const currentNotes = selectedLead.notes || '';
      const newNote = `\n\n---\n**Agent Message (${new Date().toLocaleString()}):**\n${messageText}`;
      
      const { error } = await supabase
        .from('leads')
        .update({ 
          notes: currentNotes + newNote,
          status: selectedLead.status === 'new' ? 'contacted' : selectedLead.status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      toast({
        title: 'Message Sent',
        description: 'Your message has been recorded and the user will be notified.',
      });

      setMessageText('');
      setShowMessageModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send',
        description: 'Unable to send message',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.lead_type.toLowerCase().includes(query) ||
      lead.ai_summary?.toLowerCase().includes(query) ||
      lead.notes?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Lead Management', href: '/admin/dashboard/leads', icon: MessageSquare },
    { label: 'User Management', href: '/admin/dashboard/users', icon: Users },
  ];

  return (
    <DashboardLayout title="Lead Management" navItems={navItems}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground">Manage AI handoffs and user requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contacted</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
                </div>
                <Phone className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>Click on a lead to view details and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No leads found"
                description="Leads will appear here when users request agent assistance"
              />
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{lead.lead_type.replace('_', ' ')}</span>
                          <Badge className={statusColors[lead.status] || 'bg-gray-100'}>
                            {lead.status}
                          </Badge>
                          {lead.priority && (
                            <Badge variant="outline" className={priorityColors[lead.priority]}>
                              {lead.priority} priority
                            </Badge>
                          )}
                        </div>
                        {lead.ai_summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lead.ai_summary.slice(0, 150)}...
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                          <span>ID: {lead.id.slice(0, 8)}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Lead Details
                {selectedLead && (
                  <Badge className={statusColors[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Review AI summary and take action
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-6">
                {/* AI Summary */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Summary
                  </h4>
                  <div className="text-sm whitespace-pre-wrap">
                    {selectedLead.ai_summary || 'No AI summary available'}
                  </div>
                </div>

                {/* Contact Notes */}
                {selectedLead.notes && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Contact Information & Notes</h4>
                    <div className="text-sm whitespace-pre-wrap">
                      {selectedLead.notes}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Lead Type:</span>
                    <span className="ml-2 capitalize">{selectedLead.lead_type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="ml-2 capitalize">{selectedLead.priority || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{new Date(selectedLead.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="ml-2">{new Date(selectedLead.updated_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowMessageModal(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/schedule-meeting')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  
                  <div className="flex-1" />
                  
                  {selectedLead.status !== 'converted' && (
                    <Button
                      variant="default"
                      onClick={() => updateLeadStatus(selectedLead.id, 'converted')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Converted
                    </Button>
                  )}
                  {selectedLead.status !== 'lost' && (
                    <Button
                      variant="destructive"
                      onClick={() => updateLeadStatus(selectedLead.id, 'lost')}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark Lost
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to Lead</DialogTitle>
              <DialogDescription>
                This message will be recorded and the user will be notified
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                  Cancel
                </Button>
                <Button onClick={sendMessage} disabled={isUpdating || !messageText.trim()}>
                  {isUpdating ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LeadManagement;
