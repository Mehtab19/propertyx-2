import { UserCheck, ArrowRight, Phone, Calendar, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HandoffCTAProps {
  trigger: string;
  conversationId?: string | null;
  propertyId?: string | null;
  shortlistIds?: string[];
  className?: string;
}

const triggerConfig: Record<string, { icon: React.ElementType; title: string; description: string; color: string }> = {
  siteVisit: {
    icon: Calendar,
    title: 'Schedule a Property Visit',
    description: 'Our verified agent will arrange a personal tour of this property.',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  negotiation: {
    icon: DollarSign,
    title: 'Get Negotiation Assistance',
    description: 'Let our expert handle price negotiations on your behalf.',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  legal: {
    icon: FileText,
    title: 'Legal Documentation Help',
    description: 'Connect with experts for title verification and legal guidance.',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  financing: {
    icon: DollarSign,
    title: 'Mortgage & Financing Consultation',
    description: 'Speak with our mortgage partners for loan pre-approval and options.',
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  },
  lowConfidence: {
    icon: UserCheck,
    title: 'Get Expert Guidance',
    description: 'This question needs personalized expert attention.',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  },
  userRequested: {
    icon: Phone,
    title: 'Connect with a Human Agent',
    description: 'Get personalized assistance from our verified property experts.',
    color: 'text-primary bg-primary/10',
  },
};

const HandoffCTA = ({ 
  trigger, 
  conversationId, 
  propertyId, 
  shortlistIds = [],
  className 
}: HandoffCTAProps) => {
  const navigate = useNavigate();
  const config = triggerConfig[trigger] || triggerConfig.userRequested;
  const Icon = config.icon;

  const handleClick = () => {
    const params = new URLSearchParams();
    if (conversationId) params.set('conversationId', conversationId);
    if (propertyId) params.set('propertyId', propertyId);
    if (shortlistIds.length > 0) params.set('shortlist', shortlistIds.join(','));
    params.set('trigger', trigger);
    
    navigate(`/handoff?${params.toString()}`);
  };

  return (
    <Card className={cn('border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2.5 rounded-full flex-shrink-0', config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{config.title}</h4>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Human Expert
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {config.description}
            </p>
            
            <Button 
              size="sm" 
              onClick={handleClick}
              className="w-full sm:w-auto"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Connect Now
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl" />
      </CardContent>
    </Card>
  );
};

export default HandoffCTA;
