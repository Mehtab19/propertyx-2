/**
 * Property Data Types and Sample Data
 * This file contains the property data structure and sample properties
 * Properties can be loaded from Excel or used directly from here
 */

export interface Property {
  id: string;
  name: string;
  title: string;
  price: string;
  location: string;
  city: string;
  country: string;
  address: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  type: 'residential' | 'commercial' | 'luxury' | 'construction';
  status: string;
  description: string;
  features: string[];
  amenities: {
    electricity: boolean;
    water: boolean;
    gas: boolean;
    security: boolean;
    internet: boolean;
    backupPower: boolean;
  };
  legalInfo: {
    ownershipStatus: string;
    approvalAuthority: string;
    possessionStatus: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
  developer: string;
  imageUrl: string;
  floorPlanUrl?: string;
  gallery: string[];
  aiScore: number;
  expectedRoi: string;
  completionMonths: number;
}

// Sample property data that can be replaced with Excel import
export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Palm Jumeirah Luxury Villa",
    title: "Beachfront Living at its Finest",
    price: "AED 15,500,000",
    location: "Palm Jumeirah, Dubai",
    city: "Dubai",
    country: "UAE",
    address: "Frond N, Palm Jumeirah, Dubai, UAE",
    area: "6,500 sq ft",
    bedrooms: 5,
    bathrooms: 6,
    parking: 3,
    type: "luxury",
    status: "Ready to Move",
    description: "Experience the pinnacle of luxury living on the iconic Palm Jumeirah. This exquisitely designed beachfront villa offers breathtaking views of the Arabian Gulf and Dubai skyline. Features include a private beach, infinity pool, smart home technology, and access to world-class resort amenities.",
    features: ["Private Beach", "Infinity Pool", "Smart Home", "Maid's Room", "Sea View", "Covered Parking"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "DLD", possessionStatus: "Immediate" },
    agent: { name: "Sarah Chen", phone: "+971 50 123 4567", email: "sarah@primexestates.com", whatsapp: "+971501234567" },
    developer: "Nakheel",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    gallery: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    aiScore: 9.8,
    expectedRoi: "8.5%",
    completionMonths: 0
  },
  {
    id: "2",
    name: "Downtown Dubai Penthouse",
    title: "Panoramic Burj Khalifa Views",
    price: "AED 12,200,000",
    location: "Downtown Dubai, Dubai",
    city: "Dubai",
    country: "UAE",
    address: "Mohammed Bin Rashid Boulevard, Downtown, Dubai",
    area: "4,200 sq ft",
    bedrooms: 4,
    bathrooms: 5,
    parking: 2,
    type: "penthouse",
    status: "Ready to Move",
    description: "Ultra-luxury penthouse in the heart of Downtown Dubai offering unobstructed views of the Burj Khalifa and the Dubai Fountains. Premium finishes, floor-to-ceiling windows, and access to 5-star hotel amenities make this the ultimate urban residence.",
    features: ["Burj Khalifa View", "Balcony", "Gym", "Concierge", "Swimming Pool", "Spa"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "DLD", possessionStatus: "Immediate" },
    agent: { name: "Michael Johnson", phone: "+971 55 987 6543", email: "michael@primexestates.com", whatsapp: "+971559876543" },
    developer: "Emaar",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    gallery: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
    aiScore: 9.5,
    expectedRoi: "7.2%",
    completionMonths: 0
  },
  {
    id: "3",
    name: "Saadiyat Island Estate",
    title: "Cultural District Waterfront Home",
    price: "AED 14,000,000",
    location: "Saadiyat Island, Abu Dhabi",
    city: "Abu Dhabi",
    country: "UAE",
    address: "Cultural District, Saadiyat Island, Abu Dhabi",
    area: "7,000 sq ft",
    bedrooms: 5,
    bathrooms: 7,
    parking: 4,
    type: "villa",
    status: "Ready to Move",
    description: "An architectural masterpiece located near the Louvre Abu Dhabi. This modern estate features sustainable design, expansive living spaces, a lush private garden, and direct access to pristine white sand beaches.",
    features: ["Beach Access", "Private Garden", "Museum View", "Maid's Room", "Driver's Room", "Private Pool"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "Aldar", possessionStatus: "Immediate" },
    agent: { name: "Ahmed Al-Rashid", phone: "+971 52 345 6789", email: "ahmed@primexestates.com", whatsapp: "+971523456789" },
    developer: "Aldar Properties",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    gallery: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"],
    aiScore: 9.2,
    expectedRoi: "6.8%",
    completionMonths: 0
  },
  {
    id: "4",
    name: "Yas Island Apartment",
    title: "Modern Living near Attractions",
    price: "AED 1,850,000",
    location: "Yas Island, Abu Dhabi",
    city: "Abu Dhabi",
    country: "UAE",
    address: "Yas Bay, Yas Island, Abu Dhabi",
    area: "1,200 sq ft",
    bedrooms: 2,
    bathrooms: 3,
    parking: 1,
    type: "residential",
    status: "Under Construction",
    description: "Vibrant living on Yas Island. Just minutes away from Ferrari World and Yas Marina Circuit. This modern apartment offers resort-style amenities, a shared pool, state-of-the-art gym, and beautiful waterfront promenades.",
    features: ["Balcony", "Shared Pool", "Gym", "Waterfront", "Near Mall", "Covered Parking"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: false },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "Aldar", possessionStatus: "Q4 2025" },
    agent: { name: "Emma Thompson", phone: "+971 56 111 2222", email: "emma@primexestates.com", whatsapp: "+971561112222" },
    developer: "Aldar Properties",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    gallery: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    aiScore: 8.9,
    expectedRoi: "8.1%",
    completionMonths: 18
  },
  {
    id: "5",
    name: "Al Majaz Waterfront Tower",
    title: "Family Apartment with Lagoon Views",
    price: "AED 950,000",
    location: "Al Majaz, Sharjah",
    city: "Sharjah",
    country: "UAE",
    address: "Corniche Road, Al Majaz, Sharjah",
    area: "1,800 sq ft",
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    type: "residential",
    status: "Ready to Move",
    description: "Spacious family apartment overlooking the beautiful Khalid Lagoon. Situated in the most sought-after neighborhood in Sharjah with easy access to parks, restaurants, and family entertainment. Features high-quality finishings and excellent building management.",
    features: ["Lagoon View", "Family Friendly", "Balcony", "24/7 Security", "Gym", "Near Park"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold (Arabs)", approvalAuthority: "Sharjah Municipality", possessionStatus: "Immediate" },
    agent: { name: "Omar Khalid", phone: "+971 50 999 8888", email: "omar@primexestates.com", whatsapp: "+971509998888" },
    developer: "Sharjah Holding",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    gallery: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"],
    aiScore: 8.4,
    expectedRoi: "7.5%",
    completionMonths: 0
  },
  {
    id: "6",
    name: "Ajman Corniche Residences",
    title: "Sea View Luxury Apartment",
    price: "AED 750,000",
    location: "Ajman Corniche, Ajman",
    city: "Ajman",
    country: "UAE",
    address: "Corniche Road, Ajman, UAE",
    area: "1,500 sq ft",
    bedrooms: 2,
    bathrooms: 3,
    parking: 1,
    type: "residential",
    status: "Ready to Move",
    description: "Wake up to stunning views of the Arabian Sea. This prime apartment on Ajman Corniche offers incredible value for investors and end-users. Includes access to a private health club, swimming pool, and direct beach access.",
    features: ["Sea View", "Beach Access", "Health Club", "Covered Parking", "Balcony"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "Ajman Land Dept", possessionStatus: "Immediate" },
    agent: { name: "Lisa Martinez", phone: "+971 54 333 4444", email: "lisa@primexestates.com", whatsapp: "+971543334444" },
    developer: "Ajman Properties",
    imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800",
    gallery: ["https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800"],
    aiScore: 8.6,
    expectedRoi: "9.2%",
    completionMonths: 0
  },
  {
    id: "7",
    name: "Al Marjan Island Resort Villa",
    title: "Exclusive Resort Living",
    price: "AED 3,500,000",
    location: "Al Marjan Island, Ras Al Khaimah",
    city: "Ras Al Khaimah",
    country: "UAE",
    address: "Al Marjan Island Blvd, RAK",
    area: "3,200 sq ft",
    bedrooms: 4,
    bathrooms: 5,
    parking: 2,
    type: "villa",
    status: "Under Construction",
    description: "Premium waterfront living on Al Marjan Island. This upcoming resort-style villa community promises high capital appreciation with the upcoming casino. The villa features a modern design, private pool, and lush landscaping.",
    features: ["Private Pool", "Waterfront", "Resort Amenities", "High ROI Potential", "Smart Home"],
    amenities: { electricity: true, water: true, gas: true, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "RAK Municipality", possessionStatus: "Q1 2026" },
    agent: { name: "Ahmed Al-Rashid", phone: "+971 52 345 6789", email: "ahmed@primexestates.com", whatsapp: "+971523456789" },
    developer: "RAK Properties",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    gallery: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    aiScore: 9.4,
    expectedRoi: "12.5%",
    completionMonths: 20
  },
  {
    id: "8",
    name: "Fujairah Beachfront Retreat",
    title: "Tranquil Mountain & Sea Views",
    price: "AED 2,800,000",
    location: "Al Aqah, Fujairah",
    city: "Fujairah",
    country: "UAE",
    address: "Al Aqah Beach, Fujairah",
    area: "2,800 sq ft",
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    type: "villa",
    status: "Ready to Move",
    description: "Escape the city to this beautiful beachfront retreat nested between the Hajar Mountains and the Indian Ocean. Perfect as a holiday home or high-yield short-term rental property. Features include a large terrace, private garden, and direct beach access.",
    features: ["Mountain View", "Sea View", "Holiday Home", "Private Garden", "Direct Beach Access"],
    amenities: { electricity: true, water: true, gas: false, security: true, internet: true, backupPower: true },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "Fujairah Municipality", possessionStatus: "Immediate" },
    agent: { name: "Sarah Chen", phone: "+971 50 123 4567", email: "sarah@primexestates.com", whatsapp: "+971501234567" },
    developer: "Fujairah National Properties",
    imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    gallery: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"],
    aiScore: 8.8,
    expectedRoi: "10.0%",
    completionMonths: 0
  },
  {
    id: "9",
    name: "UAQ Marina Plot",
    title: "Prime Waterfront Land",
    price: "AED 1,200,000",
    location: "Marina, Umm Al Quwain",
    city: "Umm Al Quwain",
    country: "UAE",
    address: "UAQ Marina Development, Umm Al Quwain",
    area: "8,000 sq ft",
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    type: "land",
    status: "Ready to Build",
    description: "A rare opportunity to build your dream waterfront home in the peaceful emirate of Umm Al Quwain. This premium plot offers direct marina access and is part of a master-planned community with parks and retail centers.",
    features: ["Waterfront Plot", "Build to Suit", "Marina Access", "Master Community"],
    amenities: { electricity: true, water: true, gas: false, security: true, internet: false, backupPower: false },
    legalInfo: { ownershipStatus: "Freehold", approvalAuthority: "UAQ Municipality", possessionStatus: "Immediate" },
    agent: { name: "Omar Khalid", phone: "+971 50 999 8888", email: "omar@primexestates.com", whatsapp: "+971509998888" },
    developer: "UAQ Properties",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    gallery: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"],
    aiScore: 8.2,
    expectedRoi: "9.5%",
    completionMonths: 0
  }
];

// Function to get property by ID
export const getPropertyById = (id: string): Property | undefined => {
  return SAMPLE_PROPERTIES.find(property => property.id === id);
};

// Function to filter properties by type
export const filterPropertiesByType = (type: string): Property[] => {
  if (type === 'all') return SAMPLE_PROPERTIES;
  return SAMPLE_PROPERTIES.filter(property => property.type === type);
};
