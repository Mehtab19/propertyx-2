import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Send, Sparkles, Building2, TrendingUp, Calculator, MapPin, Loader2,
  Target, PieChart, ShieldCheck, BarChart3, Landmark, Globe, Settings2, Check, X,
  Plus, History, MessageSquare, Trash2, PanelLeftClose, PanelLeft
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string | null; created_at: string | null; updated_at: string | null };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const defaultQuestions = [
  { icon: <Building2 className="h-4 w-4" />, text: "Best apartments under 2M AED in Dubai Marina?" },
  { icon: <TrendingUp className="h-4 w-4" />, text: "Which areas have the highest ROI for 2026?" },
  { icon: <Calculator className="h-4 w-4" />, text: "Calculate mortgage for a 1.5M AED property" },
  { icon: <MapPin className="h-4 w-4" />, text: "Compare Downtown vs JBR for investment" },
];

const investorQuestions = [
  { icon: <PieChart className="h-4 w-4" />, text: "Analyze my portfolio diversification across Dubai areas" },
  { icon: <TrendingUp className="h-4 w-4" />, text: "What's the projected ROI for off-plan properties in 2026?" },
  { icon: <ShieldCheck className="h-4 w-4" />, text: "Assess the risk profile of investing in JVC vs Dubai Hills" },
  { icon: <Target className="h-4 w-4" />, text: "Recommend high-yield properties matching my investment goals" },
  { icon: <Landmark className="h-4 w-4" />, text: "Compare commercial vs residential rental yields in Dubai" },
  { icon: <Globe className="h-4 w-4" />, text: "What are the best emerging markets for property investment?" },
];

const riskOptions = ["Conservative", "Moderate", "Aggressive"];
const horizonOptions = ["Short-term (1-2 yrs)", "Medium-term (3-5 yrs)", "Long-term (5+ yrs)"];
const locationOptions = ["Dubai Marina", "Downtown Dubai", "JBR", "Business Bay", "JVC", "Dubai Hills", "Palm Jumeirah", "Dubai Creek Harbour", "MBR City", "Dubai South"];
const propertyTypeOptions = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Commercial", "Office", "Land"];

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [investorPrefs, setInvestorPrefs] = useState<any>(null);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [twinForm, setTwinForm] = useState({
    risk_tolerance: "Moderate",
    investment_horizon: "Medium-term (3-5 yrs)",
    investment_range_min: "",
    investment_range_max: "",
    target_roi_min: "",
    preferred_locations: [] as string[],
    preferred_property_types: [] as string[],
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const isInvestor = profile?.role === "investor";

  const filteredConversations = useMemo(
    () => historySearch.trim()
      ? conversations.filter(c => c.title?.toLowerCase().includes(historySearch.toLowerCase()))
      : conversations,
    [conversations, historySearch]
  );

  // Load profile & preferences
  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
        if (data) setProfile(data);
      });
      supabase.from("investor_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setInvestorPrefs(data);
          setTwinForm({
            risk_tolerance: data.risk_tolerance || "Moderate",
            investment_horizon: data.investment_horizon || "Medium-term (3-5 yrs)",
            investment_range_min: data.investment_range_min?.toString() || "",
            investment_range_max: data.investment_range_max?.toString() || "",
            target_roi_min: data.target_roi_min?.toString() || "",
            preferred_locations: data.preferred_locations || [],
            preferred_property_types: data.preferred_property_types || [],
          });
        }
      });
    }
  }, [user]);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for a conversation
  const loadConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("messages").delete().eq("conversation_id", convId);
    await supabase.from("conversations").delete().eq("id", convId);
    if (activeConversationId === convId) startNewConversation();
    loadConversations();
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveDigitalTwinProfile = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      risk_tolerance: twinForm.risk_tolerance,
      investment_horizon: twinForm.investment_horizon,
      investment_range_min: twinForm.investment_range_min ? Number(twinForm.investment_range_min) : null,
      investment_range_max: twinForm.investment_range_max ? Number(twinForm.investment_range_max) : null,
      target_roi_min: twinForm.target_roi_min ? Number(twinForm.target_roi_min) : null,
      preferred_locations: twinForm.preferred_locations,
      preferred_property_types: twinForm.preferred_property_types.map(t => t.toLowerCase()) as any,
    };
    const { error } = investorPrefs
      ? await supabase.from("investor_preferences").update(payload).eq("id", investorPrefs.id)
      : await supabase.from("investor_preferences").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved", description: "Your Digital Twin profile has been updated." });
      setShowDigitalTwin(false);
      const { data } = await supabase.from("investor_preferences").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setInvestorPrefs(data);
    }
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const buildSystemContext = () => {
    if (!isInvestor || !investorPrefs) return "";
    return `\n[INVESTOR PROFILE - Digital Twin Context]\nRisk Tolerance: ${investorPrefs.risk_tolerance || "Not set"}\nInvestment Horizon: ${investorPrefs.investment_horizon || "Not set"}\nBudget: ${investorPrefs.investment_range_min || "?"} - ${investorPrefs.investment_range_max || "?"} AED\nTarget ROI: ${investorPrefs.target_roi_min || "?"}%+\nPreferred Locations: ${investorPrefs.preferred_locations?.join(", ") || "Not set"}\nProperty Types: ${investorPrefs.preferred_property_types?.join(", ") || "Not set"}\nPlease personalize all responses based on this investor profile.\n`;
  };

  // Save a message to DB
  const persistMessage = async (conversationId: string, role: string, content: string) => {
    await supabase.from("messages").insert({ conversation_id: conversationId, role, content });
  };

  // Create or get conversation
  const ensureConversation = async (firstMessage: string): Promise<string> => {
    if (activeConversationId) return activeConversationId;
    if (!user) return "";
    const title = firstMessage.length > 60 ? firstMessage.slice(0, 57) + "..." : firstMessage;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) throw new Error("Failed to create conversation");
    setActiveConversationId(data.id);
    loadConversations();
    return data.id;
  };

  const streamChat = async (allMessages: Msg[]) => {
    const systemContext = buildSystemContext();
    const messagesWithContext = systemContext
      ? [{ role: "system" as const, content: systemContext }, ...allMessages]
      : allMessages;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: messagesWithContext }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }
    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const content = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
        }
        return [...prev, { role: "assistant", content }];
      });
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) upsert(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantSoFar;
  };

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      // Persist conversation & user message
      let convId = "";
      if (user) {
        convId = await ensureConversation(msg);
        if (convId) await persistMessage(convId, "user", msg);
      }

      const assistantContent = await streamChat(updated);

      // Persist assistant response
      if (user && convId && assistantContent) {
        await persistMessage(convId, "assistant", assistantContent);
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
        loadConversations();
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${e.message}` }]);
    }
    setIsLoading(false);
  };

  const questions = isInvestor ? investorQuestions : defaultQuestions;

  return (
    <Layout hideFooter>
      <div className="pt-20 h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 pt-4 flex items-center justify-between">
          <BreadcrumbNav items={[{ label: isInvestor ? "Personalized Investor Advisor" : "PropertyX Investment Advisor" }]} />
          <div className="flex items-center gap-2">
            {user && (
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="gap-2">
                {showHistory ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            {isInvestor && (
              <Button variant="outline" size="sm" onClick={() => setShowDigitalTwin(!showDigitalTwin)} className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">{investorPrefs ? "Edit Digital Twin" : "Setup Digital Twin"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Digital Twin Profile Panel */}
        {showDigitalTwin && isInvestor && (
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Digital Twin Profile</h3>
                    <p className="text-xs text-muted-foreground">Personalize your AI advisor with your investment preferences</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDigitalTwin(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Risk Tolerance</Label>
                  <div className="flex gap-2 mt-1.5">
                    {riskOptions.map(r => (
                      <button key={r} onClick={() => setTwinForm(f => ({ ...f, risk_tolerance: r }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${twinForm.risk_tolerance === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Investment Horizon</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {horizonOptions.map(h => (
                      <button key={h} onClick={() => setTwinForm(f => ({ ...f, investment_horizon: h }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${twinForm.investment_horizon === h ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Investment Budget (AED)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input type="number" placeholder="Min" value={twinForm.investment_range_min}
                      onChange={e => setTwinForm(f => ({ ...f, investment_range_min: e.target.value }))} />
                    <Input type="number" placeholder="Max" value={twinForm.investment_range_max}
                      onChange={e => setTwinForm(f => ({ ...f, investment_range_max: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Target ROI (%)</Label>
                  <Input type="number" placeholder="Minimum ROI %" className="mt-1.5" value={twinForm.target_roi_min}
                    onChange={e => setTwinForm(f => ({ ...f, target_roi_min: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Preferred Locations</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {locationOptions.map(loc => (
                    <button key={loc} onClick={() => setTwinForm(f => ({ ...f, preferred_locations: toggleArrayItem(f.preferred_locations, loc) }))}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${twinForm.preferred_locations.includes(loc) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Preferred Property Types</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {propertyTypeOptions.map(pt => (
                    <button key={pt} onClick={() => setTwinForm(f => ({ ...f, preferred_property_types: toggleArrayItem(f.preferred_property_types, pt) }))}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${twinForm.preferred_property_types.includes(pt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDigitalTwin(false)}>Cancel</Button>
                <Button variant="gold" onClick={saveDigitalTwinProfile} className="gap-2">
                  <Check className="h-4 w-4" /> Save Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation History Sidebar */}
          {user && showHistory && (
            <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
              <div className="p-3 border-b border-border space-y-2">
                <Button variant="gold" size="sm" className="w-full gap-2" onClick={startNewConversation}>
                  <Plus className="h-4 w-4" /> New Chat
                </Button>
                <Input
                  placeholder="Search conversations..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 px-3">
                      <History className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">No conversations yet</p>
                    </div>
                  )}
                  {filteredConversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        activeConversationId === conv.id
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{conv.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.updated_at ? format(new Date(conv.updated_at), "MMM d, h:mm a") : ""}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  {isInvestor ? "Your Personalized Investor Advisor" : "PropertyX Investment Advisor"}
                </h1>
                <p className="text-muted-foreground text-center max-w-md mb-2">
                  {isInvestor
                    ? "Your AI-powered digital twin advisor. Get personalized investment insights, portfolio analysis, and market recommendations tailored to your goals."
                    : "Your AI-powered real estate investment advisor. Ask anything about properties, investments, or the market."}
                </p>
                {isInvestor && investorPrefs && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-lg">
                    <Badge variant="outline" className="text-xs gap-1"><ShieldCheck className="h-3 w-3" />{investorPrefs.risk_tolerance || "Moderate"}</Badge>
                    <Badge variant="outline" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />{investorPrefs.target_roi_min ? `${investorPrefs.target_roi_min}%+ ROI` : "ROI: Any"}</Badge>
                    <Badge variant="outline" className="text-xs gap-1"><Target className="h-3 w-3" />{investorPrefs.investment_horizon || "Flexible"}</Badge>
                  </div>
                )}
                {!user && (
                  <p className="text-sm text-muted-foreground mb-6">
                    <button onClick={() => navigate("/auth")} className="text-gold-dark underline">Sign in</button> to save your conversations.
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {questions.map((q, i) => (
                    <button key={i} onClick={() => send(q.text)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-left text-sm">
                      <span className="text-gold">{q.icon}</span>
                      <span className="text-foreground">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                      }`}>
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none text-foreground">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{m.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-2xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-gold" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            <div className="border-t border-border bg-card p-4">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isInvestor ? "Ask about your portfolio, ROI, risk analysis..." : "Ask about properties, investments, mortgages..."}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} variant="gold">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
