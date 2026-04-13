import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import {
  Menu,
  X,
  Search,
  Home,
  Building2,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  PieChart,
  ChevronDown,
  Calculator,
  GitCompare,
  PlusCircle,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "buyer" | "investor" | "developer" | "agent" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Properties", href: "/properties", icon: <Home className="h-4 w-4" /> },
  { label: "Saved", href: "/saved", icon: <Heart className="h-4 w-4" /> },
  { label: "Investment Advisor", href: "/chat", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Compare", href: "/compare", icon: <GitCompare className="h-4 w-4" /> },
  { label: "Mortgage Hub", href: "/mortgage", icon: <Calculator className="h-4 w-4" /> },
];

const roleNavItems: NavItem[] = [
  { label: "Portfolio", href: "/portfolio", icon: <PieChart className="h-4 w-4" />, roles: ["investor", "buyer"] },
  { label: "Submit Listing", href: "/submit-listing", icon: <PlusCircle className="h-4 w-4" />, roles: ["developer", "agent"] },
  { label: "My Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["buyer", "investor", "developer", "agent"] },
  { label: "Admin Console", href: "/admin", icon: <Settings className="h-4 w-4" />, roles: ["admin"] },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const userRole = profile?.role as UserRole | undefined;

  const filteredRoleItems = roleNavItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const isLanding = location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isLanding
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-1">
              <Building2
                className={`h-7 w-7 transition-colors ${
                  isScrolled || !isLanding ? "text-primary" : "text-primary-foreground"
                }`}
              />
              <span
                className={`font-display text-xl font-bold transition-colors ${
                  isScrolled || !isLanding ? "text-foreground" : "text-primary-foreground"
                }`}
              >
                PrimeX Estate
              </span>
            </div>
            <span
              className={`hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                isScrolled || !isLanding
                  ? "bg-gold/10 text-gold-dark"
                  : "bg-primary-foreground/20 text-primary-foreground"
              }`}
            >
              PropertyX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-secondary ${
                  location.pathname === item.href
                    ? "bg-secondary text-foreground"
                    : isScrolled || !isLanding
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`hidden lg:flex ${
                isScrolled || !isLanding
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
              onClick={() => navigate("/properties")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 ${
                      isScrolled || !isLanding
                        ? ""
                        : "text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gold text-accent-foreground text-sm">
                        {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {profile?.full_name || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {userRole && (
                      <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gold/10 text-gold-dark capitalize">
                        {userRole}
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {filteredRoleItems.map((item) => (
                    <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant={isScrolled || !isLanding ? "ghost" : "hero-outline"}
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  variant={isScrolled || !isLanding ? "gold" : "hero-outline"}
                  size="sm"
                  onClick={() => navigate("/auth?mode=signup")}
                  className="hidden sm:inline-flex"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden ${
                    isScrolled || !isLanding
                      ? ""
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="font-display">PrimeX Estate</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === item.href
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <div className="h-px bg-border my-2" />
                      {filteredRoleItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            location.pathname === item.href
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
