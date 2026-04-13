import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";

export default function SavedProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      const { data: favs } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("user_id", user.id);

      if (favs && favs.length > 0) {
        const ids = favs.map(f => f.property_id);
        const { data } = await supabase
          .from("properties")
          .select("*")
          .in("id", ids);
        setProperties(data || []);
      } else {
        setProperties([]);
      }
      setLoading(false);
    };
    fetch();
  }, [user, favoriteIds]);

  if (!user) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view saved properties</h2>
            <p className="text-muted-foreground mb-6">Save your favorite properties and access them anytime.</p>
            <Button variant="gold" onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Saved Properties" }]} />
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-destructive" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Saved Properties</h1>
              <p className="text-muted-foreground">{properties.length} saved {properties.length === 1 ? "property" : "properties"}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved properties yet</h3>
              <p className="text-muted-foreground mb-6">Browse listings and tap the heart icon to save properties.</p>
              <Button variant="gold" onClick={() => navigate("/properties")}>Browse Properties</Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  location={p.location}
                  price={p.price}
                  bedrooms={p.bedrooms}
                  bathrooms={p.bathrooms}
                  area={p.area}
                  imageUrl={p.images?.[0]}
                  propertyType={p.property_type}
                  featured={p.featured}
                  roiEstimate={p.roi_estimate}
                  isFavorite={favoriteIds.has(p.id)}
                  onToggleFavorite={() => toggleFavorite(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
