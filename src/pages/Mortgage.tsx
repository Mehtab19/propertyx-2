import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Calculator, Building2, Percent, Clock, CreditCard,
  Phone, Mail, Globe, Star, User, Landmark, Shield,
  ChevronRight, Package, Home, ArrowRight, PhoneCall, Send,
  BarChart3, X,
} from "lucide-react";
import { Link } from "react-router-dom";

interface BankPackage {
  name: string;
  rate: string;
  details: string;
}

interface Bank {
  id: string;
  name: string;
  financing_type: "commercial" | "islamic" | "both";
  interest_rate_min: number | null;
  interest_rate_max: number | null;
  max_loan_amount: number | null;
  max_tenure_years: number | null;
  processing_fee: number | null;
  features: string[] | null;
  description: string | null;
  packages: BankPackage[] | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  logo_url: string | null;
}

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  property_type: string;
  images: string[] | null;
}

// Sample advisors shown when no DB advisors exist
const SAMPLE_ADVISORS = [
  {
    id: "sample-1",
    name: "Ahmed Al Maktoum",
    company: "PrimeX Mortgage Advisory",
    type: "Mortgage & Leasing Advisor",
    bio: "15+ years in UAE mortgage advisory. Certified by RERA and Central Bank of UAE. Specialized in Islamic & conventional financing for luxury properties.",
    specializations: ["Islamic Finance", "Luxury Properties", "Off-Plan"],
    rating: 4.9,
    phone: "+971-50-123-4567",
    email: "ahmed.mortgage@primex.ae",
    areas: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
  },
  {
    id: "sample-2",
    name: "Sarah Hassan",
    company: "Gulf Finance Consultants",
    type: "Mortgage Advisor",
    bio: "Expert in securing the best mortgage rates for first-time buyers and investors. Partnered with 12+ UAE banks.",
    specializations: ["First-Time Buyers", "Investment Properties", "Rate Negotiation"],
    rating: 4.8,
    phone: "+971-55-987-6543",
    email: "sarah@gulffinance.ae",
    areas: ["JBR", "Business Bay", "JVC"],
  },
  {
    id: "sample-3",
    name: "Omar Rashid",
    company: "Emirates Leasing Solutions",
    type: "Leasing Advisor",
    bio: "Specialized in commercial and residential leasing solutions. Certified lease consultant with 10+ years of experience in UAE real estate.",
    specializations: ["Commercial Leasing", "Rent-to-Own", "Corporate Housing"],
    rating: 4.7,
    phone: "+971-52-456-7890",
    email: "omar@emiratesleasing.ae",
    areas: ["DIFC", "Sheikh Zayed Road", "Al Quoz"],
  },
  {
    id: "sample-4",
    name: "Fatima Al Zaabi",
    company: "Amlak Mortgage Advisory",
    type: "Property & Mortgage Advisor",
    bio: "Dual-certified property and mortgage advisor. Helps clients find the right property AND the best financing — all in one place.",
    specializations: ["End-to-End Service", "Expat Mortgages", "Refinancing"],
    rating: 4.9,
    phone: "+971-56-321-0987",
    email: "fatima@amlakmortgage.ae",
    areas: ["Arabian Ranches", "Dubai Hills", "Damac Hills"],
  },
  {
    id: "sample-5",
    name: "Khalid bin Saeed",
    company: "Dar Al Tamweel",
    type: "Islamic Finance Specialist",
    bio: "Sharia-compliant financing expert with deep knowledge of Ijarah, Murabaha, and Diminishing Musharaka structures.",
    specializations: ["Islamic Mortgages", "Sharia Compliance", "Developer Financing"],
    rating: 4.6,
    phone: "+971-54-789-0123",
    email: "khalid@daraltamweel.ae",
    areas: ["Sharjah", "Ajman", "Abu Dhabi"],
  },
  {
    id: "sample-6",
    name: "Nadia Sharma",
    company: "HomeKey Financial",
    type: "Mortgage & Leasing Advisor",
    bio: "Award-winning mortgage consultant recognized by Arabian Business. Fluent in English, Hindi, and Arabic.",
    specializations: ["NRI Mortgages", "Golden Visa Properties", "Lease-to-Own"],
    rating: 4.8,
    phone: "+971-58-654-3210",
    email: "nadia@homekeyfinancial.ae",
    areas: ["Dubai South", "Town Square", "Motor City"],
  },
];

export default function Mortgage() {
  const { toast } = useToast();
  const [price, setPrice] = useState(1500000);
  const [downPayment, setDownPayment] = useState(25);
  const [rate, setRate] = useState(4.5);
  const [tenure, setTenure] = useState(25);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [dbAgents, setDbAgents] = useState<any[]>([]);
  const [bankFilter, setBankFilter] = useState<"all" | "commercial" | "islamic">("all");
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [recommendedProps, setRecommendedProps] = useState<Property[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Callback form
  const [cbName, setCbName] = useState("");
  const [cbEmail, setCbEmail] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  const [cbMessage, setCbMessage] = useState("");
  const [cbSubmitting, setCbSubmitting] = useState(false);

  // Pre-qualification form
  const [pqName, setPqName] = useState("");
  const [pqEmail, setPqEmail] = useState("");
  const [pqPhone, setPqPhone] = useState("");
  const [pqEmployment, setPqEmployment] = useState("");
  const [pqIncome, setPqIncome] = useState(0);
  const [pqObligations, setPqObligations] = useState(0);
  const [pqYearsEmployed, setPqYearsEmployed] = useState(0);
  const [pqCreditScore, setPqCreditScore] = useState("");
  const [pqFinancingPref, setPqFinancingPref] = useState("any");
  const [pqPropertyValue, setPqPropertyValue] = useState(0);
  const [pqSubmitting, setPqSubmitting] = useState(false);
  const [pqResults, setPqResults] = useState<{
    eligible: boolean;
    summary: string;
    maxAffordable: number;
    dbr: number;
    maxEmi: number;
    matchedBanks: { bank: Bank; estMonthly: number; reason: string }[];
  } | null>(null);

  useEffect(() => {
    supabase.from("partner_banks").select("*").then(({ data }) => {
      if (data) setBanks(data as unknown as Bank[]);
    });
    supabase
      .from("agents")
      .select("*, profiles(full_name, email)")
      .in("advisor_type", ["mortgage", "both"])
      .then(({ data }) => {
        if (data) setDbAgents(data);
      });
  }, []);

  const loanAmount = price * (1 - downPayment / 100);
  const monthlyRate = rate / 100 / 12;
  const numPayments = tenure * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments;
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);

  const filteredBanks = banks.filter((b) =>
    bankFilter === "all" ? true : b.financing_type === bankFilter || b.financing_type === "both"
  );

  const advisors = dbAgents.length > 0
    ? dbAgents.map((a) => ({
        id: a.id,
        name: a.profiles?.full_name || a.agency_name || "Advisor",
        company: a.company_name || a.agency_name || "",
        type: a.advisor_type === "both" ? "Property & Mortgage Advisor" : `${a.advisor_type} Advisor`,
        bio: a.bio || "",
        specializations: a.specializations || [],
        rating: a.rating || 0,
        phone: a.contact_phone || "",
        email: a.contact_email || a.profiles?.email || "",
        areas: a.areas_covered || [],
      }))
    : SAMPLE_ADVISORS;

  // Find properties in budget
  const handleFindProperties = async () => {
    const budget = price;
    const minBudget = budget * 0.7;
    const maxBudget = budget * 1.1;
    const { data } = await supabase
      .from("properties")
      .select("id, title, price, location, bedrooms, bathrooms, area, property_type, images")
      .gte("price", minBudget)
      .lte("price", maxBudget)
      .eq("status", "available")
      .order("price", { ascending: true })
      .limit(6);
    setRecommendedProps((data as Property[]) || []);
    setShowRecommendations(true);
  };

  // Pre-qualification logic
  const handlePreQualify = async () => {
    if (!pqName || !pqEmail || !pqEmployment || !pqIncome) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setPqSubmitting(true);
    const dbrLimit = 0.5; // UAE Central Bank DBR cap ~50%
    const currentDbr = pqIncome > 0 ? (pqObligations / pqIncome) * 100 : 0;
    const availableForEmi = pqIncome * dbrLimit - pqObligations;
    const maxEmi = Math.max(availableForEmi, 0);
    // Estimate max property from max EMI (25yr, avg 4.5%)
    const estRate = 4.5 / 100 / 12;
    const estN = 25 * 12;
    const maxLoan = maxEmi > 0 ? (maxEmi * (Math.pow(1 + estRate, estN) - 1)) / (estRate * Math.pow(1 + estRate, estN)) : 0;
    const maxAffordable = maxLoan / 0.75; // assume 25% down payment
    const eligible = currentDbr < 50 && maxEmi > 0 && pqYearsEmployed >= 1;

    // Match banks
    const propVal = pqPropertyValue || maxAffordable;
    const loanNeeded = propVal * 0.75;
    const matched = banks
      .filter((b) => {
        if (pqFinancingPref !== "any" && b.financing_type !== pqFinancingPref && b.financing_type !== "both") return false;
        if (b.max_loan_amount && loanNeeded > b.max_loan_amount) return false;
        return true;
      })
      .map((b) => {
        const r = (b.interest_rate_min || 4.5) / 100 / 12;
        const n = (b.max_tenure_years || 25) * 12;
        const emi = r > 0 ? (loanNeeded * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanNeeded / n;
        const reasons: string[] = [];
        if (b.interest_rate_min && b.interest_rate_min <= 4) reasons.push("Competitive rate");
        if (b.max_tenure_years && b.max_tenure_years >= 25) reasons.push("Long tenure available");
        if (b.processing_fee != null && b.processing_fee <= 1) reasons.push("Low fees");
        return { bank: b, estMonthly: emi, reason: reasons.join(" · ") || "Matches your profile" };
      })
      .sort((a, b) => a.estMonthly - b.estMonthly)
      .slice(0, 4);

    const summary = eligible
      ? `Based on your income of AED ${pqIncome.toLocaleString()}/mo and existing obligations, you can afford up to ${fmt(maxAffordable)} in property value with a DBR of ${currentDbr.toFixed(1)}%.`
      : `Your current debt-to-burden ratio is ${currentDbr.toFixed(1)}%, which ${currentDbr >= 50 ? "exceeds" : "is near"} the 50% limit. Consider reducing obligations or increasing income.`;

    setPqResults({ eligible, summary, maxAffordable, dbr: Math.round(currentDbr * 10) / 10, maxEmi, matchedBanks: matched });

    // Save as lead
    await supabase.from("leads").insert({
      name: pqName,
      email: pqEmail,
      phone: pqPhone || null,
      message: `Pre-qualification: Income AED ${pqIncome}/mo, Employment: ${pqEmployment}, Credit: ${pqCreditScore || "N/A"}, Target: ${pqPropertyValue ? fmt(pqPropertyValue) : "Not specified"}`,
      source: "mortgage_prequalification",
    });
    setPqSubmitting(false);
  };

  // Submit callback request
  const handleCallback = async () => {
    if (!cbName || !cbEmail) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }
    setCbSubmitting(true);
    const { error } = await supabase.from("leads").insert({
      name: cbName,
      email: cbEmail,
      phone: cbPhone || null,
      message: cbMessage || `Mortgage inquiry – Budget: ${fmt(price)}, Down Payment: ${downPayment}%, Tenure: ${tenure}yrs`,
      source: "mortgage_hub",
    });
    setCbSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Callback requested!", description: "An advisor will contact you shortly." });
      setCbName(""); setCbEmail(""); setCbPhone(""); setCbMessage("");
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Mortgage & Leasing Hub" }]} />
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="h-8 w-8 text-gold" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Mortgage & Leasing Hub</h1>
              <p className="text-muted-foreground">Calculate payments, explore financing, and connect with advisors</p>
            </div>
          </div>

          {/* ─── Calculator + Results ─── */}
          <div className="grid lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Mortgage Calculator</h2>
              <div className="space-y-4">
                <div>
                  <Label>Property Price</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground mt-1">{fmt(price)}</p>
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label>Down Payment</Label>
                    <span className="text-sm font-medium text-gold-dark">{downPayment}% ({fmt(price * downPayment / 100)})</span>
                  </div>
                  <Slider value={[downPayment]} onValueChange={([v]) => setDownPayment(v)} min={5} max={80} step={1} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label>Interest Rate</Label>
                    <span className="text-sm font-medium text-gold-dark">{rate}%</span>
                  </div>
                  <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={1} max={10} step={0.1} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label>Tenure (Years)</Label>
                    <span className="text-sm font-medium text-gold-dark">{tenure} years</span>
                  </div>
                  <Slider value={[tenure]} onValueChange={([v]) => setTenure(v)} min={1} max={30} step={1} className="mt-2" />
                </div>
              </div>

              <Button onClick={handleFindProperties} className="w-full mt-4" size="lg">
                <Home className="h-4 w-4 mr-2" /> Find Properties in My Budget
              </Button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <p className="text-sm opacity-80 mb-1">Monthly Payment</p>
                <p className="font-display text-3xl font-bold">{fmt(monthlyPayment)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <CreditCard className="h-5 w-5 text-gold mb-2" />
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="font-semibold text-foreground">{fmt(loanAmount)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <Percent className="h-5 w-5 text-gold mb-2" />
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="font-semibold text-foreground">{fmt(totalInterest)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <Building2 className="h-5 w-5 text-gold mb-2" />
                  <p className="text-xs text-muted-foreground">Total Payment</p>
                  <p className="font-semibold text-foreground">{fmt(totalPayment)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <Clock className="h-5 w-5 text-gold mb-2" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold text-foreground">{numPayments} months</p>
                </div>
              </div>

              {/* Callback CTA */}
              <div className="bg-accent/30 border border-accent rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneCall className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground text-sm">Need Expert Guidance?</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Get a free consultation with a certified mortgage advisor.</p>
                <a href="#callback-form">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Request a Callback <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* ─── Recommended Properties ─── */}
          {showRecommendations && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-6 w-6 text-gold" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Properties in Your Budget ({fmt(price * 0.7)} – {fmt(price * 1.1)})
                </h2>
              </div>
              {recommendedProps.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProps.map((p) => (
                    <Link
                      key={p.id}
                      to={`/property/${p.id}`}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Building2 className="h-10 w-10 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-foreground text-sm truncate">{p.title}</p>
                        <p className="text-primary font-bold">{fmt(p.price)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{p.location}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                          {p.bedrooms != null && <span>{p.bedrooms} Beds</span>}
                          {p.bathrooms != null && <span>{p.bathrooms} Baths</span>}
                          {p.area != null && <span>{p.area} sqft</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-card border border-border rounded-xl">
                  <Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No properties found in this budget range.</p>
                  <Link to="/properties" className="text-primary text-sm hover:underline mt-1 inline-block">
                    Browse all properties →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ─── Mortgage Comparison Tool ─── */}
          {banks.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-7 w-7 text-gold" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Compare Financing Offers</h2>
                  <p className="text-muted-foreground text-sm">Select banks below to compare side by side</p>
                </div>
              </div>

              {compareIds.length >= 2 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-foreground">
                      Comparing {compareIds.length} banks
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  </div>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Feature</TableHead>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableHead key={id} className="text-center font-semibold min-w-[160px]">{b?.name}</TableHead>;
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Type</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableCell key={id} className="text-center capitalize">{b?.financing_type === "both" ? "Commercial & Islamic" : b?.financing_type}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Interest Rate</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableCell key={id} className="text-center font-semibold text-primary">{b?.interest_rate_min}% – {b?.interest_rate_max}%</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Max Loan</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableCell key={id} className="text-center">{b?.max_loan_amount ? fmt(b.max_loan_amount) : "—"}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Max Tenure</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableCell key={id} className="text-center">{b?.max_tenure_years ? `${b.max_tenure_years} yrs` : "—"}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Processing Fee</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            return <TableCell key={id} className="text-center">{b?.processing_fee != null ? `${b.processing_fee}%` : "—"}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Monthly (est.)</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            const r = (b?.interest_rate_min || rate) / 100 / 12;
                            const n = (b?.max_tenure_years || tenure) * 12;
                            const mp = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
                            return <TableCell key={id} className="text-center font-semibold">{fmt(mp)}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">Packages</TableCell>
                          {compareIds.map((id) => {
                            const b = banks.find((bk) => bk.id === id);
                            const pkgs = (b?.packages as BankPackage[]) || [];
                            return <TableCell key={id} className="text-center">{pkgs.length > 0 ? pkgs.map(p => p.name).join(", ") : "—"}</TableCell>;
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {compareIds.length < 2 && compareIds.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">Select at least one more bank to compare.</p>
              )}
            </div>
          )}

          {/* ─── Financing Partners ─── */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Landmark className="h-7 w-7 text-gold" />
              <h2 className="font-display text-2xl font-bold text-foreground">Financing Partners</h2>
            </div>

            <Tabs value={bankFilter} onValueChange={(v) => setBankFilter(v as typeof bankFilter)} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Partners</TabsTrigger>
                <TabsTrigger value="commercial"><Building2 className="h-4 w-4 mr-1" /> Commercial</TabsTrigger>
                <TabsTrigger value="islamic"><Shield className="h-4 w-4 mr-1" /> Islamic</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredBanks.map((bank) => (
                <div key={bank.id} className={`bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow ${compareIds.includes(bank.id) ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={compareIds.includes(bank.id)}
                          onCheckedChange={(checked) => {
                            setCompareIds(checked
                              ? [...compareIds, bank.id]
                              : compareIds.filter((id) => id !== bank.id)
                            );
                          }}
                          className="mt-1"
                        />
                        <div>
                          <h3 className="font-display text-lg font-semibold text-foreground">{bank.name}</h3>
                          <Badge variant="secondary" className="mt-1 capitalize">
                            {bank.financing_type === "both" ? "Commercial & Islamic" : bank.financing_type}
                          </Badge>
                        </div>
                      </div>
                      {bank.interest_rate_min && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-xl font-bold text-primary">{bank.interest_rate_min}%</p>
                        </div>
                      )}
                    </div>
                    {bank.description && <p className="text-sm text-muted-foreground mb-4">{bank.description}</p>}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                      {bank.max_loan_amount && (
                        <div><p className="text-muted-foreground text-xs">Max Loan</p><p className="font-medium text-foreground">{fmt(bank.max_loan_amount)}</p></div>
                      )}
                      {bank.max_tenure_years && (
                        <div><p className="text-muted-foreground text-xs">Max Tenure</p><p className="font-medium text-foreground">{bank.max_tenure_years} yrs</p></div>
                      )}
                      {bank.processing_fee != null && (
                        <div><p className="text-muted-foreground text-xs">Processing Fee</p><p className="font-medium text-foreground">{bank.processing_fee}%</p></div>
                      )}
                    </div>
                    {bank.features && bank.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bank.features.map((f) => (
                          <span key={f} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{f}</span>
                        ))}
                      </div>
                    )}
                    {bank.packages && (bank.packages as BankPackage[]).length > 0 && (
                      <div>
                        <button onClick={() => setExpandedBank(expandedBank === bank.id ? null : bank.id)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline mb-2">
                          <Package className="h-4 w-4" />
                          {(bank.packages as BankPackage[]).length} Package{(bank.packages as BankPackage[]).length > 1 ? "s" : ""} Available
                          <ChevronRight className={`h-4 w-4 transition-transform ${expandedBank === bank.id ? "rotate-90" : ""}`} />
                        </button>
                        {expandedBank === bank.id && (
                          <div className="space-y-2 mt-2">
                            {(bank.packages as BankPackage[]).map((pkg, i) => (
                              <div key={i} className="bg-muted/50 rounded-lg p-3 border border-border">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-medium text-sm text-foreground">{pkg.name}</p>
                                  <Badge variant="outline" className="text-xs">{pkg.rate}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{pkg.details}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center gap-3 flex-wrap">
                    {bank.contact_phone && (
                      <a href={`tel:${bank.contact_phone}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" /> {bank.contact_phone}
                      </a>
                    )}
                    {bank.contact_email && (
                      <a href={`mailto:${bank.contact_email}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </a>
                    )}
                    {bank.website && (
                      <a href={bank.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                        <Globe className="h-3.5 w-3.5" /> Visit Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredBanks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No financing partners found for this category.</p>
              </div>
            )}
          </div>

          {/* ─── Mortgage & Leasing Advisors ─── */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-7 w-7 text-gold" />
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Certified Mortgage & Leasing Advisors</h2>
                <p className="text-muted-foreground text-sm">Connect with experts for personalized financing guidance</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {advisors.map((advisor) => (
                <div key={advisor.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {advisor.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{advisor.name}</h3>
                      {advisor.company && <p className="text-xs text-muted-foreground">{advisor.company}</p>}
                      <Badge variant="secondary" className="mt-1 text-xs">{advisor.type}</Badge>
                    </div>
                  </div>

                  {advisor.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{advisor.bio}</p>}

                  {advisor.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      <span className="text-sm font-medium text-foreground">{advisor.rating}</span>
                    </div>
                  )}

                  {advisor.specializations && advisor.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {advisor.specializations.map((s) => (
                        <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{s}</span>
                      ))}
                    </div>
                  )}

                  {advisor.areas && advisor.areas.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium">Areas:</span> {advisor.areas.join(", ")}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                    {advisor.phone && (
                      <a href={`tel:${advisor.phone}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Phone className="h-3.5 w-3.5 mr-1" /> Call
                        </Button>
                      </a>
                    )}
                    <a href={`mailto:${advisor.email}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        <Mail className="h-3.5 w-3.5 mr-1" /> Contact
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Pre-Qualification Form ─── */}
          <div id="prequalify" className="mb-12 scroll-mt-24">
            <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-7 w-7 text-gold" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Mortgage Pre-Qualification</h2>
                  <p className="text-muted-foreground text-sm">Submit your financial details to get matched with the best financing options</p>
                </div>
              </div>

              {!pqResults ? (
                <div className="mt-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={pqName} onChange={(e) => setPqName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={pqEmail} onChange={(e) => setPqEmail(e.target.value)} placeholder="you@email.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={pqPhone} onChange={(e) => setPqPhone(e.target.value)} placeholder="+971-XX-XXX-XXXX" />
                    </div>
                    <div>
                      <Label>Employment Status *</Label>
                      <select
                        value={pqEmployment}
                        onChange={(e) => setPqEmployment(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select...</option>
                        <option value="salaried">Salaried Employee</option>
                        <option value="self_employed">Self-Employed / Business Owner</option>
                        <option value="freelancer">Freelancer / Contractor</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Monthly Income (AED) *</Label>
                      <Input type="number" value={pqIncome || ""} onChange={(e) => setPqIncome(Number(e.target.value))} placeholder="e.g. 25000" />
                    </div>
                    <div>
                      <Label>Monthly Obligations (AED)</Label>
                      <Input type="number" value={pqObligations || ""} onChange={(e) => setPqObligations(Number(e.target.value))} placeholder="Existing EMIs, rent..." />
                      <p className="text-xs text-muted-foreground mt-1">Loans, cards, rent etc.</p>
                    </div>
                    <div>
                      <Label>Years of Employment *</Label>
                      <Input type="number" value={pqYearsEmployed || ""} onChange={(e) => setPqYearsEmployed(Number(e.target.value))} placeholder="e.g. 5" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Credit Score (estimated)</Label>
                      <select
                        value={pqCreditScore}
                        onChange={(e) => setPqCreditScore(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select range...</option>
                        <option value="excellent">Excellent (750+)</option>
                        <option value="good">Good (700–749)</option>
                        <option value="fair">Fair (650–699)</option>
                        <option value="poor">Below Average (&lt;650)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Preferred Financing</Label>
                      <select
                        value={pqFinancingPref}
                        onChange={(e) => setPqFinancingPref(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="any">No Preference</option>
                        <option value="commercial">Commercial / Conventional</option>
                        <option value="islamic">Islamic (Sharia-Compliant)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Desired Property Value (AED)</Label>
                    <Input type="number" value={pqPropertyValue || ""} onChange={(e) => setPqPropertyValue(Number(e.target.value))} placeholder="e.g. 1500000" />
                  </div>

                  <Button onClick={handlePreQualify} disabled={pqSubmitting} className="w-full" size="lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {pqSubmitting ? "Analyzing…" : "Check My Pre-Qualification"}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {/* Eligibility summary */}
                  <div className={`rounded-xl p-5 border ${pqResults.eligible ? "bg-accent/30 border-accent" : "bg-secondary border-border"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {pqResults.eligible ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-gold" />
                      )}
                      <h3 className="font-semibold text-foreground">
                        {pqResults.eligible ? "You're Pre-Qualified!" : "Limited Eligibility"}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{pqResults.summary}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground">Max Affordable</p>
                        <p className="font-bold text-foreground">{fmt(pqResults.maxAffordable)}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground">DBR</p>
                        <p className="font-bold text-foreground">{pqResults.dbr}%</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground">Max EMI</p>
                        <p className="font-bold text-foreground">{fmt(pqResults.maxEmi)}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground">Risk Level</p>
                        <p className="font-bold text-foreground capitalize">{pqCreditScore || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Matched banks */}
                  {pqResults.matchedBanks.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-gold" /> Best Matched Financing Partners ({pqResults.matchedBanks.length})
                      </h3>
                      <div className="space-y-3">
                        {pqResults.matchedBanks.map((mb: { bank: Bank; estMonthly: number; reason: string }) => (
                          <div key={mb.bank.id} className="flex items-center justify-between bg-muted/50 border border-border rounded-xl p-4">
                            <div>
                              <p className="font-semibold text-foreground">{mb.bank.name}</p>
                              <p className="text-xs text-muted-foreground">{mb.reason}</p>
                              <Badge variant="secondary" className="mt-1 text-xs capitalize">{mb.bank.financing_type === "both" ? "Commercial & Islamic" : mb.bank.financing_type}</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Est. Monthly</p>
                              <p className="font-bold text-primary">{fmt(mb.estMonthly)}</p>
                              <p className="text-xs text-muted-foreground">from {mb.bank.interest_rate_min}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPqResults(null)} className="flex-1">
                      Recalculate
                    </Button>
                    <a href="#callback-form" className="flex-1">
                      <Button className="w-full">
                        <PhoneCall className="h-4 w-4 mr-2" /> Talk to an Advisor
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Callback / Advisory Request Form ─── */}
          <div id="callback-form" className="scroll-mt-24">
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <PhoneCall className="h-7 w-7 text-gold" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Request a Callback</h2>
                  <p className="text-muted-foreground text-sm">Fill in your details and a certified advisor will contact you</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={cbName} onChange={(e) => setCbName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={cbEmail} onChange={(e) => setCbEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={cbPhone} onChange={(e) => setCbPhone(e.target.value)} placeholder="+971-XX-XXX-XXXX" />
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input value={fmt(price)} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="mb-4">
                <Label>Message (optional)</Label>
                <Textarea
                  value={cbMessage}
                  onChange={(e) => setCbMessage(e.target.value)}
                  placeholder="Tell us about your financing needs — property type, preferred tenure, Islamic or conventional financing, etc."
                  rows={3}
                />
              </div>
              <Button onClick={handleCallback} disabled={cbSubmitting} className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                {cbSubmitting ? "Submitting…" : "Request Callback"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                By submitting, you agree to be contacted by our certified advisors regarding your inquiry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
