import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, TrendingUp } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrl?: string;
  propertyType: string;
  featured?: boolean;
  roiEstimate?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function PropertyCard({
  id, title, location, price, bedrooms, bathrooms, area,
  imageUrl, propertyType, featured, roiEstimate, isFavorite, onToggleFavorite,
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`;
    return `AED ${(price / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 border-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {featured && <Badge className="bg-gold text-accent-foreground border-0">Featured</Badge>}
          <Badge variant="secondary" className="capitalize backdrop-blur-sm">{propertyType}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm transition-all ${
            isFavorite ? "bg-destructive/90 text-destructive-foreground" : "bg-card/80 text-muted-foreground hover:bg-card"
          }`}
          onClick={(e) => { e.preventDefault(); onToggleFavorite?.(); }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
        <div className="absolute bottom-3 left-3">
          <p className="text-2xl font-display font-bold text-primary-foreground">{formatPrice(price)}</p>
        </div>
        {roiEstimate && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-success text-success-foreground border-0 gap-1">
              <TrendingUp className="h-3 w-3" />{roiEstimate}% ROI
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Link to={`/property/${id}`}>
          <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 mb-2">{title}</h3>
        </Link>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1"><Bed className="h-4 w-4" /><span>{bedrooms}</span></div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1"><Bath className="h-4 w-4" /><span>{bathrooms}</span></div>
          )}
          {area !== undefined && area !== null && (
            <div className="flex items-center gap-1"><Square className="h-4 w-4" /><span>{area} sqft</span></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
