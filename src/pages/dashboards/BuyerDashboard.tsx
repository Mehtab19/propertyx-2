/**
 * Buyer Dashboard
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout, { buyerNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { Heart, BarChart3, FileText, MessageSquare, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  title: string | null;
  property_id: string | null;
  updated_at: string | null;
}

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const { savedSearches, loading: searchesLoading } = useSavedSearches();
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentConversations((data || []) as Conversation[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" navItems={buyerNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Buyer Dashboard" navItems={buyerNavItems}>
      <div className="mb-6">
        <Link to="/chat"><Button className="gap-2"><Plus className="w-4 h-4" />Start New Chat</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Heart className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{favoriteIds.size}</p><p className="text-sm text-muted-foreground">Saved Properties</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center"><BarChart3 className="w-6 h-6 text-secondary-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{savedSearches.length}</p><p className="text-sm text-muted-foreground">Saved Searches</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center"><MessageSquare className="w-6 h-6 text-accent-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{recentConversations.length}</p><p className="text-sm text-muted-foreground">Conversations</p></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Conversations</h2></div>
        <div className="p-6">
          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <Link to="/chat" className="text-primary font-semibold mt-2 inline-block">Start a Chat →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentConversations.map(conv => (
                <Link key={conv.id} to={`/chat?conversation=${conv.id}`} className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <p className="font-semibold text-foreground">{conv.title || 'General Chat'}</p>
                  <p className="text-sm text-muted-foreground">Last updated: {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : '-'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
