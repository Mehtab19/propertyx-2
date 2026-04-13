/**
 * Investor Dashboard
 * Dashboard for investors with portfolio tracking, analyses, leads, and conversations
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout, { investorNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Heart, BarChart3, Eye, DollarSign, Percent, Building2, MessageSquare, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { SAMPLE_PROPERTIES, getPropertyById } from '@/data/propertyData';
import { Button } from '@/components/ui/button';

interface SavedProperty {
  id: string;
  property_id: string;
  created_at: string;
}

interface PropertyAnalysis {
  id: string;
  property_id: string;
  roi_estimate: number | null;
  risk_score: number | null;
  rental_yield: number | null;
  ai_summary: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  lead_type: string;
  status: string;
  created_at: string;
  priority: string | null;
}

interface Conversation {
  id: string;
  title: string | null;
  property_id: string | null;
  updated_at: string;
}

const InvestorDashboard = () => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<PropertyAnalysis[]>([]);
  const [activeLeads, setActiveLeads] = useState<Lead[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [savedRes, analysesRes, leadsRes, conversationsRes] = await Promise.all([
        supabase
          .from('saved_properties')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('property_analyses')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('leads')
          .select('*')
          .eq('user_id', user?.id)
          .in('lead_type', ['viewing', 'mortgage', 'developer_inquiry'])
          .neq('status', 'closed')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user?.id)
          .order('updated_at', { ascending: false })
          .limit(5),
      ]);

      if (savedRes.error) throw savedRes.error;
      if (analysesRes.error) throw analysesRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (conversationsRes.error) throw conversationsRes.error;

      setSavedProperties(savedRes.data || []);
      setRecentAnalyses(analysesRes.data || []);
      setActiveLeads(leadsRes.data || []);
      setRecentConversations(conversationsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio metrics from saved properties
  const portfolioValue = savedProperties.reduce((total, saved) => {
    const property = getPropertyById(saved.property_id);
    if (property) {
      const priceMatch = property.price.match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      const multiplier = property.price.toLowerCase().includes('m') ? 1000000 : 1000;
      return total + price * multiplier;
    }
    return total;
  }, 0);

  const avgROI = savedProperties.length > 0
    ? savedProperties.reduce((total, saved) => {
        const property = getPropertyById(saved.property_id);
        const roiValue = property?.expectedRoi ? parseFloat(property.expectedRoi.replace('%', '')) : 0;
        return total + roiValue;
      }, 0) / savedProperties.length
    : 0;

  // Get investment-focused properties (high ROI)
  const investmentProperties = SAMPLE_PROPERTIES
    .filter((p) => {
      const roiValue = p.expectedRoi ? parseFloat(p.expectedRoi.replace('%', '')) : 0;
      return roiValue >= 12;
    })
    .slice(0, 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'closed':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLeadTypeLabel = (type: string) => {
    switch (type) {
      case 'viewing':
        return 'Property Viewing';
      case 'mortgage':
        return 'Mortgage Inquiry';
      case 'developer_inquiry':
        return 'Developer Inquiry';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" navItems={investorNavItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Investor Dashboard" navItems={investorNavItems}>
      {/* Start New Chat Button */}
      <div className="mb-6">
        <Link to="/chat">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Start New Chat
          </Button>
        </Link>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{savedProperties.length}</p>
              <p className="text-sm text-muted-foreground">Tracked Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                ₹{(portfolioValue / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Percent className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgROI.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg. Expected ROI</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{recentAnalyses.length}</p>
              <p className="text-sm text-muted-foreground">Recent Analyses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Opportunities */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">High ROI Opportunities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {investmentProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-semibold text-primary">{property.price}</span>
                      <span className="text-sm text-green-600 font-semibold">
                        ROI: {property.expectedRoi}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/property/${property.id}`}
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Recent Analyses</h2>
          </div>
          <div className="p-6">
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No property analyses yet</p>
                <Link to="/properties" className="text-primary font-semibold mt-2 inline-block">
                  Analyze a Property →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => {
                  const property = getPropertyById(analysis.property_id);
                  return (
                    <div
                      key={analysis.id}
                      className="p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-foreground">
                          {property?.title || `Property #${analysis.property_id}`}
                        </p>
                        <div className="flex gap-2">
                          {analysis.roi_estimate && (
                            <span className="text-sm text-green-600 font-semibold">
                              ROI: {analysis.roi_estimate}%
                            </span>
                          )}
                          {analysis.rental_yield && (
                            <span className="text-sm text-blue-600 font-semibold">
                              Yield: {analysis.rental_yield}%
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {analysis.ai_summary || 'Analysis completed'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Leads */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Active Leads</h2>
          </div>
          <div className="p-6">
            {activeLeads.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active leads</p>
                <Link to="/handoff" className="text-primary font-semibold mt-2 inline-block">
                  Request Agent Help →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{getLeadTypeLabel(lead.lead_type)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Recent Conversations</h2>
          </div>
          <div className="p-6">
            {recentConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <Link to="/chat" className="text-primary font-semibold mt-2 inline-block">
                  Start a Chat →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentConversations.map((conv) => {
                  const property = conv.property_id ? getPropertyById(conv.property_id) : null;
                  return (
                    <Link
                      key={conv.id}
                      to={`/chat?conversation=${conv.id}`}
                      className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="font-semibold text-foreground">
                        {conv.title || (property ? `About: ${property.title}` : 'General Chat')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard;
