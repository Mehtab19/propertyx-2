/**
 * UAE Property Card Component
 * Displays a single UAE property in a grid
 */

import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { UAEProperty } from '@/data/uaePropertyData';
import { Badge } from '@/components/ui/badge';

interface UAEPropertyCardProps {
  property: UAEProperty;
}

const UAEPropertyCard = ({ property }: UAEPropertyCardProps) => {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Status Badge */}
        <Badge
          className={`absolute top-3 left-3 ${
            property.status === 'Buy'
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent text-accent-foreground'
          }`}
        >
          {property.status === 'Buy' ? 'For Sale' : 'For Rent'}
        </Badge>
        {/* Type Badge */}
        <Badge variant="secondary" className="absolute top-3 right-3">
          {property.type}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <p className="text-xl font-bold text-primary mb-1">{property.priceFormatted}</p>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">{property.title}</h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <span className="text-sm truncate">{property.location}, {property.state}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 pt-4 border-t border-border text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bed`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4" />
            <span>{property.area}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UAEPropertyCard;
