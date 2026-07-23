import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, X } from "lucide-react";
import { useState, useEffect, useId } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchFiltersProps {
  onSearch?: (filters: SearchFiltersState) => void;
  variant?: "hero" | "inline";
  initialFilters?: Partial<SearchFiltersState>;
  /** If true, pressing Search will not call onSearch until user clicks it. Defaults to false (live). */
  submitOnly?: boolean;
}

export interface SearchFiltersState {
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
}

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "office", label: "Office" },
];

const priceRanges = [
  { value: "all", label: "Any Price" },
  { value: "0-500000", label: "Under $500K" },
  { value: "500000-1000000", label: "$500K - $1M" },
  { value: "1000000-2000000", label: "$1M - $2M" },
  { value: "2000000-5000000", label: "$2M - $5M" },
  { value: "5000000+", label: "$5M+" },
];

const bedroomOptions = [
  { value: "all", label: "Any Beds" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1+ Bed" },
  { value: "2", label: "2+ Beds" },
  { value: "3", label: "3+ Beds" },
  { value: "4", label: "4+ Beds" },
  { value: "5", label: "5+ Beds" },
];

const DEFAULTS: SearchFiltersState = {
  location: "",
  propertyType: "all",
  priceRange: "all",
  bedrooms: "all",
};

export function SearchFilters({
  onSearch,
  variant = "inline",
  initialFilters,
  submitOnly = false,
}: SearchFiltersProps) {
  const listId = useId();
  const [filters, setFilters] = useState<SearchFiltersState>({
    ...DEFAULTS,
    ...initialFilters,
  });
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // Keep in sync if parent's initialFilters change (e.g., URL params update).
  useEffect(() => {
    if (!initialFilters) return;
    setFilters((prev) => ({ ...prev, ...initialFilters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialFilters?.location,
    initialFilters?.propertyType,
    initialFilters?.priceRange,
    initialFilters?.bedrooms,
  ]);

  // Fetch distinct locations for the autocomplete datalist.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("properties")
        .select("location")
        .eq("status", "available")
        .limit(500);
      if (cancelled || !data) return;
      const unique = Array.from(
        new Set(data.map((r: any) => (r.location as string)?.trim()).filter(Boolean))
      ).sort();
      setLocationOptions(unique);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const emit = (next: SearchFiltersState) => onSearch?.(next);

  const handleSearch = () => emit(filters);

  const handleClear = () => {
    setFilters(DEFAULTS);
    emit(DEFAULTS);
  };

  const clearLocation = () => {
    const next = { ...filters, location: "" };
    setFilters(next);
    if (!submitOnly) emit(next);
  };

  const hasFilters =
    filters.location.trim() ||
    filters.propertyType !== "all" ||
    filters.priceRange !== "all" ||
    filters.bedrooms !== "all";

  const isHero = variant === "hero";

  return (
    <div
      className={`${
        isHero
          ? "bg-card/95 backdrop-blur-md rounded-2xl shadow-lg p-4 lg:p-6"
          : "bg-card rounded-xl shadow-card p-4"
      }`}
    >
      <div className={`grid gap-3 ${isHero ? "lg:grid-cols-5" : "lg:grid-cols-5"}`}>
        {/* Location Input with autocomplete + clear */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            list={listId}
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-9 h-12 bg-secondary border-0"
            aria-label="Search by location"
          />
          <datalist id={listId}>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          {filters.location && (
            <button
              type="button"
              onClick={clearLocation}
              aria-label="Clear location"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Property Type */}
        <Select
          value={filters.propertyType}
          onValueChange={(value) => {
            const next = { ...filters, propertyType: value };
            setFilters(next);
            if (!submitOnly) emit(next);
          }}
        >
          <SelectTrigger className="h-12 bg-secondary border-0">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Range */}
        <Select
          value={filters.priceRange}
          onValueChange={(value) => {
            const next = { ...filters, priceRange: value };
            setFilters(next);
            if (!submitOnly) emit(next);
          }}
        >
          <SelectTrigger className="h-12 bg-secondary border-0">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bedrooms */}
        <Select
          value={filters.bedrooms}
          onValueChange={(value) => {
            const next = { ...filters, bedrooms: value };
            setFilters(next);
            if (!submitOnly) emit(next);
          }}
        >
          <SelectTrigger className="h-12 bg-secondary border-0">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            {bedroomOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search / Clear Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            variant="gold"
            size="lg"
            className="h-12 flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {hasFilters && (
            <Button
              onClick={handleClear}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              aria-label="Reset all filters"
              title="Reset all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
