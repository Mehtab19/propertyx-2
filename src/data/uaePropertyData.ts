/**
 * UAE Property Data
 * Comprehensive dummy property data for all 7 emirates
 */

export interface UAEProperty {
  id: string;
  title: string;
  state: string;
  stateSlug: string;
  location: string;
  price: number;
  priceFormatted: string;
  type: 'Villa' | 'Apartment' | 'Townhouse' | 'Penthouse' | 'Studio' | 'Office';
  bedrooms: number;
  bathrooms: number;
  area: string;
  status: 'Buy' | 'Rent';
  image: string;
  description: string;
  features: string[];
}

export const UAE_PROPERTIES: UAEProperty[] = [
  // ── Dubai (8 properties) ──
  {
    id: 'dxb-1', title: 'Luxury Villa in Palm Jumeirah', state: 'Dubai', stateSlug: 'dubai',
    location: 'Palm Jumeirah', price: 2500000, priceFormatted: 'AED 2,500,000',
    type: 'Villa', bedrooms: 5, bathrooms: 6, area: '6,200 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    description: 'Stunning beachfront villa with private pool and panoramic sea views.',
    features: ['Private Pool', 'Sea View', 'Smart Home', 'Private Beach'],
  },
  {
    id: 'dxb-2', title: 'Modern Apartment in Dubai Marina', state: 'Dubai', stateSlug: 'dubai',
    location: 'Dubai Marina', price: 850000, priceFormatted: 'AED 850,000',
    type: 'Apartment', bedrooms: 2, bathrooms: 2, area: '1,200 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    description: 'Contemporary apartment with stunning marina and sea views.',
    features: ['Marina View', 'Gym', 'Pool', 'Concierge'],
  },
  {
    id: 'dxb-3', title: 'Penthouse in Downtown Dubai', state: 'Dubai', stateSlug: 'dubai',
    location: 'Downtown Dubai', price: 5800000, priceFormatted: 'AED 5,800,000',
    type: 'Penthouse', bedrooms: 4, bathrooms: 5, area: '4,500 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    description: 'Iconic penthouse with Burj Khalifa views and private terrace.',
    features: ['Burj Khalifa View', 'Private Terrace', 'Home Theater', 'Wine Cellar'],
  },
  {
    id: 'dxb-4', title: 'Studio in JLT', state: 'Dubai', stateSlug: 'dubai',
    location: 'Jumeirah Lake Towers', price: 45000, priceFormatted: 'AED 45,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '450 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    description: 'Fully furnished studio ideal for young professionals.',
    features: ['Furnished', 'Metro Access', 'Gym', 'Parking'],
  },
  {
    id: 'dxb-5', title: 'Townhouse in Arabian Ranches', state: 'Dubai', stateSlug: 'dubai',
    location: 'Arabian Ranches', price: 1800000, priceFormatted: 'AED 1,800,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 4, area: '2,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    description: 'Family townhouse in a lush gated community with golf course.',
    features: ['Golf Course', 'Garden', 'Maid Room', 'Community Pool'],
  },
  {
    id: 'dxb-6', title: 'Office Space in Business Bay', state: 'Dubai', stateSlug: 'dubai',
    location: 'Business Bay', price: 120000, priceFormatted: 'AED 120,000/yr',
    type: 'Office', bedrooms: 0, bathrooms: 2, area: '1,500 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    description: 'Prime office space with canal views and modern fitout.',
    features: ['Canal View', 'Fitted', 'Meeting Rooms', '24/7 Access'],
  },
  {
    id: 'dxb-7', title: 'Luxury Apartment in DIFC', state: 'Dubai', stateSlug: 'dubai',
    location: 'DIFC', price: 1500000, priceFormatted: 'AED 1,500,000',
    type: 'Apartment', bedrooms: 2, bathrooms: 3, area: '1,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    description: 'Sophisticated apartment in the financial heart of Dubai.',
    features: ['Sky View', 'Valet Parking', 'Spa', 'Infinity Pool'],
  },
  {
    id: 'dxb-8', title: 'Villa in Emirates Hills', state: 'Dubai', stateSlug: 'dubai',
    location: 'Emirates Hills', price: 12000000, priceFormatted: 'AED 12,000,000',
    type: 'Villa', bedrooms: 7, bathrooms: 8, area: '12,000 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    description: 'Palatial mansion on the golf course with lake views.',
    features: ['Golf View', 'Private Pool', 'Cinema', 'Staff Quarters'],
  },

  // ── Abu Dhabi (6 properties) ──
  {
    id: 'auh-1', title: 'Beachfront Villa on Saadiyat', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Saadiyat Island', price: 3200000, priceFormatted: 'AED 3,200,000',
    type: 'Villa', bedrooms: 4, bathrooms: 5, area: '5,000 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    description: 'Exclusive beachfront villa near the Louvre Abu Dhabi.',
    features: ['Beach Access', 'Private Garden', 'Smart Home', 'Sea View'],
  },
  {
    id: 'auh-2', title: 'Apartment in Al Reem Island', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Al Reem Island', price: 680000, priceFormatted: 'AED 680,000',
    type: 'Apartment', bedrooms: 1, bathrooms: 2, area: '850 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    description: 'Modern apartment with waterfront views and premium amenities.',
    features: ['Waterfront', 'Gym', 'Pool', 'Parking'],
  },
  {
    id: 'auh-3', title: 'Penthouse on Corniche', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Corniche', price: 4500000, priceFormatted: 'AED 4,500,000',
    type: 'Penthouse', bedrooms: 3, bathrooms: 4, area: '3,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    description: 'Stunning penthouse with panoramic Corniche and sea views.',
    features: ['Corniche View', 'Private Terrace', 'Concierge', 'Spa'],
  },
  {
    id: 'auh-4', title: 'Townhouse in Yas Island', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Yas Island', price: 1400000, priceFormatted: 'AED 1,400,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '2,200 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    description: 'Family townhouse near Yas Marina Circuit and Ferrari World.',
    features: ['Near F1 Circuit', 'Garden', 'Community Pool', 'Kids Play Area'],
  },
  {
    id: 'auh-5', title: 'Studio in Masdar City', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Masdar City', price: 35000, priceFormatted: 'AED 35,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '500 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    description: 'Eco-friendly studio in the sustainable city of the future.',
    features: ['Eco-Friendly', 'Furnished', 'Solar Powered', 'Smart Home'],
  },
  {
    id: 'auh-6', title: 'Office in ADGM', state: 'Abu Dhabi', stateSlug: 'abu-dhabi',
    location: 'Al Maryah Island', price: 150000, priceFormatted: 'AED 150,000/yr',
    type: 'Office', bedrooms: 0, bathrooms: 2, area: '2,000 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    description: 'Premium office space in Abu Dhabi Global Market.',
    features: ['ADGM License', 'Fitted', 'Meeting Rooms', 'Parking'],
  },

  // ── Sharjah (5 properties) ──
  {
    id: 'shj-1', title: 'Family Villa in Al Zahia', state: 'Sharjah', stateSlug: 'sharjah',
    location: 'Al Zahia', price: 1600000, priceFormatted: 'AED 1,600,000',
    type: 'Villa', bedrooms: 4, bathrooms: 5, area: '3,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    description: 'Spacious family villa in Sharjah\'s premier community.',
    features: ['Garden', 'Community Pool', 'Gym', 'Kids Play Area'],
  },
  {
    id: 'shj-2', title: 'Apartment in Al Majaz', state: 'Sharjah', stateSlug: 'sharjah',
    location: 'Al Majaz', price: 380000, priceFormatted: 'AED 380,000',
    type: 'Apartment', bedrooms: 2, bathrooms: 2, area: '1,100 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    description: 'Modern apartment overlooking Khalid Lagoon.',
    features: ['Lagoon View', 'Parking', 'Gym', 'Security'],
  },
  {
    id: 'shj-3', title: 'Townhouse in Tilal City', state: 'Sharjah', stateSlug: 'sharjah',
    location: 'Tilal City', price: 950000, priceFormatted: 'AED 950,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '2,000 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    description: 'Contemporary townhouse in an up-and-coming community.',
    features: ['Smart Home', 'Garden', 'Covered Parking', 'Near Schools'],
  },
  {
    id: 'shj-4', title: 'Studio in University City', state: 'Sharjah', stateSlug: 'sharjah',
    location: 'University City', price: 22000, priceFormatted: 'AED 22,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '400 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    description: 'Affordable furnished studio perfect for students.',
    features: ['Furnished', 'Near University', 'Parking', 'Internet'],
  },
  {
    id: 'shj-5', title: 'Office in Sharjah Media City', state: 'Sharjah', stateSlug: 'sharjah',
    location: 'Sharjah Media City', price: 55000, priceFormatted: 'AED 55,000/yr',
    type: 'Office', bedrooms: 0, bathrooms: 1, area: '800 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    description: 'Modern office with free zone license benefits.',
    features: ['Free Zone', 'Fitted', 'Parking', '24/7 Access'],
  },

  // ── Ajman (5 properties) ──
  {
    id: 'ajm-1', title: 'Seaside Villa in Al Zorah', state: 'Ajman', stateSlug: 'ajman',
    location: 'Al Zorah', price: 2100000, priceFormatted: 'AED 2,100,000',
    type: 'Villa', bedrooms: 4, bathrooms: 5, area: '4,200 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    description: 'Luxury villa in Ajman\'s exclusive waterfront community.',
    features: ['Beach Access', 'Golf Course', 'Private Pool', 'Mangrove View'],
  },
  {
    id: 'ajm-2', title: 'Apartment in Ajman Corniche', state: 'Ajman', stateSlug: 'ajman',
    location: 'Corniche', price: 280000, priceFormatted: 'AED 280,000',
    type: 'Apartment', bedrooms: 1, bathrooms: 1, area: '750 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    description: 'Affordable apartment with beautiful sea views.',
    features: ['Sea View', 'Gym', 'Pool', 'Parking'],
  },
  {
    id: 'ajm-3', title: 'Townhouse in Al Ameera', state: 'Ajman', stateSlug: 'ajman',
    location: 'Al Ameera Village', price: 750000, priceFormatted: 'AED 750,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '1,900 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    description: 'Modern townhouse in a family-friendly gated community.',
    features: ['Gated Community', 'Garden', 'Near Schools', 'Playground'],
  },
  {
    id: 'ajm-4', title: 'Studio in Emirates City', state: 'Ajman', stateSlug: 'ajman',
    location: 'Emirates City', price: 18000, priceFormatted: 'AED 18,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '380 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    description: 'Budget-friendly studio in a prime Ajman location.',
    features: ['Furnished', 'Parking', 'Gym', 'Security'],
  },
  {
    id: 'ajm-5', title: 'Apartment in Ajman One', state: 'Ajman', stateSlug: 'ajman',
    location: 'Ajman One', price: 32000, priceFormatted: 'AED 32,000/yr',
    type: 'Apartment', bedrooms: 2, bathrooms: 2, area: '1,050 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    description: 'Spacious apartment with direct beach access.',
    features: ['Beach Access', 'Pool', 'Gym', 'Kids Area'],
  },

  // ── Ras Al Khaimah (5 properties) ──
  {
    id: 'rak-1', title: 'Mountain Villa in Jebel Jais', state: 'Ras Al Khaimah', stateSlug: 'ras-al-khaimah',
    location: 'Jebel Jais', price: 1800000, priceFormatted: 'AED 1,800,000',
    type: 'Villa', bedrooms: 3, bathrooms: 4, area: '3,500 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    description: 'Unique mountain retreat villa with breathtaking views.',
    features: ['Mountain View', 'Private Pool', 'Terrace', 'Hiking Trails'],
  },
  {
    id: 'rak-2', title: 'Beachfront Apartment in Al Marjan', state: 'Ras Al Khaimah', stateSlug: 'ras-al-khaimah',
    location: 'Al Marjan Island', price: 720000, priceFormatted: 'AED 720,000',
    type: 'Apartment', bedrooms: 2, bathrooms: 2, area: '1,300 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    description: 'Resort-style living on the stunning Al Marjan Island.',
    features: ['Beach Access', 'Resort Amenities', 'Sea View', 'Pool'],
  },
  {
    id: 'rak-3', title: 'Townhouse in Mina Al Arab', state: 'Ras Al Khaimah', stateSlug: 'ras-al-khaimah',
    location: 'Mina Al Arab', price: 1100000, priceFormatted: 'AED 1,100,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '2,400 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    description: 'Waterfront townhouse in a nature-inspired community.',
    features: ['Waterfront', 'Flamingo Sanctuary', 'Garden', 'Community Pool'],
  },
  {
    id: 'rak-4', title: 'Villa in Al Hamra', state: 'Ras Al Khaimah', stateSlug: 'ras-al-khaimah',
    location: 'Al Hamra Village', price: 95000, priceFormatted: 'AED 95,000/yr',
    type: 'Villa', bedrooms: 4, bathrooms: 4, area: '3,200 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    description: 'Golf course villa perfect for families seeking tranquility.',
    features: ['Golf Course', 'Private Pool', 'Maid Room', 'Near Mall'],
  },
  {
    id: 'rak-5', title: 'Penthouse in Julphar Towers', state: 'Ras Al Khaimah', stateSlug: 'ras-al-khaimah',
    location: 'RAK City', price: 1600000, priceFormatted: 'AED 1,600,000',
    type: 'Penthouse', bedrooms: 3, bathrooms: 3, area: '2,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    description: 'Top-floor penthouse with 360-degree city and sea views.',
    features: ['360° View', 'Private Terrace', 'Smart Home', 'Concierge'],
  },

  // ── Fujairah (5 properties) ──
  {
    id: 'fuj-1', title: 'Beachfront Villa in Dibba', state: 'Fujairah', stateSlug: 'fujairah',
    location: 'Dibba', price: 1400000, priceFormatted: 'AED 1,400,000',
    type: 'Villa', bedrooms: 3, bathrooms: 4, area: '3,000 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    description: 'Seaside villa with mountain and ocean views in Dibba.',
    features: ['Sea View', 'Mountain View', 'Private Garden', 'Near Diving'],
  },
  {
    id: 'fuj-2', title: 'Apartment in Fujairah City', state: 'Fujairah', stateSlug: 'fujairah',
    location: 'Fujairah City', price: 320000, priceFormatted: 'AED 320,000',
    type: 'Apartment', bedrooms: 2, bathrooms: 2, area: '1,000 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    description: 'Affordable city apartment with modern finishes.',
    features: ['City View', 'Parking', 'Gym', 'Near Souq'],
  },
  {
    id: 'fuj-3', title: 'Townhouse in Al Faseel', state: 'Fujairah', stateSlug: 'fujairah',
    location: 'Al Faseel', price: 850000, priceFormatted: 'AED 850,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '2,100 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    description: 'Coastal townhouse minutes from the beach.',
    features: ['Near Beach', 'Garden', 'Community Pool', 'Near Hospital'],
  },
  {
    id: 'fuj-4', title: 'Studio in Fujairah Free Zone', state: 'Fujairah', stateSlug: 'fujairah',
    location: 'Free Zone', price: 20000, priceFormatted: 'AED 20,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '420 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    description: 'Compact studio near the industrial free zone.',
    features: ['Furnished', 'Parking', 'Near Free Zone', 'Internet'],
  },
  {
    id: 'fuj-5', title: 'Villa in Merashid', state: 'Fujairah', stateSlug: 'fujairah',
    location: 'Merashid', price: 75000, priceFormatted: 'AED 75,000/yr',
    type: 'Villa', bedrooms: 4, bathrooms: 4, area: '3,500 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    description: 'Spacious family villa in a quiet residential area.',
    features: ['Garden', 'Maid Room', 'Parking', 'Near Schools'],
  },

  // ── Umm Al Quwain (5 properties) ──
  {
    id: 'uaq-1', title: 'Waterfront Villa in UAQ Marina', state: 'Umm Al Quwain', stateSlug: 'umm-al-quwain',
    location: 'UAQ Marina', price: 1200000, priceFormatted: 'AED 1,200,000',
    type: 'Villa', bedrooms: 3, bathrooms: 4, area: '3,200 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    description: 'Modern waterfront villa in the new UAQ Marina district.',
    features: ['Marina View', 'Private Pool', 'Smart Home', 'Boat Dock'],
  },
  {
    id: 'uaq-2', title: 'Apartment in Al Salamah', state: 'Umm Al Quwain', stateSlug: 'umm-al-quwain',
    location: 'Al Salamah', price: 220000, priceFormatted: 'AED 220,000',
    type: 'Apartment', bedrooms: 1, bathrooms: 1, area: '650 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    description: 'Budget-friendly apartment in central Umm Al Quwain.',
    features: ['Central Location', 'Parking', 'Near Souq', 'Balcony'],
  },
  {
    id: 'uaq-3', title: 'Townhouse in Al Raas', state: 'Umm Al Quwain', stateSlug: 'umm-al-quwain',
    location: 'Al Raas', price: 650000, priceFormatted: 'AED 650,000',
    type: 'Townhouse', bedrooms: 3, bathrooms: 3, area: '1,800 sq ft', status: 'Buy',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    description: 'Charming townhouse in the historic Al Raas district.',
    features: ['Historic Area', 'Garden', 'Near Corniche', 'Renovated'],
  },
  {
    id: 'uaq-4', title: 'Studio in UAQ Tower', state: 'Umm Al Quwain', stateSlug: 'umm-al-quwain',
    location: 'UAQ Tower', price: 15000, priceFormatted: 'AED 15,000/yr',
    type: 'Studio', bedrooms: 0, bathrooms: 1, area: '350 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    description: 'Most affordable studio option in the UAE.',
    features: ['Furnished', 'Parking', 'Gym', 'Affordable'],
  },
  {
    id: 'uaq-5', title: 'Villa in Falaj Al Mualla', state: 'Umm Al Quwain', stateSlug: 'umm-al-quwain',
    location: 'Falaj Al Mualla', price: 55000, priceFormatted: 'AED 55,000/yr',
    type: 'Villa', bedrooms: 5, bathrooms: 5, area: '4,000 sq ft', status: 'Rent',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    description: 'Large family villa with desert views and ample space.',
    features: ['Desert View', 'Large Garden', 'Maid Room', 'Driver Room'],
  },
];

// Get properties by state slug
export const getPropertiesByState = (stateSlug: string): UAEProperty[] => {
  return UAE_PROPERTIES.filter(p => p.stateSlug === stateSlug);
};

// Get state name from slug
export const getStateNameFromSlug = (slug: string): string => {
  const stateMap: Record<string, string> = {
    'dubai': 'Dubai',
    'abu-dhabi': 'Abu Dhabi',
    'sharjah': 'Sharjah',
    'ajman': 'Ajman',
    'ras-al-khaimah': 'Ras Al Khaimah',
    'fujairah': 'Fujairah',
    'umm-al-quwain': 'Umm Al Quwain',
  };
  return stateMap[slug] || slug;
};

// Get unique property types
export const getPropertyTypes = (): string[] => {
  return [...new Set(UAE_PROPERTIES.map(p => p.type))];
};

// Get bedroom options
export const getBedroomOptions = (): number[] => {
  return [...new Set(UAE_PROPERTIES.map(p => p.bedrooms))].sort((a, b) => a - b);
};
