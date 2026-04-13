/**
 * Filter Bar Component
 * Dynamic filters for property listings
 */

import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  propertyType: string;
  onTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  bedrooms: string;
  onBedroomsChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  onReset: () => void;
}

const FilterBar = ({
  searchQuery, onSearchChange,
  propertyType, onTypeChange,
  status, onStatusChange,
  bedrooms, onBedroomsChange,
  priceRange, onPriceRangeChange,
  onReset,
}: FilterBarProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-8 shadow-sm">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select value={propertyType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Townhouse">Townhouse</SelectItem>
            <SelectItem value="Penthouse">Penthouse</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Buy & Rent</SelectItem>
            <SelectItem value="Buy">Buy</SelectItem>
            <SelectItem value="Rent">Rent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={bedrooms} onValueChange={onBedroomsChange}>
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Bedrooms</SelectItem>
            <SelectItem value="0">Studio</SelectItem>
            <SelectItem value="1">1 Bedroom</SelectItem>
            <SelectItem value="2">2 Bedrooms</SelectItem>
            <SelectItem value="3">3 Bedrooms</SelectItem>
            <SelectItem value="4">4+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={onPriceRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="0-500000">Under AED 500K</SelectItem>
            <SelectItem value="500000-1000000">AED 500K – 1M</SelectItem>
            <SelectItem value="1000000-3000000">AED 1M – 3M</SelectItem>
            <SelectItem value="3000000-99999999">AED 3M+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
