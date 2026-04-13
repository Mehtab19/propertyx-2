import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings, Users, Building2, Shield, BarChart3, Eye,
} from "lucide-react";

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
}

interface PropertyRow {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  status: string | null;
  created_at: string | null;
}

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [counts, setCounts] = useState({ users: 0, properties: 0, leads: 0, agents: 0 });

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    const load = async () => {
      const [usersRes, propsRes, leadsRes, agentsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("properties").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("agents").select("id", { count: "exact", head: true }),
      ]);
      setUsers((usersRes.data as ProfileRow[]) || []);
      setProperties((propsRes.data as PropertyRow[]) || []);
      setCounts({
        users: usersRes.data?.length || 0,
        properties: propsRes.data?.length || 0,
        leads: leadsRes.count || 0,
        agents: agentsRes.count || 0,
      });
    };
    load();
  }, [user, profile]);

  if (authLoading) return null;
  if (!user || profile?.role !== "admin") {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Admin Console" }]} />
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-gold" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Admin Console</h1>
              <p className="text-muted-foreground">Manage users, properties, and platform settings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Users", value: counts.users, icon: <Users className="h-5 w-5" /> },
              { label: "Properties", value: counts.properties, icon: <Building2 className="h-5 w-5" /> },
              { label: "Leads", value: counts.leads, icon: <BarChart3 className="h-5 w-5" /> },
              { label: "Agents", value: counts.agents, icon: <Shield className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                <div className="text-gold mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Onboarded</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t border-border hover:bg-secondary/50">
                          <td className="p-4 text-sm font-medium text-foreground">{u.full_name || "—"}</td>
                          <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="p-4"><Badge variant="outline" className="capitalize">{u.role || "buyer"}</Badge></td>
                          <td className="p-4 text-sm">{u.onboarding_completed ? "✅" : "—"}</td>
                          <td className="p-4 text-sm text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id} className="border-t border-border hover:bg-secondary/50 cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                          <td className="p-4 text-sm font-medium text-foreground">{p.title}</td>
                          <td className="p-4 text-sm text-muted-foreground">{p.location}</td>
                          <td className="p-4 text-sm text-foreground">{fmt(p.price)}</td>
                          <td className="p-4"><Badge variant="outline" className="capitalize">{p.property_type}</Badge></td>
                          <td className="p-4"><Badge className="capitalize">{p.status || "available"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
