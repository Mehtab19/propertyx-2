import { useState } from 'react';
import { User, Phone, Mail, Clock, MessageSquare, Send, CheckCircle, UserCheck, Building, CreditCard, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useHandoff, HandoffContext, HandoffFormData, LeadType, AssignedAgent } from '@/hooks/useHandoff';
import { cn } from '@/lib/utils';

interface HandoffFormProps {
  context: HandoffContext;
  triggerReason: string;
  onSuccess?: (leadId: string, agent?: AssignedAgent) => void;
  onCancel?: () => void;
  className?: string;
}

const preferredTimeOptions = [
  { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
  { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
  { value: 'anytime', label: 'Any time' },
];

const leadTypeOptions: { value: LeadType; label: string; description: string }[] = [
  { value: 'viewing', label: 'Schedule Viewing', description: 'Book a property site visit' },
  { value: 'agent_help', label: 'Agent Assistance', description: 'Get help from a property expert' },
  { value: 'mortgage', label: 'Mortgage Help', description: 'Connect with financing partners' },
  { value: 'developer_inquiry', label: 'Developer Inquiry', description: 'Questions about projects/developers' },
];

const getDefaultLeadType = (triggerReason: string): LeadType => {
  switch (triggerReason) {
    case 'siteVisit':
      return 'viewing';
    case 'financing':
      return 'mortgage';
    case 'developer':
      return 'developer_inquiry';
    default:
      return 'agent_help';
  }
};

const HandoffForm = ({
  context,
  triggerReason,
  onSuccess,
  onCancel,
  className,
}: HandoffFormProps) => {
  const { user } = useAuth();
  const { initiateHandoff, isProcessing } = useHandoff();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAgent, setSubmittedAgent] = useState<AssignedAgent | null>(null);
  const [formData, setFormData] = useState<HandoffFormData>({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    preferredTime: 'anytime',
    preferredChannel: 'phone',
    leadType: getDefaultLeadType(triggerReason),
    financingNeeded: triggerReason === 'financing',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await initiateHandoff(formData, context);
    
    if (result.success) {
      setIsSubmitted(true);
      setSubmittedAgent(result.agent || null);
      if (result.leadId) {
        onSuccess?.(result.leadId, result.agent);
      }
    }
  };

  const getTriggerMessage = () => {
    switch (triggerReason) {
      case 'siteVisit':
        return 'Schedule a property visit with an expert';
      case 'negotiation':
        return 'Connect with an agent for negotiation';
      case 'legal':
        return 'Get legal assistance for your property';
      case 'financing':
        return 'Speak with a mortgage specialist';
      case 'lowConfidence':
        return 'Get personalized assistance from an expert';
      case 'userRequested':
        return 'Connect with a property expert';
      default:
        return 'Request human assistance';
    }
  };

  if (isSubmitted) {
    return (
      <Card className={cn('border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20', className)}>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Request Submitted!</h3>
          
          {submittedAgent && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4 mx-auto max-w-sm">
              <p className="text-sm text-muted-foreground mb-2">Your assigned agent:</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{submittedAgent.name || 'Property Expert'}</p>
                  {submittedAgent.agencyName && (
                    <p className="text-sm text-muted-foreground">{submittedAgent.agencyName}</p>
                  )}
                  {submittedAgent.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{submittedAgent.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-muted-foreground mb-4">
            {submittedAgent?.name 
              ? `${submittedAgent.name} will contact you shortly via your preferred channel.`
              : 'An agent has been assigned and will contact you shortly via your preferred channel.'}
          </p>
          
          <div className="bg-muted/30 rounded-lg p-4 mb-4 text-left max-w-sm mx-auto">
            <p className="text-sm font-medium mb-2">Next Steps:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Agent will review your requirements</li>
              <li>• You'll receive a call/message within 24 hours</li>
              <li>• Prepare any questions you have ready</li>
            </ul>
          </div>
          
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {/* Lead Type Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Building className="h-3.5 w-3.5" />
          What do you need help with? *
        </Label>
        <Select
          value={formData.leadType}
          onValueChange={(value) => setFormData({ ...formData, leadType: value as LeadType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type of assistance" />
          </SelectTrigger>
          <SelectContent>
            {leadTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="handoff-name" className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          Full Name *
        </Label>
        <Input
          id="handoff-name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Email & Phone in row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="handoff-email" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email *
          </Label>
          <Input
            id="handoff-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handoff-phone" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Phone *
          </Label>
          <Input
            id="handoff-phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Preferred Communication Channel */}
      <div className="space-y-2">
        <Label>Preferred Contact Channel *</Label>
        <RadioGroup
          value={formData.preferredChannel}
          onValueChange={(value) => setFormData({ ...formData, preferredChannel: value as HandoffFormData['preferredChannel'] })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="channel-phone" />
            <Label htmlFor="channel-phone" className="cursor-pointer font-normal">
              Phone Call
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="channel-whatsapp" />
            <Label htmlFor="channel-whatsapp" className="cursor-pointer font-normal">
              WhatsApp
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="channel-email" />
            <Label htmlFor="channel-email" className="cursor-pointer font-normal">
              Email
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Preferred Time */}
      <div className="space-y-2">
        <Label htmlFor="handoff-time" className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Preferred Contact Time
        </Label>
        <Select
          value={formData.preferredTime}
          onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
        >
          <SelectTrigger id="handoff-time">
            <SelectValue placeholder="Select preferred time" />
          </SelectTrigger>
          <SelectContent>
            {preferredTimeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Financing Needed Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="financing-needed" className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Need Financing Help?
          </Label>
          <p className="text-xs text-muted-foreground">
            Connect with mortgage partners for pre-approval
          </p>
        </div>
        <Switch
          id="financing-needed"
          checked={formData.financingNeeded}
          onCheckedChange={(checked) => setFormData({ ...formData, financingNeeded: checked })}
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="handoff-message" className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Additional Notes (Optional)
        </Label>
        <Textarea
          id="handoff-message"
          placeholder="Any specific questions or requirements?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isProcessing}>
          {isProcessing ? (
            'Submitting...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Connect with Agent
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        An agent will be assigned based on property location, type, and availability
      </p>
    </form>
  );
};

export default HandoffForm;