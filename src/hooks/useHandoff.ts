import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Keywords that trigger handoff
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

  // Check if message contains handoff triggers
  const detectHandoffTrigger = useCallback((message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [triggerType, keywords] of Object.entries(HANDOFF_TRIGGERS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return triggerType;
        }
      }
    }
    
    return null;
  }, []);

  // Check if confidence score is low
  const shouldTriggerLowConfidence = useCallback((score?: number): boolean => {
    return score !== undefined && score < 0.65;
  }, []);

  // Generate AI summary from conversation
  const generateAISummary = useCallback((context: HandoffContext, formData?: HandoffFormData): string => {
    const { conversationHistory, propertyTitle, propertyLocation, shortlistIds } = context;
    
    // Extract key information from conversation
    const userMessages = conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content);
    
    const allText = userMessages.join(' ').toLowerCase();
    
    // Build structured summary
    const summaryParts: string[] = [];
    
    // 1. User Intent (from lead type if available)
    let userIntent = 'Property inquiry';
    if (formData?.leadType === 'viewing') {
      userIntent = 'Property site visit request';
    } else if (formData?.leadType === 'mortgage') {
      userIntent = 'Mortgage/financing consultation';
    } else if (formData?.leadType === 'developer_inquiry') {
      userIntent = 'Developer project inquiry';
    } else if (formData?.leadType === 'agent_help') {
      userIntent = 'General agent assistance';
    } else if (allText.includes('invest') || allText.includes('roi') || allText.includes('rental yield')) {
      userIntent = 'Investment opportunity assessment';
    } else if (allText.includes('buy') || allText.includes('purchase') || allText.includes('home')) {
      userIntent = 'Home purchase for personal use';
    } else if (allText.includes('viewing') || allText.includes('visit')) {
      userIntent = 'Property site visit request';
    } else if (allText.includes('negotiat')) {
      userIntent = 'Price negotiation assistance';
    } else if (allText.includes('mortgage') || allText.includes('loan') || allText.includes('financing')) {
      userIntent = 'Mortgage/financing consultation';
    } else if (allText.includes('legal') || allText.includes('documentation')) {
      userIntent = 'Legal/documentation assistance';
    }
    summaryParts.push(`**User Intent:** ${userIntent}`);
    
    // 2. Budget
    let budget = 'Not specified';
    const budgetPatterns = [
      /(?:budget|afford|spend)[:\s]*(?:pkr|rs\.?)?[\s]*(\d+(?:,\d+)*)\s*(?:to|-)\s*(?:pkr|rs\.?)?[\s]*(\d+(?:,\d+)*)\s*(?:lac|lakh|crore|cr)?/gi,
      /(\d+(?:,\d+)*)\s*(?:lac|lakh|crore|cr)\s*(?:to|-)\s*(\d+(?:,\d+)*)\s*(?:lac|lakh|crore|cr)?/gi,
      /(?:budget|afford|spend)[:\s]*(?:pkr|rs\.?)?[\s]*(\d+(?:,\d+)*)\s*(?:lac|lakh|crore|cr)?/gi,
    ];
    for (const pattern of budgetPatterns) {
      const match = pattern.exec(allText);
      if (match) {
        budget = match[0].replace(/budget|afford|spend/gi, '').trim();
        break;
      }
    }
    summaryParts.push(`**Budget:** ${budget}`);
    
    // 3. Preferred Location
    const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan'];
    const areas = ['dha', 'bahria', 'gulberg', 'clifton', 'defence', 'f-7', 'f-8', 'e-11'];
    const foundLocations: string[] = [];
    for (const city of cities) {
      if (allText.includes(city)) {
        foundLocations.push(city.charAt(0).toUpperCase() + city.slice(1));
      }
    }
    for (const area of areas) {
      if (allText.includes(area)) {
        foundLocations.push(area.toUpperCase());
      }
    }
    if (propertyLocation) {
      foundLocations.unshift(propertyLocation);
    }
    summaryParts.push(`**Preferred Location:** ${foundLocations.length > 0 ? [...new Set(foundLocations)].join(', ') : 'Not specified'}`);
    
    // 4. Selected Properties
    if (propertyTitle) {
      summaryParts.push(`**Selected Property:** ${propertyTitle}`);
    }
    
    // 5. Shortlisted Properties
    if (shortlistIds && shortlistIds.length > 0) {
      summaryParts.push(`**Shortlisted Properties:** ${shortlistIds.length} properties`);
    }
    
    // 6. Financing Needs
    let financingNeeds = 'Not discussed';
    if (formData?.financingNeeded === true) {
      financingNeeds = 'Yes - requires financing assistance';
    } else if (formData?.financingNeeded === false) {
      financingNeeds = 'No financing needed';
    } else if (allText.includes('cash') && !allText.includes('mortgage')) {
      financingNeeds = 'Cash purchase - no financing needed';
    } else if (allText.includes('mortgage') || allText.includes('home loan') || allText.includes('bank loan')) {
      financingNeeds = 'Requires mortgage/bank financing';
    } else if (allText.includes('emi') || allText.includes('installment')) {
      financingNeeds = 'Prefers installment plan';
    } else if (allText.includes('pre-approv')) {
      financingNeeds = 'Seeking pre-approval';
    } else if (allText.includes('islamic') || allText.includes('shariah')) {
      financingNeeds = 'Prefers Islamic/Shariah-compliant financing';
    }
    summaryParts.push(`**Financing Needs:** ${financingNeeds}`);
    
    // 7. Risk Flags
    const riskFlags: string[] = [];
    if (allText.includes('delay') || allText.includes('construction')) {
      riskFlags.push('Construction timeline concerns');
    }
    if (allText.includes('developer') && (allText.includes('trust') || allText.includes('reliable'))) {
      riskFlags.push('Developer credibility verification needed');
    }
    if (allText.includes('legal') || allText.includes('title') || allText.includes('documentation')) {
      riskFlags.push('Legal verification required');
    }
    if (allText.includes('market') && (allText.includes('down') || allText.includes('crash') || allText.includes('risk'))) {
      riskFlags.push('Market volatility concerns');
    }
    if (allText.includes('first time') || allText.includes('never bought')) {
      riskFlags.push('First-time buyer - needs guidance');
    }
    if (allText.includes('urgent') || allText.includes('asap') || allText.includes('quickly')) {
      riskFlags.push('Urgent timeline');
    }
    if (riskFlags.length > 0) {
      summaryParts.push(`**Risk Flags:**\n${riskFlags.map(r => `• ${r}`).join('\n')}`);
    }
    
    // 8. Next Steps
    const nextSteps: string[] = [];
    if (formData?.leadType === 'viewing' || userIntent.includes('site visit')) {
      nextSteps.push('Schedule property viewing');
    }
    if (userIntent.includes('negotiation')) {
      nextSteps.push('Prepare negotiation strategy');
    }
    if (formData?.financingNeeded || financingNeeds.includes('mortgage') || financingNeeds.includes('financing')) {
      nextSteps.push('Connect with mortgage partner');
    }
    if (riskFlags.some(r => r.includes('Legal'))) {
      nextSteps.push('Verify property documentation');
    }
    nextSteps.push('Assign dedicated agent');
    nextSteps.push('Follow up within 24 hours');
    summaryParts.push(`**Recommended Next Steps:**\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
    
    // 9. Confidence score
    if (context.confidenceScore !== undefined) {
      summaryParts.push(`**AI Confidence Score:** ${(context.confidenceScore * 100).toFixed(0)}%`);
    }
    
    return summaryParts.join('\n\n') || 'User requested human assistance';
  }, []);

  // Find best matching agent based on criteria
  const findMatchingAgent = useCallback(async (criteria: AgentMatchCriteria): Promise<AssignedAgent | null> => {
    try {
      // Get agents with their profile info
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id, user_id, areas_served, specialization, agency_name, rating')
        .eq('verified', true);
      
      if (error || !agents || agents.length === 0) {
        console.log('No verified agents found');
        return null;
      }
      
      // Score agents based on matching criteria
      const scoredAgents = agents.map(agent => {
        let score = 0;
        
        // Area match (highest priority) - match property area with agent's areas_served
        if (criteria.area && agent.areas_served) {
          const areaLower = criteria.area.toLowerCase();
          if (agent.areas_served.some((served: string) => 
            served.toLowerCase().includes(areaLower) || 
            areaLower.includes(served.toLowerCase())
          )) {
            score += 15;
          }
        }
        
        // Location match
        if (criteria.location && agent.areas_served) {
          const locationLower = criteria.location.toLowerCase();
          if (agent.areas_served.some((area: string) => 
            area.toLowerCase().includes(locationLower) || 
            locationLower.includes(area.toLowerCase())
          )) {
            score += 10;
          }
        }
        
        // Property type match with specialization
        if (criteria.propertyType && agent.specialization) {
          if (agent.specialization.some((spec: string) => 
            spec.toLowerCase().includes(criteria.propertyType!.toLowerCase()) ||
            criteria.propertyType!.toLowerCase().includes(spec.toLowerCase())
          )) {
            score += 8;
          }
        }
        
        // Bonus for rating
        if (agent.rating) {
          score += agent.rating;
        }
        
        return { ...agent, score };
      });
      
      // Sort by score and return best match
      scoredAgents.sort((a, b) => b.score - a.score);
      const bestAgent = scoredAgents[0];
      
      if (!bestAgent) return null;

      // Get agent's profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', bestAgent.user_id)
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

  // Log audit event
  const logAuditEvent = useCallback(async (
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>
  ) => {
    try {
      if (!user?.id) return;
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, [user?.id]);

  // Main handoff function
  const initiateHandoff = useCallback(async (
    formData: HandoffFormData,
    context: HandoffContext
  ): Promise<{ success: boolean; leadId?: string; agent?: AssignedAgent }> => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to request agent assistance.',
      });
      return { success: false };
    }

    setIsProcessing(true);
    setAssignedAgent(null);

    try {
      // Generate AI summary with form data
      const aiSummary = generateAISummary(context, formData);
      
      // Find matching agent with enhanced criteria
      const agent = await findMatchingAgent({
        location: context.propertyLocation,
        propertyType: context.propertyType,
        area: context.propertyArea,
      });

      setAssignedAgent(agent);

      // Build notes with shortlist info
      const shortlistInfo = context.shortlistIds && context.shortlistIds.length > 0
        ? `**Shortlisted Property IDs:** ${context.shortlistIds.join(', ')}`
        : '';

      // Create lead with all required fields
      const leadData = {
        user_id: user.id,
        lead_type: formData.leadType,
        status: 'new',
        priority: context.confidenceScore && context.confidenceScore < 0.5 ? 'high' : 'medium',
        property_id: context.propertyId || null,
        agent_id: agent?.id || null,
        ai_summary: aiSummary,
        notes: `**Contact:** ${formData.name}
**Phone:** ${formData.phone}
**Email:** ${formData.email}
**Preferred Time:** ${formData.preferredTime}
**Preferred Channel:** ${formData.preferredChannel}
**Lead Type:** ${formData.leadType}
**Financing Needed:** ${formData.financingNeeded ? 'Yes' : 'No'}
${shortlistInfo}
${formData.message ? `**Additional Notes:** ${formData.message}` : ''}`,
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select('id')
        .single();

      if (leadError) throw leadError;

      // Log audit event with event_type=handoff_created
      await logAuditEvent(
        'handoff_created',
        'lead',
        lead.id,
        {
          event_type: 'handoff_created',
          lead_type: formData.leadType,
          financing_needed: formData.financingNeeded,
          shortlisted_property_ids: context.shortlistIds || [],
          confidence_score: context.confidenceScore,
          assigned_agent_id: agent?.id,
          assigned_agent_name: agent?.name,
          property_id: context.propertyId,
          preferred_channel: formData.preferredChannel,
        }
      );

      toast({
        title: 'Request Submitted!',
        description: agent?.name 
          ? `${agent.name} has been assigned and will contact you shortly.`
          : 'Your request has been submitted. An agent will be assigned soon.',
      });

      return { success: true, leadId: lead.id, agent };
    } catch (error) {
      console.error('Handoff error:', error);
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'Unable to process your request. Please try again.',
      });
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
