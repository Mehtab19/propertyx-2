/**
 * Developer Dashboard
 * Dashboard for developers to manage their property listings, leads, and inquiries
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout, { developerNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, MessageSquare, Eye, TrendingUp, Plus, Calendar, Clock, Phone, Mail, User, FileText, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  area: string;
  price: number;
  status: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  images: string[] | null;
}

interface Project {
  id: string;
  name: string;
  city: string;
  area: string | null;
  status: string | null;
  project_type: string | null;
  total_units: number | null;
  available_units: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  created_at: string;
  images: string[] | null;
}

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
  user_profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface MeetingRequest {
  id: string;
  property_id: string;
  property_title: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  meeting_type: string;
  status: string;
  message: string | null;
  created_at: string;
}

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [propertiesRes, projectsRes, leadsRes, meetingsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('leads')
          .select('*')
          .eq('lead_type', 'developer_inquiry')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('meeting_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (propertiesRes.error) throw propertiesRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (meetingsRes.error) throw meetingsRes.error;

      setProperties(propertiesRes.data || []);
      setProjects(projectsRes.data || []);
      setMeetingRequests(meetingsRes.data || []);

      // Fetch user profiles for leads
      const leadsWithProfiles = await Promise.all(
        (leadsRes.data || []).map(async (lead) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', lead.user_id)
            .maybeSingle();
          return { ...lead, user_profile: profile || undefined };
        })
      );
      setLeads(leadsWithProfiles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
      toast.success(`Lead marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update lead');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
      case 'closed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
      case 'contacted':
        return 'bg-blue-100 text-blue-700';
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

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const allListings = [
    ...properties.map((p) => ({ ...p, type: 'property' as const, name: p.title })),
    ...projects.map((p) => ({ ...p, type: 'project' as const, title: p.name })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pendingCount = allListings.filter((l) => l.status === 'pending').length;
  const approvedCount = allListings.filter((l) => l.status === 'approved' || l.status === 'active').length;

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
      {/* Action Button */}
      <div className="mb-6">
        <Link to="/submit-listing">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Submit New Listing
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allListings.length}</p>
              <p className="text-sm text-muted-foreground">Total Listings</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved/Active</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leads.length + meetingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Listings */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">My Listings</h2>
            <Link to="/submit-listing">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </Link>
          </div>
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {allListings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No listings yet</p>
                <Link to="/submit-listing" className="text-primary font-semibold mt-2 inline-block">
                  Submit Your First Listing →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {allListings.map((listing) => (
                  <div
                    key={`${listing.type}-${listing.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">
                          {listing.type === 'property' ? listing.title : listing.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {listing.type === 'property' ? 'Property' : 'Project'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.city}{listing.area ? `, ${listing.area}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {listing.type === 'property' && 'price' in listing && (
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status || 'pending')}`}>
                          {listing.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    {listing.type === 'property' && (
                      <Link
                        to={`/property/${listing.id}`}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Eye className="w-5 h-5 text-primary" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leads */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Leads & Inquiries</h2>
          </div>
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {leads.length === 0 && meetingRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leads yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Leads from leads table */}
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">
                        {lead.user_profile?.full_name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority || 'medium'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {lead.ai_summary || lead.notes || 'Developer inquiry'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}

                {/* Meeting requests */}
                {meetingRequests.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{meeting.full_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Interested in: {meeting.property_title}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(meeting.preferred_date).toLocaleDateString()} at {meeting.preferred_time}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-foreground font-medium">
                    {selectedLead.user_profile?.full_name || 'Unknown User'}
                  </p>
                  {selectedLead.user_profile?.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${selectedLead.user_profile.email}`} className="hover:text-primary">
                        {selectedLead.user_profile.email}
                      </a>
                    </div>
                  )}
                  {selectedLead.user_profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedLead.user_profile.phone}`} className="hover:text-primary">
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
                    <p className="text-sm text-foreground">{selectedLead.ai_summary}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                </div>
              )}

              {/* Status & Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedLead.priority)}`}>
                    {selectedLead.priority || 'medium'} priority
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(selectedLead.created_at).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              {selectedLead.status === 'new' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}
                    className="flex-1"
                  >
                    Mark as Contacted
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateLeadStatus(selectedLead.id, 'closed')}
                  >
                    Close Lead
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Detail Modal */}
      <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Meeting Request Details</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-foreground font-medium">{selectedMeeting.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedMeeting.email}`} className="hover:text-primary">
                      {selectedMeeting.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selectedMeeting.phone}`} className="hover:text-primary">
                      {selectedMeeting.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Property & Meeting Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Meeting Details</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Property</p>
                    <p className="text-sm font-medium text-foreground">{selectedMeeting.property_title}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedMeeting.preferred_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Time</p>
                      <p className="text-sm font-medium text-foreground">{selectedMeeting.preferred_time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium text-foreground capitalize">{selectedMeeting.meeting_type}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedMeeting.message && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Message</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                    {selectedMeeting.message}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMeeting.status)}`}>
                  {selectedMeeting.status}
                </span>
              </div>

              {/* Action Buttons */}
              {selectedMeeting.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      updateMeetingStatus(selectedMeeting.id, 'confirmed');
                      setSelectedMeeting({ ...selectedMeeting, status: 'confirmed' });
                    }}
                    className="flex-1"
                  >
                    Confirm Meeting
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateMeetingStatus(selectedMeeting.id, 'cancelled');
                      setSelectedMeeting({ ...selectedMeeting, status: 'cancelled' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
