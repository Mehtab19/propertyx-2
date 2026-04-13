import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, CheckCircle2, Home, TrendingUp, Building2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AdvisorType = "property" | "mortgage" | "both";

type UserRole = "buyer" | "investor" | "developer" | "agent";

const roles: { value: UserRole; label: string; icon: any; description: string }[] = [
  {
    value: "buyer",
    label: "Home Buyer",
    icon: Home,
    description: "Looking to purchase a property for personal use",
  },
  {
    value: "investor",
    label: "Investor",
    icon: TrendingUp,
    description: "Seeking investment opportunities with good returns",
  },
  {
    value: "developer",
    label: "Developer",
    icon: Building2,
    description: "Building and selling real estate projects",
  },
  {
    value: "agent",
    label: "Real Estate Agent",
    icon: Users,
    description: "Helping clients buy and sell properties",
  },
];

const propertyTypes = [
  "apartment",
  "villa",
  "townhouse",
  "penthouse",
  "studio",
  "land",
  "commercial",
];

const locations = [
  "Downtown",
  "Suburbs",
  "Waterfront",
  "City Center",
  "Industrial Area",
  "Business District",
];

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as UserRole | null;
  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Buyer/Investor preferences
  const [budget, setBudget] = useState([500000, 2000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState("2");
  
  // Developer/Agent info
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [advisorType, setAdvisorType] = useState<AdvisorType>("property");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleComplete = async () => {
    if (!user || !role) return;

    setIsLoading(true);

    try {
      // Update profile with role
      await supabase
        .from("profiles")
        .update({ role, onboarding_completed: true })
        .eq("id", user.id);

      // Save preferences based on role
      if (role === "buyer") {
        await supabase.from("buyer_preferences").insert([{
          user_id: user.id,
          min_budget: budget[0],
          max_budget: budget[1],
          property_types: selectedTypes as any,
          preferred_locations: selectedLocations,
          min_bedrooms: parseInt(bedrooms),
        }]);
      } else if (role === "investor") {
        await supabase.from("investor_preferences").insert([{
          user_id: user.id,
          investment_range_min: budget[0],
          investment_range_max: budget[1],
          preferred_property_types: selectedTypes as any,
          preferred_locations: selectedLocations,
        }]);
      } else if (role === "developer") {
        await supabase.from("developers").insert([{
          user_id: user.id,
          company_name: companyName,
          license_number: licenseNumber,
        }]);
      } else if (role === "agent") {
        await supabase.from("agents").insert([{
          user_id: user.id,
          agency_name: companyName,
          license_number: licenseNumber,
          areas_covered: selectedLocations,
          advisor_type: advisorType,
        }]);
      }

      toast({ title: "Profile setup complete!" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 bg-secondary">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-gold" : "bg-muted"}`} />
            <div className={`w-16 h-0.5 ${step >= 2 ? "bg-gold" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-gold" : "bg-muted"}`} />
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Welcome to PropertyX
                </h1>
                <p className="text-muted-foreground">
                  Tell us how you'll be using the platform
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <Card
                    key={r.value}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:border-gold/30 ${
                      role === r.value ? "border-gold shadow-gold" : ""
                    }`}
                    onClick={() => handleRoleSelect(r.value)}
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                        <r.icon className="h-6 w-6 text-gold-dark" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1">
                        {r.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {r.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && role && (
            <Card className="animate-fade-in shadow-lg border-0">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit mb-2"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <CardTitle className="font-display text-2xl">
                  {role === "buyer" && "Your Home Preferences"}
                  {role === "investor" && "Investment Criteria"}
                  {role === "developer" && "Developer Profile"}
                  {role === "agent" && "Agent Profile"}
                </CardTitle>
                <CardDescription>
                  Help us personalize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buyer/Investor Preferences */}
                {(role === "buyer" || role === "investor") && (
                  <>
                    {/* Budget Range */}
                    <div className="space-y-4">
                      <Label>
                        {role === "buyer" ? "Budget Range" : "Investment Range"}
                      </Label>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(budget[0])}</span>
                        <span>{formatCurrency(budget[1])}</span>
                      </div>
                      <Slider
                        value={budget}
                        onValueChange={setBudget}
                        min={100000}
                        max={10000000}
                        step={50000}
                        className="py-4"
                      />
                    </div>

                    {/* Property Types */}
                    <div className="space-y-3">
                      <Label>Preferred Property Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map((type) => (
                          <Badge
                            key={type}
                            variant={selectedTypes.includes(type) ? "default" : "outline"}
                            className={`cursor-pointer capitalize ${
                              selectedTypes.includes(type)
                                ? "bg-gold text-accent-foreground hover:bg-gold-dark"
                                : "hover:bg-secondary"
                            }`}
                            onClick={() => {
                              setSelectedTypes(
                                selectedTypes.includes(type)
                                  ? selectedTypes.filter((t) => t !== type)
                                  : [...selectedTypes, type]
                              );
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-3">
                      <Label>Preferred Locations</Label>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((loc) => (
                          <Badge
                            key={loc}
                            variant={selectedLocations.includes(loc) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedLocations.includes(loc)
                                ? "bg-gold text-accent-foreground hover:bg-gold-dark"
                                : "hover:bg-secondary"
                            }`}
                            onClick={() => {
                              setSelectedLocations(
                                selectedLocations.includes(loc)
                                  ? selectedLocations.filter((l) => l !== loc)
                                  : [...selectedLocations, loc]
                              );
                            }}
                          >
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bedrooms (Buyer only) */}
                    {role === "buyer" && (
                      <div className="space-y-2">
                        <Label>Minimum Bedrooms</Label>
                        <Select value={bedrooms} onValueChange={setBedrooms}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}+ Bedrooms
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {/* Developer/Agent Profile */}
                {(role === "developer" || role === "agent") && (
                  <>
                    <div className="space-y-2">
                      <Label>
                        {role === "developer" ? "Company Name" : "Agency Name"}
                      </Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={
                          role === "developer"
                            ? "Your Development Company"
                            : "Your Real Estate Agency"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>License Number (Optional)</Label>
                      <Input
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="REA-XXXXXX"
                      />
                    </div>

                    {role === "agent" && (
                      <>
                        <div className="space-y-3">
                          <Label>Advisor Type</Label>
                          <RadioGroup
                            value={advisorType}
                            onValueChange={(v) => setAdvisorType(v as AdvisorType)}
                            className="grid gap-3"
                          >
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                              <RadioGroupItem value="property" />
                              <div>
                                <p className="font-medium text-sm text-foreground">Property Advisor</p>
                                <p className="text-xs text-muted-foreground">Help clients buy, sell, and rent properties</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                              <RadioGroupItem value="mortgage" />
                              <div>
                                <p className="font-medium text-sm text-foreground">Mortgage & Leasing Advisor</p>
                                <p className="text-xs text-muted-foreground">Specialize in financing, mortgages, and leasing solutions</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                              <RadioGroupItem value="both" />
                              <div>
                                <p className="font-medium text-sm text-foreground">Both – Property & Mortgage</p>
                                <p className="text-xs text-muted-foreground">Full-service advisor covering property and financing</p>
                              </div>
                            </label>
                          </RadioGroup>
                        </div>

                        <div className="space-y-3">
                          <Label>Areas Covered</Label>
                          <div className="flex flex-wrap gap-2">
                            {locations.map((loc) => (
                              <Badge
                                key={loc}
                                variant={selectedLocations.includes(loc) ? "default" : "outline"}
                                className={`cursor-pointer ${
                                  selectedLocations.includes(loc)
                                    ? "bg-gold text-accent-foreground hover:bg-gold-dark"
                                    : "hover:bg-secondary"
                                }`}
                                onClick={() => {
                                  setSelectedLocations(
                                    selectedLocations.includes(loc)
                                      ? selectedLocations.filter((l) => l !== loc)
                                      : [...selectedLocations, loc]
                                  );
                                }}
                              >
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <Button
                  variant="gold"
                  className="w-full"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
