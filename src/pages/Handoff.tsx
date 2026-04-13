import { useState } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

export default function Handoff() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: profile?.full_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    message: "",
  });

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert([{
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      source: "callback_request",
      user_id: user?.id || null,
    }]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-xl">
          <BreadcrumbNav items={[{ label: "Request Callback" }]} />
          {submitted ? (
            <div className="text-center py-24">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">Request Received!</h1>
              <p className="text-muted-foreground mb-6">Our team will reach out to you within 24 hours.</p>
              <Button variant="gold" onClick={() => setSubmitted(false)}>Submit Another</Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <Phone className="h-12 w-12 text-gold mx-auto mb-4" />
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Request a Callback</h1>
                <p className="text-muted-foreground">Connect with our real estate experts for personalized guidance</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+971 50 123 4567" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="I'm interested in properties in..." rows={4} />
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Request Callback
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> 24hr response</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Free consultation</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
