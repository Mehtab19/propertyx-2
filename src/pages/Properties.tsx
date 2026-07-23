import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SearchFilters } from "@/components/property/SearchFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";

interface SearchFiltersState {
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
}

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: SearchFiltersState = {
  location: "",
  propertyType: "all",
  priceRange: "all",
  bedrooms: "all",
};

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL (shareable/bookmarkable).
  const initialFilters = useMemo<SearchFiltersState>(() => ({
    location: searchParams.get("location") ?? "",
    propertyType: searchParams.get("type") ?? "all",
    priceRange: searchParams.get("price") ?? "all",
    bedrooms: searchParams.get("beds") ?? "all",
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Sync filters -> URL query params.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.location.trim()) params.set("location", filters.location.trim());
    if (filters.propertyType !== "all") params.set("type", filters.propertyType);
    if (filters.priceRange !== "all") params.set("price", filters.priceRange);
    if (filters.bedrooms !== "all") params.set("beds", filters.bedrooms);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);


  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      // Build base query for count
      let countQuery = supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "available");
      let query = supabase.from("properties").select("*").eq("status", "available");

      // Apply filters to both queries
      const applyFilters = (q: any) => {
        if (filters.location.trim()) q = q.ilike("location", `%${filters.location.trim()}%`);
        if (filters.propertyType !== "all") q = q.eq("property_type", filters.propertyType as any);
        if (filters.priceRange !== "all") {
          if (filters.priceRange.endsWith("+")) {
            q = q.gte("price", parseInt(filters.priceRange));
          } else {
            const [min, max] = filters.priceRange.split("-").map(Number);
            q = q.gte("price", min).lte("price", max);
          }
        }
        if (filters.bedrooms !== "all") q = q.gte("bedrooms", parseInt(filters.bedrooms));
        return q;
      };

      countQuery = applyFilters(countQuery);
      query = applyFilters(query);

      // Sort
      switch (sortBy) {
        case "price-low": query = query.order("price", { ascending: true }); break;
        case "price-high": query = query.order("price", { ascending: false }); break;
        case "roi": query = query.order("roi_estimate", { ascending: false, nullsFirst: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      // Paginate
      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const [{ count }, { data }] = await Promise.all([countQuery, query]);
      setTotalCount(count || 0);
      setProperties(data || []);
      setLoading(false);
    };
    fetchProperties();
  }, [sortBy, filters, page]);

  // Reset to page 0 when filters change
  useEffect(() => { setPage(0); }, [filters, sortBy]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const activeFilterCount = [
    filters.location.trim() ? 1 : 0,
    filters.propertyType !== "all" ? 1 : 0,
    filters.priceRange !== "all" ? 1 : 0,
    filters.bedrooms !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Properties" }]} />
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Find Your Perfect Property
            </h1>
            <p className="text-muted-foreground">
              Browse {totalCount} available properties
            </p>
          </div>

          <div className="mb-8">
            <SearchFilters variant="inline" initialFilters={filters} onSearch={setFilters} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {totalCount} Properties
              </Badge>
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="font-normal">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="roi">Highest ROI</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No properties found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters({ location: "", propertyType: "all", priceRange: "all", bedrooms: "all" })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {properties.map((p, index) => (
                  <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <PropertyCard
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
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page === 0}
                    onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                    .reduce<(number | "ellipsis")[]>((acc, i, idx, arr) => {
                      if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(i);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <span key={`e${idx}`} className="px-1 text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? "gold" : "outline"}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => { setPage(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        >
                          {item + 1}
                        </Button>
                      )
                    )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page >= totalPages - 1}
                    onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="ml-3 text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
