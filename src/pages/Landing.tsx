import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/property/SearchFilters";
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
} from "lucide-react";
import heroImage from "@/assets/hero-living-room.jpg";
import DubaiLocationCards from "@/components/DubaiLocationCards";

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

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxury property"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl">
            <Badge className="bg-gold/20 text-gold border-0 mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Real Estate Platform
            </Badge>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
              Find Your Perfect
              <span className="block text-gold">Property Investment</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-xl animate-fade-in-up animation-delay-200">
              Discover premium properties with AI-powered insights, real-time analytics, and personalized recommendations tailored to your goals.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up animation-delay-300">
              <Button
                variant="gold"
                size="xl"
                onClick={() => navigate("/properties")}
              >
                Explore Properties
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                onClick={() => navigate("/onboarding")}
              >
                Get Started Free
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 animate-fade-in-up animation-delay-400">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-gold">
                    {stat.value}
                  </p>
                  <p className="text-sm text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Explore UAE Section */}
      <DubaiLocationCards />

      {/* Search Bar */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <SearchFilters variant="hero" onSearch={() => navigate("/properties")} />
        </div>
      </section>

      {/* Featured Properties */}
      <PropertiesSection />

      {/* About Section */}
      <AboutSection />

      {/* Features */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Why Choose PropertyX?
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Experience the future of real estate with our cutting-edge platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-gold/10 via-secondary to-gold/5 rounded-3xl p-8 lg:p-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of satisfied clients who found their perfect investment with PropertyX.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="gold" size="lg" onClick={() => navigate("/auth?mode=signup")}>
                Create Free Account
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/chat")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Try PropertyX Chat
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
    </Layout>
  );
}
