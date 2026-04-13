import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, Share2, MapPin, Bed, Bath, Square, Calendar, TrendingUp,
  Phone, MessageSquare, GitCompare, CheckCircle2, Car, Trees, Waves,
  Dumbbell, Shield, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";

const amenityIcons: Record<string, any> = {
  Parking: Car, Pool: Waves, Gym: Dumbbell, Security: Shield, Terrace: Trees,
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      setProperty(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Property not found.</p>
          <Button variant="outline" onClick={() => navigate("/properties")}>Browse Properties</Button>
        </div>
      </Layout>
    );
  }

  const images = property.images?.length ? property.images : placeholderImages;
  const amenities = property.amenities || [];
  const isFav = favoriteIds.has(property.id);

  return (
    <Layout>
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNav items={[{ label: "Properties", href: "/properties" }, { label: property.title }]} />
        </div>

        {/* Image Gallery */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img src={images[selectedImage] || images[0]} alt={property.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                {property.featured && <Badge className="bg-gold text-accent-foreground border-0">Featured</Badge>}
                <Badge variant="secondary" className="capitalize backdrop-blur-sm">{property.property_type}</Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" className="rounded-full backdrop-blur-sm" onClick={() => toggleFavorite(property.id)}>
                  <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : ""}`} />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full backdrop-blur-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.slice(1, 5).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all hover:opacity-90 ${selectedImage === idx + 1 ? "ring-2 ring-gold" : ""}`}
                  onClick={() => setSelectedImage(idx + 1)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">{property.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{property.location}</span>
                  {property.year_built && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Built {property.year_built}</span>}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms != null && (
                  <Card className="shadow-card border-0"><CardContent className="p-4 text-center"><Bed className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="font-display text-xl font-bold">{property.bedrooms}</p><p className="text-xs text-muted-foreground">Bedrooms</p></CardContent></Card>
                )}
                {property.bathrooms != null && (
                  <Card className="shadow-card border-0"><CardContent className="p-4 text-center"><Bath className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="font-display text-xl font-bold">{property.bathrooms}</p><p className="text-xs text-muted-foreground">Bathrooms</p></CardContent></Card>
                )}
                {property.area != null && (
                  <Card className="shadow-card border-0"><CardContent className="p-4 text-center"><Square className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="font-display text-xl font-bold">{Number(property.area).toLocaleString()}</p><p className="text-xs text-muted-foreground">Sq Ft</p></CardContent></Card>
                )}
                {property.roi_estimate != null && (
                  <Card className="shadow-card border-0"><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-success mb-1" /><p className="font-display text-xl font-bold text-success">{property.roi_estimate}%</p><p className="text-xs text-muted-foreground">Est. ROI</p></CardContent></Card>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent">Overview</TabsTrigger>
                  <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent">Investment Analysis</TabsTrigger>
                  {amenities.length > 0 && <TabsTrigger value="amenities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent">Amenities</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">{property.description || "No description available."}</p>
                </TabsContent>

                <TabsContent value="analysis" className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="shadow-card border-0"><CardContent className="p-6"><h4 className="font-semibold mb-4">Investment Metrics</h4><div className="space-y-3">
                      {property.roi_estimate != null && <div className="flex justify-between"><span className="text-muted-foreground">Est. Annual ROI</span><span className="font-semibold text-success">{property.roi_estimate}%</span></div>}
                      {property.rental_yield != null && <div className="flex justify-between"><span className="text-muted-foreground">Rental Yield</span><span className="font-semibold">{property.rental_yield}%</span></div>}
                      {property.area && <div className="flex justify-between"><span className="text-muted-foreground">Price/Sq Ft</span><span className="font-semibold">${Math.round(property.price / property.area)}</span></div>}
                    </div></CardContent></Card>
                  </div>
                </TabsContent>

                {amenities.length > 0 && (
                  <TabsContent value="amenities" className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {amenities.map((amenity: string) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div key={amenity} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                            <Icon className="h-5 w-5 text-gold-dark" />
                            <span className="text-sm font-medium">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Asking Price</p>
                    <p className="font-display text-3xl font-bold text-foreground">{formatPrice(property.price)}</p>
                  </div>
                  <div className="space-y-3">
                    <Button variant="gold" className="w-full" size="lg" onClick={() => navigate("/handoff")}>
                      <Phone className="h-4 w-4 mr-2" />Request Callback
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" onClick={() => navigate("/chat")}>
                      <MessageSquare className="h-4 w-4 mr-2" />Ask PropertyX
                    </Button>
                    <Button variant="secondary" className="w-full" size="lg" onClick={() => navigate("/compare")}>
                      <GitCompare className="h-4 w-4 mr-2" />Add to Compare
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
