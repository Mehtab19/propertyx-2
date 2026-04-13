import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Building2, TrendingUp, Users, MessageSquare, Calendar,
  Eye, Heart, PlusCircle, Settings, BarChart3, PieChart,
} from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ properties: 0, leads: 0, appointments: 0, conversations: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const role = profile?.role;
      if (role === "agent") {
        const { data: agent } = await supabase.from("agents").select("id").eq("user_id", user.id).single();
        if (agent) {
          const [props, leads, appts] = await Promise.all([
            supabase.from("properties").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
            supabase.from("leads").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
            supabase.from("appointments").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
          ]);
          setStats({ properties: props.count || 0, leads: leads.count || 0, appointments: appts.count || 0, conversations: 0 });
        }
      } else if (role === "developer") {
        const { data: dev } = await supabase.from("developers").select("id").eq("user_id", user.id).single();
        if (dev) {
          const [props, leads] = await Promise.all([
            supabase.from("properties").select("id", { count: "exact", head: true }).eq("developer_id", dev.id),
            supabase.from("leads").select("id", { count: "exact", head: true }).eq("developer_id", dev.id),
          ]);
          setStats({ properties: props.count || 0, leads: leads.count || 0, appointments: 0, conversations: 0 });
        }
      } else {
        const [convos, appts] = await Promise.all([
          supabase.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("appointments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ]);
        setStats({ properties: 0, leads: 0, appointments: appts.count || 0, conversations: convos.count || 0 });
      }
    };
    load();
  }, [user, profile]);

  if (authLoading) return null;
  if (!user) {
    navigate("/auth");
    return null;
  }

  const role = profile?.role || "buyer";

  const statCards = role === "agent" || role === "developer"
    ? [
        { label: "My Listings", value: stats.properties, icon: <Building2 className="h-5 w-5" />, color: "text-gold" },
        { label: "Leads", value: stats.leads, icon: <Users className="h-5 w-5" />, color: "text-blue-500" },
        { label: "Appointments", value: stats.appointments, icon: <Calendar className="h-5 w-5" />, color: "text-green-500" },
      ]
    : [
        { label: "Conversations", value: stats.conversations, icon: <MessageSquare className="h-5 w-5" />, color: "text-gold" },
        { label: "Appointments", value: stats.appointments, icon: <Calendar className="h-5 w-5" />, color: "text-blue-500" },
      ];

  const quickActions = role === "agent" || role === "developer"
    ? [
        { label: "Submit Listing", href: "/submit-listing", icon: <PlusCircle className="h-5 w-5" /> },
        { label: "View Properties", href: "/properties", icon: <Eye className="h-5 w-5" /> },
        { label: "PropertyX Chat", href: "/chat", icon: <MessageSquare className="h-5 w-5" /> },
      ]
    : [
        { label: "Browse Properties", href: "/properties", icon: <Building2 className="h-5 w-5" /> },
        { label: "Portfolio Tracker", href: "/portfolio", icon: <PieChart className="h-5 w-5" /> },
        { label: "Investment Advisor", href: "/chat", icon: <MessageSquare className="h-5 w-5" /> },
        { label: "Compare", href: "/compare", icon: <BarChart3 className="h-5 w-5" /> },
        { label: "Mortgage Hub", href: "/mortgage", icon: <TrendingUp className="h-5 w-5" /> },
        { label: "Request Callback", href: "/handoff", icon: <Users className="h-5 w-5" /> },
      ];

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Dashboard" }]} />
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Welcome, {profile?.full_name || "User"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gold/10 text-gold-dark capitalize">{role}</Badge>
                  <span className="text-sm text-muted-foreground">Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.href)}
                className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="text-gold">{a.icon}</div>
                <span className="font-medium text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
