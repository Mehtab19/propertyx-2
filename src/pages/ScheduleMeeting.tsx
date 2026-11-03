import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, User, Mail, Phone, MessageSquare,
  Building, Video, CheckCircle, ArrowLeft, Clock,
  MapPin, Sparkles, ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  meetingType: 'physical' | 'online';
  preferredDate: string;
  preferredTime: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

const getMinDate = () => new Date().toISOString().split('T')[0];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < current
                ? 'bg-primary text-primary-foreground'
                : i === current
                ? 'bg-gold text-accent-foreground ring-4 ring-gold/30'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-6 sm:w-12 transition-all duration-500 ${i < current ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Input Component ──────────────────────────────────────────────────────────

function FormInput({
  label, error, required, icon: Icon, ...props
}: {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3 rounded-xl border-2 
            ${error ? 'border-destructive bg-destructive/5' : 'border-border bg-background'} 
            text-foreground placeholder:text-muted-foreground/60
            focus:border-gold focus:ring-4 focus:ring-gold/10 outline-none 
            transition-all duration-200 text-sm`}
        />
      </div>
      {error && <p className="text-destructive text-xs flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ScheduleMeeting = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [step, setStep] = useState(0); // 0: personal, 1: meeting, 2: property+notes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    preferredContact: 'phone',
    meetingType: 'physical',
    preferredDate: '',
    preferredTime: '',
    propertyId: searchParams.get('propertyId') || '',
    propertyName: searchParams.get('propertyName') || '',
    propertyLocation: searchParams.get('propertyLocation') || '',
    notes: '',
  });

  const update = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── Validation per step ──────────────────────────────────────────────────

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    if (s === 1) {
      if (!formData.preferredDate) newErrors.preferredDate = 'Please select a date';
      if (!formData.preferredTime) newErrors.preferredTime = 'Please select a time slot';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  // ── Submit to Supabase ───────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user?.id ?? null,
        property_id: formData.propertyId || null,
        agent_id: null,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferred_contact: formData.preferredContact,
        meeting_type: formData.meetingType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        notes: formData.notes || null,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('meeting_requests')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      const ref = `MTG-${data.id.slice(0, 8).toUpperCase()}`;
      setReferenceId(ref);
      setIsSubmitted(true);
      toast({ title: 'Meeting Scheduled!', description: `Reference: ${ref}` });
    } catch (err: any) {
      console.error('Meeting scheduling error:', err);
      toast({
        title: 'Scheduling Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-background">
          <div className="text-center max-w-lg mx-auto px-4 animate-fade-in-up">
            {/* Success Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>

            <Badge className="bg-gold/20 text-gold border-0 mb-4 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" /> Confirmed
            </Badge>
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">
              Meeting Scheduled!
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your consultation request has been submitted. Our team will contact you within 24 hours to confirm the details.
            </p>

            {/* Details Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8 text-left space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gold rounded-full" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Details</span>
              </div>
              {[
                { label: 'Reference', value: referenceId, icon: Sparkles },
                { label: 'Date', value: formData.preferredDate, icon: Calendar },
                { label: 'Time', value: formData.preferredTime, icon: Clock },
                { label: 'Type', value: `${formData.meetingType === 'physical' ? 'Physical Visit' : 'Online Meeting'}`, icon: formData.meetingType === 'physical' ? Building : Video },
                ...(formData.propertyName ? [{ label: 'Property', value: formData.propertyName, icon: MapPin }] : []),
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                  <span className="font-semibold text-foreground text-sm">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
              <Button variant="gold" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  const STEPS = ['Your Info', 'Date & Time', 'Property'];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Badge className="bg-gold/20 text-gold border-0 mb-4 px-3 py-1">
            <Calendar className="w-3 h-3 mr-1.5" /> Book a Consultation
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Schedule a <br />
            <span className="text-gold">Meeting</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-md leading-relaxed">
            Connect with our property experts for a personalized consultation tailored to your investment goals.
          </p>
        </div>
      </section>

      <main className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">

            {/* Step Indicator */}
            <StepIndicator current={step} total={STEPS.length} />

            <form onSubmit={handleSubmit}>

              {/* ── Step 0: Personal Info ─────────────────────────────────── */}
              {step === 0 && (
                <div className="bg-card rounded-3xl p-8 shadow-lg border border-border animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Personal Information</h2>
                      <p className="text-muted-foreground text-sm">Tell us how to reach you</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <FormInput
                      label="Full Name" required
                      icon={User}
                      value={formData.fullName}
                      onChange={e => update('fullName', e.target.value)}
                      placeholder="John Doe"
                      error={errors.fullName}
                    />
                    <FormInput
                      label="Email Address" required
                      icon={Mail}
                      type="email"
                      value={formData.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="john@example.com"
                      error={errors.email}
                    />
                    <FormInput
                      label="Phone Number" required
                      icon={Phone}
                      type="tel"
                      value={formData.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+971 50 123 4567"
                      error={errors.phone}
                    />

                    {/* Preferred Contact */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Preferred Contact Method
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {CONTACT_METHODS.map(({ value, label, icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update('preferredContact', value)}
                            className={`p-3 rounded-xl border-2 transition-all text-center text-sm font-medium ${
                              formData.preferredContact === value
                                ? 'border-gold bg-gold/10 text-foreground'
                                : 'border-border text-muted-foreground hover:border-gold/40'
                            }`}
                          >
                            <div className="text-lg mb-1">{icon}</div>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button type="button" variant="gold" onClick={nextStep} className="px-8 gap-2">
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 1: Date & Time ───────────────────────────────────── */}
              {step === 1 && (
                <div className="bg-card rounded-3xl p-8 shadow-lg border border-border animate-fade-in-up space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Meeting Preferences</h2>
                      <p className="text-muted-foreground text-sm">Choose your ideal time</p>
                    </div>
                  </div>

                  {/* Meeting Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      Meeting Type <span className="text-gold">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'physical', label: 'Physical Visit', sub: 'Visit the property in person', Icon: Building },
                        { value: 'online', label: 'Online Meeting', sub: 'Video call consultation', Icon: Video },
                      ].map(({ value, label, sub, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update('meetingType', value)}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${
                            formData.meetingType === value
                              ? 'border-gold bg-gold/10'
                              : 'border-border hover:border-gold/40'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                            formData.meetingType === value ? 'bg-primary' : 'bg-muted'
                          }`}>
                            <Icon className={`w-6 h-6 ${formData.meetingType === value ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="font-semibold text-foreground">{label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground">
                      Preferred Date <span className="text-gold">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      min={getMinDate()}
                      onChange={e => update('preferredDate', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.preferredDate ? 'border-destructive' : 'border-border'
                      } bg-background text-foreground focus:border-gold focus:ring-4 focus:ring-gold/10 outline-none transition-all text-sm`}
                    />
                    {errors.preferredDate && <p className="text-destructive text-xs">⚠ {errors.preferredDate}</p>}
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Preferred Time <span className="text-gold">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => update('preferredTime', slot)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            formData.preferredTime === slot
                              ? 'border-gold bg-gold/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-gold/40'
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.preferredTime && <p className="text-destructive text-xs">⚠ {errors.preferredTime}</p>}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(0)} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="button" variant="gold" onClick={nextStep} className="px-8 gap-2">
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Property + Notes + Submit ────────────────────── */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Property Info */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Property Details</h2>
                        <p className="text-muted-foreground text-sm">Optional — auto-filled if from a listing</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <FormInput
                        label="Property Name"
                        icon={Building}
                        value={formData.propertyName}
                        onChange={e => update('propertyName', e.target.value)}
                        placeholder="e.g. Marina Bay Residences"
                        readOnly={!!searchParams.get('propertyName')}
                      />
                      <FormInput
                        label="Location"
                        icon={MapPin}
                        value={formData.propertyLocation}
                        onChange={e => update('propertyLocation', e.target.value)}
                        placeholder="e.g. Dubai Marina, Dubai"
                        readOnly={!!searchParams.get('propertyLocation')}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Additional Notes</h2>
                        <p className="text-muted-foreground text-sm">Any specific requirements?</p>
                      </div>
                    </div>
                    <textarea
                      value={formData.notes}
                      onChange={e => update('notes', e.target.value)}
                      rows={4}
                      placeholder="Share any questions, budget range, or specific requirements..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:ring-4 focus:ring-gold/10 outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Booking Summary</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> {formData.preferredDate || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {formData.preferredTime || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {formData.meetingType === 'physical' ? <Building className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                        {formData.meetingType === 'physical' ? 'Physical Visit' : 'Online Meeting'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3.5 h-3.5" /> {formData.fullName || '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      disabled={isSubmitting}
                      className="px-10 gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      {isSubmitting ? 'Scheduling...' : 'Confirm Meeting'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ScheduleMeeting;