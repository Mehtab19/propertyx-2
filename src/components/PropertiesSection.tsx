import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { InvestmentPropertyCard } from "./InvestmentPropertyCard";
import { SAMPLE_PROPERTIES } from "@/data/propertyData";
import { SearchFilters } from "@/components/property/SearchFilters";

const filters = [
  { value: "all", label: "All Projects" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "luxury", label: "Luxury" },
  { value: "construction", label: "Under Construction" },
];

export function PropertiesSection() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProperties =
    activeFilter === "all"
      ? SAMPLE_PROPERTIES
      : SAMPLE_PROPERTIES.filter((p) => p.type === activeFilter);

  return (
    <section className="pt-12 pb-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="bg-gold/10 text-gold-dark border-0 mb-4">
            Featured Listings
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Verified & Premium Properties
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of investment-grade properties that have passed our rigorous due-diligence process.
          </p>
        </div>

        <div className="mb-8">
          <SearchFilters variant="inline" onSearch={() => {}} />
        </div>

        <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-2 justify-start sm:justify-center sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeFilter === filter.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <InvestmentPropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No properties match the selected filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}