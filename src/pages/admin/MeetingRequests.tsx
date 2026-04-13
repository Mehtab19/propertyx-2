/**
 * Meeting Requests Admin Page
 * Manage meeting requests with table and calendar views
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  LayoutList,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  Video,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/admin/UserAvatar';
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/TableSkeleton';

type TabValue = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type ViewMode = 'table' | 'calendar';

interface MeetingRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  property_id: string;
  property_title: string;
  property_location: string | null;
  meeting_type: string;
  preferred_date: string;
  preferred_time: string;
  preferred_contact: string;
  message: string | null;
  status: string;
  created_at: string;
}

const MeetingRequests = () => {
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meeting requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    let result = [...meetings];

    // Tab filter
    if (activeTab !== 'cancelled') {
      result = result.filter((m) => m.status === activeTab);
    } else {
      result = result.filter((m) => m.status === 'cancelled' || m.status === 'rejected');
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.property_title.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((m) => m.meeting_type === typeFilter);
    }

    return result;
  }, [meetings, searchQuery, typeFilter, activeTab]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getMeetingsForDay = (day: Date) => {
    return meetings.filter((m) => isSameDay(new Date(m.preferred_date), day));
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-orange-600" />;
      case 'in-person':
      default:
        return <MapPin className="w-4 h-4 text-green-600" />;
    }
  };

  const handleApprove = async () => {
    if (!selectedMeeting) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('meeting_requests')
        .update({ status: 'confirmed' })
        .eq('id', selectedMeeting.id);

      if (error) throw error;

      setMeetings(
        meetings.map((m) =>
          m.id === selectedMeeting.id ? { ...m, status: 'confirmed' } : m
        )
      );
      toast.success('Meeting approved successfully');
      setApproveModalOpen(false);
      setDetailsModalOpen(false);
      setMeetingLink('');
    } catch (error) {
      toast.error('Failed to approve meeting');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMeeting || !rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('meeting_requests')
        .update({ status: 'rejected' })
        .eq('id', selectedMeeting.id);

      if (error) throw error;

      setMeetings(
        meetings.map((m) =>
          m.id === selectedMeeting.id ? { ...m, status: 'rejected' } : m
        )
      );
      toast.success('Meeting rejected');
      setRejectModalOpen(false);
      setDetailsModalOpen(false);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject meeting');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (meeting: MeetingRequest) => {
    try {
      const { error } = await supabase
        .from('meeting_requests')
        .update({ status: 'completed' })
        .eq('id', meeting.id);

      if (error) throw error;

      setMeetings(
        meetings.map((m) =>
          m.id === meeting.id ? { ...m, status: 'completed' } : m
        )
      );
      toast.success('Meeting marked as completed');
    } catch (error) {
      toast.error('Failed to update meeting');
    }
  };

  const openDetails = (meeting: MeetingRequest) => {
    setSelectedMeeting(meeting);
    setDetailsModalOpen(true);
  };

  const stats = {
    pending: meetings.filter((m) => m.status === 'pending').length,
    confirmed: meetings.filter((m) => m.status === 'confirmed').length,
    completed: meetings.filter((m) => m.status === 'completed').length,
  };

  return (
    <DashboardLayout title="Meeting Requests" navItems={adminNavItems}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
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
                value="pending"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Pending
                {stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Confirmed
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Cancelled/Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('table')}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : viewMode === 'table' ? (
            filteredMeetings.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No meeting requests"
                description="No meeting requests match your current filters"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={meeting.full_name} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{meeting.full_name}</p>
                            <p className="text-xs text-muted-foreground">{meeting.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground line-clamp-1">{meeting.property_title}</p>
                        {meeting.property_location && (
                          <p className="text-xs text-muted-foreground">{meeting.property_location}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          <span className="capitalize text-sm">{meeting.meeting_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {format(new Date(meeting.preferred_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">{meeting.preferred_time}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={meeting.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(meeting.created_at), 'MMM dd')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetails(meeting)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {meeting.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setApproveModalOpen(true);
                                  }}
                                  className="text-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setRejectModalOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {meeting.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleComplete(meeting)}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            /* Calendar View */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of month */}
                {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {calendarDays.map((day) => {
                  const dayMeetings = getMeetingsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square p-1 border rounded-lg ${
                        isToday ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="text-xs font-medium text-foreground mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {dayMeetings.slice(0, 2).map((m) => (
                          <div
                            key={m.id}
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                              m.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : m.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            onClick={() => openDetails(m)}
                            title={m.property_title}
                          >
                            {m.preferred_time}
                          </div>
                        ))}
                        {dayMeetings.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayMeetings.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4">
              {/* Requester Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UserAvatar name={selectedMeeting.full_name} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{selectedMeeting.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMeeting.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedMeeting.phone}</p>
                </div>
              </div>

              {/* Property */}
              <div>
                <Label className="text-xs text-muted-foreground">Property</Label>
                <p className="font-medium text-foreground">{selectedMeeting.property_title}</p>
                {selectedMeeting.property_location && (
                  <p className="text-sm text-muted-foreground">{selectedMeeting.property_location}</p>
                )}
              </div>

              {/* Meeting Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedMeeting.preferred_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Time</Label>
                  <p className="font-medium text-foreground">{selectedMeeting.preferred_time}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2">
                    {getMeetingTypeIcon(selectedMeeting.meeting_type)}
                    <span className="capitalize font-medium text-foreground">
                      {selectedMeeting.meeting_type}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <StatusBadge status={selectedMeeting.status} />
                </div>
              </div>

              {/* Message */}
              {selectedMeeting.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedMeeting.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedMeeting.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    className="flex-1"
                    onClick={() => setApproveModalOpen(true)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRejectModalOpen(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirm the meeting with <strong>{selectedMeeting?.full_name}</strong>
            </p>

            {selectedMeeting?.meeting_type === 'virtual' && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                <Input
                  id="meetingLink"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Approving...' : 'Approve Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this meeting request.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MeetingRequests;
