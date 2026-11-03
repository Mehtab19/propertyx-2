import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Percent, Calculator, Phone, Globe, ArrowLeft, Send, CheckCircle2,
  MapPin, ExternalLink, DollarSign, AlertTriangle, FileText, User, Mail, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';

// Mortgage partners with extended details
const mortgagePartners = [
  {
    id: '1',
    bank_name: 'Emirates NBD Home Finance',
    type: 'bank',
    interest_rate_min: 3.99,
    interest_rate_max: 5.5,
    max_loan_amount: 15000000,
    max_tenure_years: 25,
    processing_fee_percent: 1.0,
    features: ['Quick Approval', 'No Hidden Charges', 'Flexible EMI', 'Digital Process'],
    logo_url: '/placeholder.svg',
    location: 'Dubai, Abu Dhabi, Sharjah',
    website: 'https://www.emiratesnbd.com',
    contact_phone: '+971-600-540-000',
    verified: true,
    products: ['Home Purchase', 'Equity Release', 'Construction Finance'],
  },
  {
    id: '2',
    bank_name: 'Abu Dhabi Islamic Bank',
    type: 'islamic',
    interest_rate_min: 3.75,
    interest_rate_max: 5.25,
    max_loan_amount: 20000000,
    max_tenure_years: 25,
    processing_fee_percent: 0.75,
    features: ['Shariah Compliant', 'Profit-based', 'Nationwide', 'Balance Transfer'],
    logo_url: '/placeholder.svg',
    location: 'Nationwide UAE',
    website: 'https://www.adib.ae',
    contact_phone: '+971-2-610-0600',
    verified: true,
    products: ['Murabaha Home Finance', 'Ijarah', 'Diminishing Musharaka'],
  },
  {
    id: '3',
    bank_name: 'Dubai Islamic Bank',
    type: 'islamic',
    interest_rate_min: 3.69,
    interest_rate_max: 5.0,
    max_loan_amount: 25000000,
    max_tenure_years: 25,
    processing_fee_percent: 1.0,
    features: ['Shariah Compliant', 'Off-Plan Financing', 'Expat Friendly', 'Fast Approval'],
    logo_url: '/placeholder.svg',
    location: 'Dubai, Northern Emirates',
    website: 'https://www.dib.ae',
    contact_phone: '+971-4-609-2222',
    verified: true,
    products: ['Al Islami Home Finance', 'Off-Plan Finance', 'Buyout'],
  },
  {
    id: '4',
    bank_name: 'Mashreq Home Loans',
    type: 'bank',
    interest_rate_min: 4.25,
    interest_rate_max: 5.75,
    max_loan_amount: 10000000,
    max_tenure_years: 25,
    processing_fee_percent: 1.25,
    features: ['Fast Processing', 'Flexible Tenure', 'Online Tracking', 'Expat Mortgages'],
    logo_url: '/placeholder.svg',
    location: 'All UAE Emirates',
    website: 'https://www.mashreq.com',
    contact_phone: '+971-4-424-4444',
    verified: true,
    products: ['Home Purchase', 'Equity Release', 'Non-Resident Mortgage'],
  },
  {
    id: '5',
    bank_name: 'HSBC UAE Mortgages',
    type: 'bank',
    interest_rate_min: 3.89,
    interest_rate_max: 5.49,
    max_loan_amount: 18000000,
    max_tenure_years: 25,
    processing_fee_percent: 1.0,
    features: ['International Banking', 'Premier Service', 'Competitive Rates', 'Rent-to-Own'],
    logo_url: '/placeholder.svg',
    location: 'Dubai, Abu Dhabi',
    website: 'https://www.hsbc.ae',
    contact_phone: '+971-4-507-7000',
    verified: true,
    products: ['Home Purchase', 'Remortgage', 'Buy-to-Let'],
  },
];

interface PreApprovalFormData {
  fullName: string;
  email: string;
  phone: string;
  monthlyIncome: string;
  employmentType: string;
  propertyType: string;
  loanAmount: string;
  downPayment: string;
  preferredBank: string;
  message: string;
}

const Mortgage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Calculator State
  const [calculatorTab, setCalculatorTab] = useState<'emi' | 'affordability'>('emi');
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(1500000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [tenure, setTenure] = useState(15);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  // Affordability Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(200000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(80000);
  const [downPayment, setDownPayment] = useState(2000000);
  const [affordInterestRate, setAffordInterestRate] = useState(4.5);
  const [affordTenure, setAffordTenure] = useState(15);
  const [affordableAmount, setAffordableAmount] = useState(0);
  const [affordableEmi, setAffordableEmi] = useState(0);

  // Pre-Approval Modal State
  const [showPreApproval, setShowPreApproval] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<typeof mortgagePartners[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PreApprovalFormData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    monthlyIncome: '',
    employmentType: '',
    propertyType: '',
    loanAmount: '',
    downPayment: '',
    preferredBank: '',
    message: '',
  });

  // Partner Filter State
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'bank' | 'islamic' | 'leasing'>('all');

  // Calculate EMI
  useEffect(() => {
    const principal = loanAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const numberOfPayments = tenure * 12;
    
    if (ratePerMonth > 0) {
      const emiValue = principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfPayments) / 
        (Math.pow(1 + ratePerMonth, numberOfPayments) - 1);
      
      setEmi(Math.round(emiValue));
      setTotalPayment(Math.round(emiValue * numberOfPayments));
      setTotalInterest(Math.round(emiValue * numberOfPayments - principal));
    }
  }, [loanAmount, interestRate, tenure]);

  // Calculate Affordability
  useEffect(() => {
    const disposableIncome = monthlyIncome - monthlyExpenses;
    // Recommended: EMI should not exceed 40% of disposable income
    const maxEmi = disposableIncome * 0.4;
    
    const ratePerMonth = affordInterestRate / 12 / 100;
    const numberOfPayments = affordTenure * 12;
    
    if (ratePerMonth > 0 && maxEmi > 0) {
      // Calculate max loan from max EMI using reverse EMI formula
      const maxLoan = maxEmi * (Math.pow(1 + ratePerMonth, numberOfPayments) - 1) / 
        (ratePerMonth * Math.pow(1 + ratePerMonth, numberOfPayments));
      
      setAffordableAmount(Math.round(maxLoan + downPayment));
      setAffordableEmi(Math.round(maxEmi));
    }
  }, [monthlyIncome, monthlyExpenses, downPayment, affordInterestRate, affordTenure]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: 'AED', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  const openPreApproval = (partner: typeof mortgagePartners[0]) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to request pre-approval.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    setSelectedPartner(partner);
    setFormData(prev => ({
      ...prev,
      email: user?.email || '',
      loanAmount: loanAmount.toString(),
    }));
    setShowPreApproval(true);
  };

  const handlePreApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPartner || !user) return;
    
    setIsSubmitting(true);

    try {
      // Create lead with detailed information
      const { error } = await supabase.from('leads').insert([{
        user_id: user.id,
        mortgage_partner_id: selectedPartner.id,
        lead_type: 'mortgage',
        priority: 'high',
        ai_summary: `**Pre-Approval Request**
Partner: ${selectedPartner.bank_name}
Requested Amount: ${formatCurrency(parseInt(formData.loanAmount) || 0)}
Down Payment: ${formatCurrency(parseInt(formData.downPayment) || 0)}
Monthly Income: PKR ${formData.monthlyIncome}
Employment: ${formData.employmentType}
Property Type: ${formData.propertyType}

**User Intent:** Seeking mortgage pre-approval for property purchase.
**Financing Needs:** Requires loan of ${formatCurrency(parseInt(formData.loanAmount) || 0)} with ${formatCurrency(parseInt(formData.downPayment) || 0)} down payment.
**Next Steps:** Partner to verify income documents and provide rate quote.`,
        notes: `**Contact Details:**
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}

**Financial Details:**
Monthly Income: PKR ${formData.monthlyIncome}
Employment Type: ${formData.employmentType}
Property Type: ${formData.propertyType}
Requested Loan: ${formatCurrency(parseInt(formData.loanAmount) || 0)}
Down Payment: ${formatCurrency(parseInt(formData.downPayment) || 0)}
Preferred Bank: ${formData.preferredBank || selectedPartner.bank_name}

**Additional Message:**
${formData.message || 'N/A'}`,
      }]);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'mortgage_preapproval_request',
        entity_type: 'lead',
        entity_id: selectedPartner.id,
        details: {
          partner: selectedPartner.bank_name,
          loan_amount: formData.loanAmount,
        },
      });

      toast({
        title: 'Pre-Approval Request Submitted!',
        description: `${selectedPartner.bank_name} will review your application and contact you within 48 hours.`,
      });

      setShowPreApproval(false);
      setFormData({
        fullName: '',
        email: user?.email || '',
        phone: '',
        monthlyIncome: '',
        employmentType: '',
        propertyType: '',
        loanAmount: '',
        downPayment: '',
        preferredBank: '',
        message: '',
      });
    } catch (error) {
      console.error('Pre-approval submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Unable to submit your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPartners = mortgagePartners.filter(p => 
    partnerFilter === 'all' || p.type === partnerFilter
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'Conventional Bank';
      case 'islamic': return 'Islamic Finance';
      case 'leasing': return 'Leasing Company';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'islamic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'leasing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return '';
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Mortgage & Leasing Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Compare rates, calculate affordability, and get pre-approved with trusted partners
            </p>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <Alert className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Disclaimer:</strong> All calculations and rates shown are estimates only. Actual interest rates, 
            loan eligibility, and terms are subject to approval and may vary based on your credit profile and the 
            lending institution's policies. Please contact the partner directly for accurate quotes.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculators */}
          <Card className="lg:col-span-1 h-fit sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Financial Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={calculatorTab} onValueChange={(v) => setCalculatorTab(v as 'emi' | 'affordability')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
                  <TabsTrigger value="affordability">Affordability</TabsTrigger>
                </TabsList>

                <TabsContent value="emi" className="space-y-5 mt-0">
                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Loan Amount</Label>
                      <span className="text-sm font-medium text-primary">{formatCurrency(loanAmount)}</span>
                    </div>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={([value]) => setLoanAmount(value)}
                      min={500000}
                      max={20000000}
                      step={100000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5L</span>
                      <span>10Cr</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Interest Rate</Label>
                      <span className="text-sm font-medium text-primary">{interestRate}%</span>
                    </div>
                    <Slider
                      value={[interestRate]}
                      onValueChange={([value]) => setInterestRate(value)}
                      min={15}
                      max={28}
                      step={0.25}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>15%</span>
                      <span>28%</span>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Loan Tenure</Label>
                      <span className="text-sm font-medium text-primary">{tenure} years</span>
                    </div>
                    <Slider
                      value={[tenure]}
                      onValueChange={([value]) => setTenure(value)}
                      min={1}
                      max={25}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 yr</span>
                      <span>25 yrs</span>
                    </div>
                  </div>

                  <Separator />

                  {/* EMI Results */}
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Monthly EMI</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(emi)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Interest</p>
                        <p className="font-semibold text-foreground text-sm">{formatCurrency(totalInterest)}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Payment</p>
                        <p className="font-semibold text-foreground text-sm">{formatCurrency(totalPayment)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="affordability" className="space-y-5 mt-0">
                  {/* Monthly Income */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Monthly Income</Label>
                      <span className="text-sm font-medium text-primary">{formatCurrency(monthlyIncome)}</span>
                    </div>
                    <Slider
                      value={[monthlyIncome]}
                      onValueChange={([value]) => setMonthlyIncome(value)}
                      min={50000}
                      max={2000000}
                      step={10000}
                    />
                  </div>

                  {/* Monthly Expenses */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Monthly Expenses</Label>
                      <span className="text-sm font-medium text-primary">{formatCurrency(monthlyExpenses)}</span>
                    </div>
                    <Slider
                      value={[monthlyExpenses]}
                      onValueChange={([value]) => setMonthlyExpenses(value)}
                      min={20000}
                      max={1000000}
                      step={5000}
                    />
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Down Payment</Label>
                      <span className="text-sm font-medium text-primary">{formatCurrency(downPayment)}</span>
                    </div>
                    <Slider
                      value={[downPayment]}
                      onValueChange={([value]) => setDownPayment(value)}
                      min={500000}
                      max={20000000}
                      step={100000}
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Expected Rate</Label>
                      <span className="text-sm font-medium text-primary">{affordInterestRate}%</span>
                    </div>
                    <Slider
                      value={[affordInterestRate]}
                      onValueChange={([value]) => setAffordInterestRate(value)}
                      min={15}
                      max={28}
                      step={0.25}
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Tenure</Label>
                      <span className="text-sm font-medium text-primary">{affordTenure} years</span>
                    </div>
                    <Slider
                      value={[affordTenure]}
                      onValueChange={([value]) => setAffordTenure(value)}
                      min={5}
                      max={25}
                      step={1}
                    />
                  </div>

                  <Separator />

                  {/* Affordability Results */}
                  <div className="space-y-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">You Can Afford Up To</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(affordableAmount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Including {formatCurrency(downPayment)} down payment)
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Recommended Max EMI</p>
                      <p className="font-semibold text-foreground">{formatCurrency(affordableEmi)}/month</p>
                      <p className="text-xs text-muted-foreground">(40% of disposable income)</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Partner Directory */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Partner Directory
              </h2>
              
              <div className="flex gap-2">
                {(['all', 'bank', 'islamic', 'leasing'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={partnerFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPartnerFilter(filter)}
                  >
                    {filter === 'all' ? 'All' : getTypeLabel(filter)}
                  </Button>
                ))}
              </div>
            </div>
            
            {filteredPartners.map(partner => (
              <Card key={partner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{partner.bank_name}</h3>
                            {partner.verified && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            <Badge className={getTypeBadgeColor(partner.type)}>
                              {getTypeLabel(partner.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {partner.location}
                          </div>
                        </div>
                      </div>

                      {/* Rates */}
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">Interest/Profit Rate</p>
                        <p className="text-2xl font-bold text-primary">
                          {partner.interest_rate_min}% - {partner.interest_rate_max}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Up to {formatCurrency(partner.max_loan_amount)} • {partner.max_tenure_years} years
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Products Offered:</p>
                      <div className="flex flex-wrap gap-2">
                        {partner.products.map((product, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {partner.features.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Separator />

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-sm">
                        <a 
                          href={`tel:${partner.contact_phone}`}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {partner.contact_phone}
                        </a>
                        <a 
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      <Button onClick={() => openPreApproval(partner)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Request Pre-Approval
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Partner CTA */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Are you a Mortgage Provider or Leasing Company?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our network of trusted lending partners and connect with qualified property buyers.
                </p>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Partner with Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Pre-Approval Modal */}
      <Dialog open={showPreApproval} onOpenChange={setShowPreApproval}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Request Pre-Approval
            </DialogTitle>
            <DialogDescription>
              {selectedPartner && `Submit your application to ${selectedPartner.bank_name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePreApprovalSubmit} className="space-y-4">
            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <Separator />

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (PKR) *</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g. 25000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                    <SelectItem value="business-owner">Business Owner</SelectItem>
                    <SelectItem value="professional">Professional (Doctor/Lawyer/etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="plot">Plot/Land</SelectItem>
                    <SelectItem value="commercial">Commercial Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Required Loan Amount (PKR) *</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="e.g. 1500000"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment Available (PKR) *</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="e.g. 500000"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Information</Label>
              <Textarea
                id="message"
                placeholder="Any additional details about your requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>

            {/* Disclaimer */}
            <Alert className="border-muted">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                By submitting this form, you consent to share your information with {selectedPartner?.bank_name}. 
                Pre-approval is subject to document verification and credit assessment.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPreApproval(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </Layout>
  );
};

export default Mortgage;
