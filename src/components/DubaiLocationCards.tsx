/**
 * UAE State Strip Cards Component
 * Vertical strip cards for UAE states with hover effects on desktop,
 * swipeable cards on mobile.
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface StateCard {
  name: string;
  slug: string;
  image: string;
  propertyCount: number;
}

const uaeStates: StateCard[] = [
  {
    name: 'Dubai',
    slug: 'dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    propertyCount: 8,
  },
  {
    name: 'Abu Dhabi',
    slug: 'abu-dhabi',
    image: 'https://images.unsplash.com/photo-1611605645802-c21be743c321?auto=format&fit=crop&w=800&q=80',
    propertyCount: 6,
  },
  {
    name: 'Sharjah',
    slug: 'sharjah',
    image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&q=80',
    propertyCount: 5,
  },
  {
    name: 'Ajman',
    slug: 'ajman',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
    propertyCount: 5,
  },
  {
    name: 'Ras Al Khaimah',
    slug: 'ras-al-khaimah',
    image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=800&q=80',
    propertyCount: 5,
  },
  {
    name: 'Fujairah',
    slug: 'fujairah',
    image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=800&q=80',
    propertyCount: 5,
  },
  {
    name: 'Umm Al Quwain',
    slug: 'umm-al-quwain',
    image: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?auto=format&fit=crop&w=800&q=80',
    propertyCount: 5,
  },
];

const DubaiLocationCards = () => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-14 sm:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-8 sm:mb-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
            Explore the UAE Properties
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Discover premium properties across all seven emirates
          </p>
        </div>
      </div>

      {/* Mobile: horizontal snap carousel */}
      <div className="md:hidden flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {uaeStates.map((state) => (
          <button
            key={state.slug}
            onClick={() => navigate(`/properties?location=${encodeURIComponent(state.name)}`)}
            className="relative shrink-0 w-[78vw] max-w-[300px] h-56 rounded-2xl overflow-hidden snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={`View properties in ${state.name}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${state.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
              <h3 className="text-xl font-bold text-white tracking-wide mb-1">
                {state.name}
              </h3>
              <p className="text-white/70 text-sm">
                {state.propertyCount} Properties
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: edge-to-edge panoramic strip */}
      <div className="hidden md:flex w-full h-[420px] lg:h-[500px] overflow-hidden">
        {uaeStates.map((state, idx) => (
          <button
            key={state.slug}
            onClick={() => navigate(`/properties?location=${encodeURIComponent(state.name)}`)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            style={{
              flex: hoveredIdx === idx ? 1.6 : hoveredIdx !== null ? 0.85 : 1,
              transition: 'flex 0.5s cubic-bezier(0.4,0,0.2,1)',
              minWidth: 0,
            }}
            aria-label={`View properties in ${state.name}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{ backgroundImage: `url(${state.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide mb-1">
                {state.name}
              </h3>
              <p className="text-white/70 text-sm">
                {state.propertyCount} Properties
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DubaiLocationCards;
