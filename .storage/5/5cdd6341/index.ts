export interface CarbonCategories {
  transport_km: number;
  electricity_kWh: number;
  lpg_kg: number;
  flights_hours: number;
  meat_meals: number;
  dining_out: number;
  shopping_spend: number;
  waste_kg: number;
}

export interface CarbonEntry {
  uid: string;
  lat: number;
  lng: number;
  geohash: string;
  city: string;
  country: string;
  createdAt: Date;
  categories: CarbonCategories;
  total_co2: number;
}

export interface Location {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface Recommendation {
  id: string;
  category: keyof CarbonCategories;
  title: string;
  description: string;
  potential_reduction: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CommunityStats {
  median: number;
  percentile75: number;
  average: number;
  count: number;
}