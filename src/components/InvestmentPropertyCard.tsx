import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/data/propertyData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const typeColors: Record<string, string> = {
  residential: "bg-emerald-500 text-white",
  commercial: "bg-primary text-primary-foreground",
  luxury: "bg-gold text-accent-foreground",
  construction: "bg-amber-500 text-white",
};

const typeLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  luxury: "Luxury",
  construction: "Under Construction",
};

export function InvestmentPropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 border border-border/50 group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            liked ? "bg-destructive/90 text-destructive-foreground" : "bg-card/80 text-muted-foreground hover:bg-card"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <Badge className={`${typeColors[property.type]} border-0 mb-3 text-xs font-semibold`}>
          {typeLabels[property.type]}
        </Badge>

        <h3 className="font-display text-lg font-bold text-foreground mb-1 line-clamp-1">
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{property.location}</span>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between border-t border-border/50 pt-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{property.aiScore}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">AI Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{property.expectedRoi}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Expected ROI</p>
          </div>
          <div className="text-center">
            {property.completionMonths === 0 ? (
              <>
                <p className="text-lg font-bold text-emerald-500">Ready</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Status</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-foreground">{property.completionMonths}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Months</p>
              </>
            )}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-foreground">{property.price}</p>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
