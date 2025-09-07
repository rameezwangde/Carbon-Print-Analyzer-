import { CarbonCategories, CarbonEntry, Recommendation } from '../types';

// CO2 emission factors (kg CO2 per unit)
export const CO2_FACTORS = {
  transport_km: 0.21, // kg CO2 per km (average car)
  electricity_kWh: 0.45, // kg CO2 per kWh
  lpg_kg: 3.0, // kg CO2 per kg LPG
  flights_hours: 90, // kg CO2 per flight hour
  meat_meals: 2.5, // kg CO2 per meat meal
  dining_out: 3.2, // kg CO2 per dining out occasion
  shopping_spend: 0.5, // kg CO2 per dollar spent
  waste_kg: 0.5, // kg CO2 per kg waste
};

// Slider configurations
export const SLIDER_CONFIGS = {
  transport_km: { min: 0, max: 500, step: 5, unit: 'km/month' },
  electricity_kWh: { min: 0, max: 1000, step: 10, unit: 'kWh/month' },
  lpg_kg: { min: 0, max: 50, step: 1, unit: 'kg/month' },
  flights_hours: { min: 0, max: 100, step: 1, unit: 'hours/year' },
  meat_meals: { min: 0, max: 90, step: 1, unit: 'meals/month' },
  dining_out: { min: 0, max: 60, step: 1, unit: 'times/month' },
  shopping_spend: { min: 0, max: 2000, step: 50, unit: '$/month' },
  waste_kg: { min: 0, max: 200, step: 5, unit: 'kg/month' },
};

// Category display names
export const CATEGORY_NAMES = {
  transport_km: 'Transportation',
  electricity_kWh: 'Electricity',
  lpg_kg: 'LPG/Gas',
  flights_hours: 'Air Travel',
  meat_meals: 'Meat Consumption',
  dining_out: 'Dining Out',
  shopping_spend: 'Shopping',
  waste_kg: 'Waste',
};

// Mock community data for nearby users
export const MOCK_COMMUNITY_DATA: CarbonEntry[] = [
  {
    uid: 'user1',
    lat: 19.0760,
    lng: 72.8777,
    geohash: 'te7mt',
    city: 'Mumbai',
    country: 'India',
    createdAt: new Date('2024-01-15'),
    categories: {
      transport_km: 150,
      electricity_kWh: 400,
      lpg_kg: 20,
      flights_hours: 12,
      meat_meals: 45,
      dining_out: 20,
      shopping_spend: 800,
      waste_kg: 80,
    },
    total_co2: 0,
  },
  {
    uid: 'user2',
    lat: 19.0330,
    lng: 73.0297,
    geohash: 'te7pt',
    city: 'Navi Mumbai',
    country: 'India',
    createdAt: new Date('2024-02-01'),
    categories: {
      transport_km: 200,
      electricity_kWh: 350,
      lpg_kg: 15,
      flights_hours: 8,
      meat_meals: 30,
      dining_out: 15,
      shopping_spend: 600,
      waste_kg: 60,
    },
    total_co2: 0,
  },
  {
    uid: 'user3',
    lat: 19.1136,
    lng: 72.8697,
    geohash: 'te7nv',
    city: 'Mumbai',
    country: 'India',
    createdAt: new Date('2024-02-10'),
    categories: {
      transport_km: 100,
      electricity_kWh: 500,
      lpg_kg: 25,
      flights_hours: 20,
      meat_meals: 60,
      dining_out: 25,
      shopping_spend: 1000,
      waste_kg: 100,
    },
    total_co2: 0,
  },
];

// Sample ML recommendations database
export const RECOMMENDATIONS_DB: Recommendation[] = [
  {
    id: 'transport_1',
    category: 'transport_km',
    title: 'Switch to Mumbai Local Trains',
    description: 'Replace 30% of auto-rickshaw trips with local trains to reduce emissions by ~25kg CO₂/month',
    potential_reduction: 25,
    difficulty: 'easy',
  },
  {
    id: 'transport_2',
    category: 'transport_km',
    title: 'Use Mumbai Metro',
    description: 'Use Metro for trips under 15km to cut emissions by ~15kg CO₂/month',
    potential_reduction: 15,
    difficulty: 'medium',
  },
  {
    id: 'electricity_1',
    category: 'electricity_kWh',
    title: 'LED Light Conversion',
    description: 'Switch all bulbs to LED to save ~8kg CO₂/month on electricity',
    potential_reduction: 8,
    difficulty: 'easy',
  },
  {
    id: 'electricity_2',
    category: 'electricity_kWh',
    title: 'Smart AC Usage',
    description: 'Set AC to 24°C and use timer to reduce cooling by ~20kg CO₂/month',
    potential_reduction: 20,
    difficulty: 'medium',
  },
  {
    id: 'flights_1',
    category: 'flights_hours',
    title: 'Video Conferencing',
    description: 'Replace 2 domestic flights per year with video calls to save ~180kg CO₂/year',
    potential_reduction: 180,
    difficulty: 'easy',
  },
  {
    id: 'meat_1',
    category: 'meat_meals',
    title: 'Vegetarian Days',
    description: 'Go vegetarian two days per week to reduce emissions by ~15kg CO₂/month',
    potential_reduction: 15,
    difficulty: 'easy',
  },
  {
    id: 'meat_2',
    category: 'meat_meals',
    title: 'Plant-Based Alternatives',
    description: 'Replace 50% of meat meals with dal and vegetables to save ~30kg CO₂/month',
    potential_reduction: 30,
    difficulty: 'medium',
  },
  {
    id: 'waste_1',
    category: 'waste_kg',
    title: 'Waste Segregation',
    description: 'Start home composting and recycling to reduce waste by 40% and save ~16kg CO₂/month',
    potential_reduction: 16,
    difficulty: 'medium',
  },
];