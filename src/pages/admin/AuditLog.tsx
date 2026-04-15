/**
 * Audit Log Viewer Page
 * Admin page for viewing audit_events
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { EmptyState } from '@/components/admin/EmptyState';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  new_data: any;
  old_data: any;
  ip_address: string | null;
  created_at: string | null;
  user_email?: string;
  user_name?: string;
}

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))] as string[];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);

      const logsWithUsers: AuditLogEntry[] = (data || []).map(log => {
        const profile = (profiles as any[])?.find(p => p.id === log.user_id);
        return { ...log, user_email: profile?.email || 'Unknown', user_name: profile?.full_name || 'Unknown User' };
      });

      setLogs(logsWithUsers);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const actions = useMemo(() => [...new Set(logs.map(l => l.action))], [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return log.action.toLowerCase().includes(q) || log.entity_type.toLowerCase().includes(q) || (log.user_name || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [logs, searchQuery, actionFilter]);

  return (
    <DashboardLayout title="Audit Log" navItems={adminNavItems}>
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchLogs}><RefreshCw className="w-4 h-4" /></Button>
        </div>

        <div className="p-4">
          {loading ? <TableSkeleton rows={10} columns={5} /> : filteredLogs.length === 0 ? (
            <EmptyState icon={FileText} title="No logs found" description="No audit logs match your filters" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <>
                    <TableRow key={log.id} className="cursor-pointer" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell>{log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}</TableCell>
                      <TableCell><span className="text-sm">{log.user_name}</span></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm') : '-'}</TableCell>
                      <TableCell>{expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</TableCell>
                    </TableRow>
                    {expandedLog === log.id && (
                      <TableRow key={`${log.id}-detail`}>
                        <TableCell colSpan={5}>
                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
                            {JSON.stringify(log.new_data || log.old_data || {}, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLog;
