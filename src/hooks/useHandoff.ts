import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const HANDOFF_TRIGGERS = {
  siteVisit: ['site visit', 'property visit', 'see the property', 'visit the property', 'physical visit', 'schedule visit', 'book viewing'],
  negotiation: ['negotiate', 'negotiation', 'price negotiation', 'make an offer', 'bargain', 'counter offer'],
  legal: ['legal', 'lawyer', 'documentation', 'registry', 'title deed', 'sale deed', 'agreement', 'contract'],
  financing: ['loan', 'mortgage', 'financing', 'home loan', 'bank loan', 'emi', 'down payment', 'pre-approval'],
};

export type LeadType = 'viewing' | 'agent_help' | 'mortgage' | 'developer_inquiry';

export interface HandoffContext {
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  propertyId?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyType?: string;
  propertyArea?: string;
  confidenceScore?: number;
  shortlistIds?: string[];
}

export interface HandoffFormData {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
  preferredChannel: 'phone' | 'whatsapp' | 'email';
  leadType: LeadType;
  financingNeeded: boolean;
  message?: string;
}

interface AgentMatchCriteria {
  location?: string;
  propertyType?: string;
  area?: string;
}

export interface AssignedAgent {
  id: string;
  name?: string;
  agencyName?: string;
  rating?: number;
}

export const useHandoff = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<AssignedAgent | null>(null);

  const detectHandoffTrigger = useCallback((message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    for (const [triggerType, keywords] of Object.entries(HANDOFF_TRIGGERS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) return triggerType;
      }
    }
    return null;
  }, []);

  const shouldTriggerLowConfidence = useCallback((score?: number): boolean => {
    return score !== undefined && score < 0.65;
  }, []);

  const generateAISummary = useCallback((context: HandoffContext, formData?: HandoffFormData): string => {
    const { conversationHistory, propertyTitle, propertyLocation, shortlistIds } = context;
    const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content);
    const allText = userMessages.join(' ').toLowerCase();
    const summaryParts: string[] = [];

    let userIntent = 'Property inquiry';
    if (formData?.leadType === 'viewing') userIntent = 'Property site visit request';
    else if (formData?.leadType === 'mortgage') userIntent = 'Mortgage/financing consultation';
    else if (formData?.leadType === 'developer_inquiry') userIntent = 'Developer project inquiry';
    else if (formData?.leadType === 'agent_help') userIntent = 'General agent assistance';
    summaryParts.push(`**User Intent:** ${userIntent}`);

    if (propertyTitle) summaryParts.push(`**Selected Property:** ${propertyTitle}`);
    if (propertyLocation) summaryParts.push(`**Location:** ${propertyLocation}`);
    if (shortlistIds && shortlistIds.length > 0) summaryParts.push(`**Shortlisted Properties:** ${shortlistIds.length} properties`);
    if (context.confidenceScore !== undefined) summaryParts.push(`**AI Confidence Score:** ${(context.confidenceScore * 100).toFixed(0)}%`);

    return summaryParts.join('\n\n') || 'User requested human assistance';
  }, []);

  const findMatchingAgent = useCallback(async (criteria: AgentMatchCriteria): Promise<AssignedAgent | null> => {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id, user_id, areas_covered, specializations, agency_name, rating')
        .eq('verified', true);

      if (error || !agents || agents.length === 0) return null;

      const scoredAgents = agents.map((agent: any) => {
        let score = 0;
        if (criteria.area && agent.areas_covered) {
          const areaLower = criteria.area.toLowerCase();
          if (agent.areas_covered.some((served: string) => served.toLowerCase().includes(areaLower) || areaLower.includes(served.toLowerCase()))) {
            score += 15;
          }
        }
        if (criteria.location && agent.areas_covered) {
          const locationLower = criteria.location.toLowerCase();
          if (agent.areas_covered.some((a: string) => a.toLowerCase().includes(locationLower) || locationLower.includes(a.toLowerCase()))) {
            score += 10;
          }
        }
        if (criteria.propertyType && agent.specializations) {
          if (agent.specializations.some((spec: string) => spec.toLowerCase().includes(criteria.propertyType!.toLowerCase()))) {
            score += 8;
          }
        }
        if (agent.rating) score += agent.rating;
        return { ...agent, score };
      });

      scoredAgents.sort((a: any, b: any) => b.score - a.score);
      const bestAgent = scoredAgents[0];
      if (!bestAgent) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', bestAgent.user_id)
        .single();

      return {
        id: bestAgent.id,
        name: profile?.full_name || undefined,
        agencyName: bestAgent.agency_name || undefined,
        rating: bestAgent.rating || undefined,
      };
    } catch (error) {
      console.error('Error finding matching agent:', error);
      return null;
    }
  }, []);

  const logAuditEvent = useCallback(async (
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>
  ) => {
    try {
      if (!user?.id) return;
      await supabase.from('audit_events').insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        new_data: details,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, [user?.id]);

  const initiateHandoff = useCallback(async (
    formData: HandoffFormData,
    context: HandoffContext
  ): Promise<{ success: boolean; leadId?: string; agent?: AssignedAgent }> => {
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please sign in to request agent assistance.' });
      return { success: false };
    }

    setIsProcessing(true);
    setAssignedAgent(null);

    try {
      const aiSummary = generateAISummary(context, formData);
      const agent = await findMatchingAgent({
        location: context.propertyLocation,
        propertyType: context.propertyType,
        area: context.propertyArea,
      });
      setAssignedAgent(agent);

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          user_id: user.id,
          status: 'new' as const,
          source: formData.leadType,
          property_id: context.propertyId || null,
          agent_id: agent?.id || null,
          message: aiSummary,
        }])
        .select('id')
        .single();

      if (leadError) throw leadError;

      await logAuditEvent('handoff_created', 'lead', lead.id, {
        lead_type: formData.leadType,
        assigned_agent_id: agent?.id,
      });

      toast({
        title: 'Request Submitted!',
        description: agent?.name
          ? `${agent.name} has been assigned and will contact you shortly.`
          : 'Your request has been submitted. An agent will be assigned soon.',
      });

      return { success: true, leadId: lead.id, agent };
    } catch (error) {
      console.error('Handoff error:', error);
      toast({ variant: 'destructive', title: 'Request Failed', description: 'Unable to process your request. Please try again.' });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, generateAISummary, findMatchingAgent, logAuditEvent, toast]);

  return {
    detectHandoffTrigger,
    shouldTriggerLowConfidence,
    initiateHandoff,
    generateAISummary,
    isProcessing,
    assignedAgent,
  };
};
