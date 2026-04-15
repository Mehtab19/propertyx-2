/**
 * Meeting Requests Admin Page
 * Uses appointments table since meeting_requests doesn't exist
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, Calendar as CalendarIcon, Clock, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { EmptyState } from '@/components/admin/EmptyState';

interface Appointment {
  id: string;
  user_id: string | null;
  agent_id: string | null;
  property_id: string | null;
  scheduled_at: string;
  status: string | null;
  notes: string | null;
  created_at: string | null;
}

const MeetingRequests = () => {
  const [meetings, setMeetings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('appointments').select('*').order('scheduled_at', { ascending: false });
      if (error) throw error;
      setMeetings((data || []) as Appointment[]);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status: status as any }).eq('id', id);
      if (error) throw error;
      setMeetings(meetings.map(m => m.id === id ? { ...m, status } : m));
      toast.success(`Appointment ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      return true;
    });
  }, [meetings, statusFilter]);

  const statusColor = (s: string | null) => {
    switch (s) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout title="Meeting Requests" navItems={adminNavItems}>
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4">
          {loading ? <TableSkeleton rows={5} columns={4} /> : filteredMeetings.length === 0 ? (
            <EmptyState icon={CalendarIcon} title="No appointments" description="No appointments found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{format(new Date(m.scheduled_at), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell><Badge className={statusColor(m.status)}>{m.status || 'pending'}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{m.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {m.status === 'scheduled' && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => updateStatus(m.id, 'confirmed')}><Check className="w-4 h-4 text-green-600" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => updateStatus(m.id, 'cancelled')}><X className="w-4 h-4 text-red-600" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeetingRequests;
