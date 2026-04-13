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
    name: "Marina Bay Residences",
    title: "Luxury Waterfront Living",
    price: "$850K - $2.1M",
    location: "Downtown District",
    city: "Singapore",
    country: "Singapore",
    address: "123 Marina Boulevard, Singapore 018940",
    area: "1,500 - 3,200 sq ft",
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    type: "residential",
    status: "Ready to Move",
    description: "Experience the pinnacle of luxury living at Marina Bay Residences. These exquisitely designed apartments offer breathtaking views of the iconic Singapore skyline and waterfront. Each unit features premium finishes, smart home technology, and access to world-class amenities including an infinity pool, private gym, and concierge services.",
    features: ["Smart Home", "Infinity Pool", "Gym", "Concierge", "Sea View", "Parking"],
    amenities: {
      electricity: true,
      water: true,
      gas: true,
      security: true,
      internet: true,
      backupPower: true
    },
    legalInfo: {
      ownershipStatus: "Freehold",
      approvalAuthority: "Urban Redevelopment Authority",
      possessionStatus: "Immediate"
    },
    agent: {
      name: "Sarah Chen",
      phone: "+65 9123 4567",
      email: "sarah.chen@primexestates.com",
      whatsapp: "+6591234567"
    },
    developer: "Elite Developers",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
    ],
    aiScore: 9.2,
    expectedRoi: "14.5%",
    completionMonths: 0
  },
  {
    id: "2",
    name: "Sunset Heights",
    title: "Modern Family Living",
    price: "$650K - $1.5M",
    location: "West Valley",
    city: "Los Angeles",
    country: "USA",
    address: "456 Sunset Boulevard, West Valley, CA 90210",
    area: "1,800 - 2,800 sq ft",
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    type: "residential",
    status: "Under Construction",
    description: "Sunset Heights offers contemporary family homes designed for modern living. With spacious interiors, open floor plans, and premium amenities, these residences provide the perfect blend of comfort and style. Enjoy panoramic views of the valley and easy access to top schools and shopping centers.",
    features: ["Open Floor Plan", "Garden", "Pool", "Modern Kitchen", "Valley View", "Solar Panels"],
    amenities: {
      electricity: true,
      water: true,
      gas: true,
      security: true,
      internet: true,
      backupPower: true
    },
    legalInfo: {
      ownershipStatus: "Freehold",
      approvalAuthority: "LA County",
      possessionStatus: "Q4 2025"
    },
    agent: {
      name: "Michael Johnson",
      phone: "+1 310 555 1234",
      email: "michael.j@primexestates.com",
      whatsapp: "+13105551234"
    },
    developer: "Sunset Developments",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800"
    ],
    aiScore: 8.8,
    expectedRoi: "12.3%",
    completionMonths: 30
  },
  {
    id: "3",
    name: "Tech Park Offices",
    title: "Premium Commercial Space",
    price: "$5M - $15M",
    location: "Innovation District",
    city: "Dubai",
    country: "UAE",
    address: "789 Tech Park Avenue, Business Bay, Dubai",
    area: "5,000 - 20,000 sq ft",
    bedrooms: 0,
    bathrooms: 8,
    parking: 50,
    type: "commercial",
    status: "Ready to Move",
    description: "Tech Park Offices represents the future of commercial real estate. These Grade A office spaces feature cutting-edge infrastructure, sustainable design, and flexible floor plans suitable for tech companies and multinational corporations. Located in the heart of the Innovation District with excellent connectivity.",
    features: ["Grade A Office", "Green Building", "High-Speed Internet", "Conference Rooms", "Cafeteria", "24/7 Access"],
    amenities: {
      electricity: true,
      water: true,
      gas: false,
      security: true,
      internet: true,
      backupPower: true
    },
    legalInfo: {
      ownershipStatus: "Leasehold (99 years)",
      approvalAuthority: "Dubai Municipality",
      possessionStatus: "Immediate"
    },
    agent: {
      name: "Ahmed Al-Rashid",
      phone: "+971 50 123 4567",
      email: "ahmed.r@primexestates.com",
      whatsapp: "+971501234567"
    },
    developer: "Dubai Properties",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
    ],
    aiScore: 8.7,
    expectedRoi: "11.2%",
    completionMonths: 0
  },
  {
    id: "4",
    name: "Oak Park Apartments",
    title: "Urban Lifestyle Living",
    price: "$720K - $1.8M",
    location: "North District",
    city: "London",
    country: "UK",
    address: "101 Oak Park Lane, North London, N1 2AB",
    area: "900 - 2,100 sq ft",
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    type: "residential",
    status: "Ready to Move",
    description: "Oak Park Apartments offer sophisticated urban living in one of London's most desirable neighborhoods. These thoughtfully designed residences feature high ceilings, large windows, and premium finishes. Residents enjoy access to private gardens, a fitness center, and excellent transport links.",
    features: ["High Ceilings", "Private Garden", "Fitness Center", "Concierge", "Bike Storage", "Pet Friendly"],
    amenities: {
      electricity: true,
      water: true,
      gas: true,
      security: true,
      internet: true,
      backupPower: false
    },
    legalInfo: {
      ownershipStatus: "Leasehold (125 years)",
      approvalAuthority: "Islington Council",
      possessionStatus: "Immediate"
    },
    agent: {
      name: "Emma Thompson",
      phone: "+44 20 7123 4567",
      email: "emma.t@primexestates.com",
      whatsapp: "+442071234567"
    },
    developer: "London Living",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
      "https://images.unsplash.com/photo-1600573472591-ee6981cf81f0?w=800"
    ],
    aiScore: 9.0,
    expectedRoi: "13.8%",
    completionMonths: 0
  },
  {
    id: "5",
    name: "Crystal Tower",
    title: "Luxury Penthouse Collection",
    price: "$3.5M - $8M",
    location: "Financial District",
    city: "New York",
    country: "USA",
    address: "One Crystal Plaza, Financial District, NY 10005",
    area: "3,500 - 6,000 sq ft",
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    type: "luxury",
    status: "Ready to Move",
    description: "Crystal Tower presents an exclusive collection of luxury penthouses designed for the discerning buyer. These exceptional residences feature floor-to-ceiling windows, private terraces, and unparalleled views of the Manhattan skyline. White-glove service, private elevators, and world-class amenities define the Crystal Tower lifestyle.",
    features: ["Private Terrace", "Private Elevator", "Wine Cellar", "Home Theater", "Spa", "Sky Lounge"],
    amenities: {
      electricity: true,
      water: true,
      gas: true,
      security: true,
      internet: true,
      backupPower: true
    },
    legalInfo: {
      ownershipStatus: "Freehold",
      approvalAuthority: "NYC Buildings",
      possessionStatus: "Immediate"
    },
    agent: {
      name: "James Williams",
      phone: "+1 212 555 9876",
      email: "james.w@primexestates.com",
      whatsapp: "+12125559876"
    },
    developer: "Pinnacle Properties",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
    ],
    aiScore: 9.5,
    expectedRoi: "15.2%",
    completionMonths: 0
  },
  {
    id: "6",
    name: "Green Valley Villas",
    title: "Eco-Friendly Living",
    price: "$450K - $950K",
    location: "Green Valley",
    city: "Austin",
    country: "USA",
    address: "200 Green Valley Road, Austin, TX 78701",
    area: "2,200 - 3,500 sq ft",
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    type: "construction",
    status: "Under Construction",
    description: "Green Valley Villas represents the future of sustainable living. These eco-friendly homes feature solar panels, rainwater harvesting, and energy-efficient design. Set in a beautifully landscaped community with hiking trails, community gardens, and a focus on wellness and environmental responsibility.",
    features: ["Solar Powered", "Rainwater Harvesting", "Electric Car Charging", "Smart Home", "Community Garden", "Hiking Trails"],
    amenities: {
      electricity: true,
      water: true,
      gas: false,
      security: true,
      internet: true,
      backupPower: true
    },
    legalInfo: {
      ownershipStatus: "Freehold",
      approvalAuthority: "Austin City Planning",
      possessionStatus: "Q2 2026"
    },
    agent: {
      name: "Lisa Martinez",
      phone: "+1 512 555 4321",
      email: "lisa.m@primexestates.com",
      whatsapp: "+15125554321"
    },
    developer: "EcoHomes Inc",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800"
    ],
    aiScore: 8.5,
    expectedRoi: "10.8%",
    completionMonths: 24
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
