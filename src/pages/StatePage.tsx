/**
 * State Page
 * Shows properties filtered by UAE emirate with dynamic filters
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterBar from '@/components/FilterBar';
import UAEPropertyCard from '@/components/UAEPropertyCard';
import { getPropertiesByState, getStateNameFromSlug } from '@/data/uaePropertyData';

const StatePage = () => {
  const { stateName } = useParams<{ stateName: string }>();
  const stateSlug = stateName || '';
  const stateLabel = getStateNameFromSlug(stateSlug);
  const allProperties = getPropertiesByState(stateSlug);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [status, setStatus] = useState('all');
  const [bedrooms, setBedrooms] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      // Type
      if (propertyType !== 'all' && p.type !== propertyType) return false;
      // Status
      if (status !== 'all' && p.status !== status) return false;
      // Bedrooms
      if (bedrooms !== 'all') {
        const bed = parseInt(bedrooms);
        if (bed === 4 ? p.bedrooms < 4 : p.bedrooms !== bed) return false;
      }
      // Price range
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number);
        if (p.price < min || p.price > max) return false;
      }
      return true;
    });
  }, [allProperties, searchQuery, propertyType, status, bedrooms, priceRange]);

  const resetFilters = () => {
    setSearchQuery('');
    setPropertyType('all');
    setStatus('all');
    setBedrooms('all');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Properties in {stateLabel}</h1>
            <p className="text-primary-foreground/70 text-lg">
              {allProperties.length} properties available
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            propertyType={propertyType}
            onTypeChange={setPropertyType}
            status={status}
            onStatusChange={setStatus}
            bedrooms={bedrooms}
            onBedroomsChange={setBedrooms}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onReset={resetFilters}
          />

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            Showing {filteredProperties.length} of {allProperties.length} properties
          </p>

          {/* Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <UAEPropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-primary mb-2">No properties found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <button onClick={resetFilters} className="text-accent hover:underline">
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StatePage;
