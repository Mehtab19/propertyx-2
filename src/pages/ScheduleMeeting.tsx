/**
 * Schedule Meeting Page
 * Allows users to schedule property meetings
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Calendar, Clock, User, Mail, Phone, MessageSquare, 
  Building, MapPin, Video, CheckCircle, ArrowLeft 
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { getPropertyById } from '@/data/propertyData';

interface MeetingRequest {
  id: string;
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
  createdAt: string;
}

const ScheduleMeeting = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get property info from URL params if coming from property details
  const propertyIdFromUrl = searchParams.get('propertyId') || '';
  const propertyNameFromUrl = searchParams.get('propertyName') || '';
  const propertyLocationFromUrl = searchParams.get('propertyLocation') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'phone' as 'phone' | 'email' | 'whatsapp',
    meetingType: 'physical' as 'physical' | 'online',
    preferredDate: '',
    preferredTime: '',
    propertyId: propertyIdFromUrl,
    propertyName: propertyNameFromUrl,
    propertyLocation: propertyLocationFromUrl,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a date';
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Create meeting request object
    const meetingRequest: MeetingRequest = {
      id: `MTG-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage (in production, this would be sent to a server)
    try {
      const existingRequests = JSON.parse(localStorage.getItem('meetingRequests') || '[]');
      existingRequests.push(meetingRequest);
      localStorage.setItem('meetingRequests', JSON.stringify(existingRequests));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      
      toast({
        title: "Meeting Scheduled!",
        description: `Your meeting request has been submitted. Reference: ${meetingRequest.id}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success View
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">Meeting Scheduled!</h1>
            <p className="text-muted-foreground mb-8">
              Your meeting request has been successfully submitted. Our team will contact you 
              shortly to confirm the details.
            </p>
            <div className="bg-white rounded-2xl p-6 shadow-card mb-8">
              <h3 className="font-semibold text-primary mb-4">Meeting Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formData.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{formData.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{formData.meetingType} Meeting</span>
                </div>
                {formData.propertyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-medium">{formData.propertyName}</span>
                  </div>
                )}
              </div>
            </div>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative py-16 text-white"
        style={{
          background: `linear-gradient(135deg, rgba(26, 54, 93, 0.92) 0%, rgba(15, 118, 110, 0.88) 100%)`,
        }}
      >
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Schedule a Meeting</h1>
          <p className="text-lg opacity-90">
            Book a consultation with our property experts
          </p>
        </div>
      </section>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-border'} focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-border'} focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-border'} focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all`}
                      placeholder="+1 234 567 890"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      value={formData.preferredContact}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    >
                      <option value="phone">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meeting Preferences */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Meeting Preferences
                </h2>

                {/* Meeting Type */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Meeting Type *
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, meetingType: 'physical' })}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        formData.meetingType === 'physical'
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        formData.meetingType === 'physical' ? 'gradient-primary' : 'bg-muted'
                      }`}>
                        <Building className={`w-6 h-6 ${formData.meetingType === 'physical' ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-primary">Physical Visit</div>
                        <div className="text-sm text-muted-foreground">Visit the property in person</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, meetingType: 'online' })}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        formData.meetingType === 'online'
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        formData.meetingType === 'online' ? 'gradient-primary' : 'bg-muted'
                      }`}>
                        <Video className={`w-6 h-6 ${formData.meetingType === 'online' ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-primary">Online Meeting</div>
                        <div className="text-sm text-muted-foreground">Video call consultation</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      min={getMinDate()}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.preferredDate ? 'border-red-500' : 'border-border'} focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all`}
                    />
                    {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Preferred Time *
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.preferredTime ? 'border-red-500' : 'border-border'} focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all`}
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {errors.preferredTime && <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>}
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Property Information
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Property ID
                    </label>
                    <input
                      type="text"
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-muted/50"
                      placeholder="Auto-filled or enter manually"
                      readOnly={!!propertyIdFromUrl}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Property Name
                    </label>
                    <input
                      type="text"
                      value={formData.propertyName}
                      onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-muted/50"
                      placeholder="Auto-filled or enter manually"
                      readOnly={!!propertyNameFromUrl}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.propertyLocation}
                      onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-muted/50"
                      placeholder="Auto-filled or enter manually"
                      readOnly={!!propertyLocationFromUrl}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Additional Notes
                </h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-none"
                  placeholder="Any specific questions or requirements? (Optional)"
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-12 py-4 text-lg disabled:opacity-50"
                >
                  <Calendar className="w-5 h-5" />
                  {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleMeeting;
