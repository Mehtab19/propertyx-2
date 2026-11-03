import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { seedProperties } from '@/scripts/seedProperties';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/property/SearchFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertiesSection } from "@/components/PropertiesSection";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  TrendingUp,
  Shield,
  MessageSquare,
  Users,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Search,
  Handshake,
} from "lucide-react";
import heroImage from "@/assets/hero-living-room.jpg";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import heroVideoAsset from "../../public/videos/hero-bg.mp4.asset.json";
import DubaiLocationCards from "@/components/DubaiLocationCards";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import MortgageCTASection from "@/components/MortgageCTASection";

// Mock data for featured properties
const featuredProperties = [
  {
    id: "1",
    title: "Luxury Penthouse with Panoramic Views",
    location: "Downtown Manhattan, NYC",
    price: 4500000,
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    propertyType: "penthouse",
    featured: true,
    roiEstimate: 8.5,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  },
  {
    id: "2",
    title: "Modern Waterfront Villa",
    location: "Miami Beach, FL",
    price: 2800000,
    bedrooms: 5,
    bathrooms: 4,
    area: 4500,
    propertyType: "villa",
    featured: true,
    roiEstimate: 7.2,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  },
  {
    id: "3",
    title: "Contemporary City Apartment",
    location: "San Francisco, CA",
    price: 1250000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1400,
    propertyType: "apartment",
    featured: false,
    roiEstimate: 6.8,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  },
];

const stats = [
  { value: "15K+", label: "Properties Listed" },
  { value: "$2.5B+", label: "Total Transactions" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "500+", label: "Expert Agents" },
];

const features = [
  {
    icon: TrendingUp,
    title: "AI-Powered Analytics",
    description: "Get instant ROI estimates, market trends, and investment insights powered by advanced AI.",
  },
  {
    icon: MessageSquare,
    title: "PropertyX Chat",
    description: "Ask questions about any property and get intelligent responses instantly.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every property is verified by our team to ensure authenticity and accuracy.",
  },
  {
    icon: Users,
    title: "Expert Network",
    description: "Connect with certified agents, developers, and mortgage advisors.",
  },
];

const roles = [
  {
    title: "Buyer",
    description: "Find your dream home with AI-powered recommendations",
    icon: "🏠",
    href: "/onboarding?role=buyer",
  },
  {
    title: "Investor",
    description: "Discover high-ROI opportunities with market analytics",
    icon: "📈",
    href: "/onboarding?role=investor",
  },
  {
    title: "Developer",
    description: "List projects and connect with qualified buyers",
    icon: "🏗️",
    href: "/onboarding?role=developer",
  },
  {
    title: "Agent",
    description: "Manage listings and grow your client base",
    icon: "🤝",
    href: "/onboarding?role=agent",
  },
];

const dubaiAreas = [
  'Downtown Dubai',
  'Dubai Marina',
  'Palm Jumeirah',
  'Business Bay',
  'JVC',
  'Dubai Hills',
  'Arabian Ranches',
  'JBR',
  'Al Barsha',
  'Deira',
];

const budgetRanges = [
  { value: '0-500000', label: 'Up to AED 500K' },
  { value: '500000-1000000', label: 'AED 500K - 1M' },
  { value: '1000000-2000000', label: 'AED 1M - 2M' },
  { value: '2000000-5000000', label: 'AED 2M - 5M' },
  { value: '5000000-10000000', label: 'AED 5M - 10M' },
  { value: '10000000+', label: 'AED 10M+' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState('buy');
  const [budget, setBudget] = useState('');
  const [area, setArea] = useState('');

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (area) params.set('location', area);
    if (budget) params.set('budget', budget);
    if (propertyType) params.set('purpose', propertyType);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <HeroVideoBackground poster={heroImage} mp4Src={heroVideoAsset.url} webmSrc={heroVideoAsset.url} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-24 pb-16 sm:pt-20 sm:pb-0">
          <div className="max-w-3xl">
            
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-4 sm:mb-6 animate-fade-in-up">
              Find Your Perfect
              <span className="block text-gold">Property Investment</span>
            </h1>
            
            <p className="text-base sm:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-xl animate-fade-in-up animation-delay-200">
              Discover premium properties with AI-powered insights, real-time analytics, and personalized recommendations tailored to your goals.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-in-up animation-delay-300 items-stretch sm:items-center">
              <Button
                variant="gold"
                size="xl"
                className="w-full sm:w-auto"
                onClick={() => navigate("/properties")}
              >
                Explore Properties
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                className="w-full sm:w-auto"
                onClick={() => navigate("/properties?type=deals")}
              >
                Explore Deals
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                className="w-full sm:w-auto"
                onClick={() => navigate("/onboarding")}
              >
                Get Started Free
              </Button>
            </div>

            {/* Property Search Bar */}
            <div
              className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-12 animate-fade-in-up animation-delay-300 border border-gold/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gold/80">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-white/20 border-gold/30 text-primary-foreground h-12">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="invest">Invest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gold/80">Budget</label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="bg-white/20 border-gold/30 text-primary-foreground h-12">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dubai Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gold/80">Dubai Area</label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger className="bg-white/20 border-gold/30 text-primary-foreground h-12">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {dubaiAreas.map((areaName) => (
                        <SelectItem key={areaName} value={areaName}>
                          {areaName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <Button
                    variant="gold"
                    onClick={handleHeroSearch}
                    className="w-full h-12 text-lg font-semibold"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 animate-fade-in-up animation-delay-400">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <p className="font-display text-xl sm:text-3xl font-bold text-gold">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Explore UAE Section */}
      <DubaiLocationCards />

      {/* Search Bar */}
      <section className="py-10 sm:py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <SearchFilters
            variant="hero"
            submitOnly
            onSearch={(f) => {
              const params = new URLSearchParams();
              if (f.location.trim()) params.set("location", f.location.trim());
              if (f.propertyType !== "all") params.set("type", f.propertyType);
              if (f.priceRange !== "all") params.set("price", f.priceRange);
              if (f.bedrooms !== "all") params.set("beds", f.bedrooms);
              const qs = params.toString();
              navigate(qs ? `/properties?${qs}` : "/properties");
            }}
          />
        </div>
      </section>

      {/* Featured Properties */}
      <PropertiesSection />

      {/* About Section */}
      <AboutSection />

      {/* Why PropertyX - Merged Section */}
      <section className="py-14 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-4">
              Why Choose PropertyX?
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto text-sm sm:text-base">
              Everything that sets us apart — in one place
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Shield, title: "Rigorous Vetting", description: "Every partner undergoes comprehensive due diligence before joining our platform." },
              { icon: Users, title: "Direct Access", description: "Connect directly with project developers and builders, no middlemen." },
              { icon: Star, title: "Premium Selection", description: "Carefully curated properties that meet our high standards." },
              { icon: Handshake, title: "No Commissions", description: "We don't charge commissions or hidden fees — ever." },
              { icon: TrendingUp, title: "AI-Powered Analytics", description: "Get instant ROI estimates, market trends, and investment insights powered by advanced AI." },
              { icon: MessageSquare, title: "InvestX AI Advisor", description: "Ask questions about any property and get intelligent responses instantly." },
              { icon: Building2, title: "Premium Properties", description: "Access exclusive off-market deals and luxury developments across the UAE." },
              { icon: Sparkles, title: "Smart Recommendations", description: "Personalized property matches based on your goals, budget, and lifestyle." },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-gold" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mortgage CTA Section */}
      <MortgageCTASection />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-gold/10 via-secondary to-gold/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-16 text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Join thousands of satisfied clients who found their perfect investment with PropertyX.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Button variant="gold" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/auth?mode=signup")}>
                Create Free Account
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/chat")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                InvestX AI Advisor Chat
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Free for buyers
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={async () => {
              const ok = await seedProperties();
              alert(ok ? 'Properties seeded!' : 'Seed failed - check console');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
          >
            Seed DB (dev only)
          </button>
        </div>
      )}
    </Layout>
  );
}
