# CarbonFootprint React App - MVP Implementation Plan

## Project Overview
Building a React web app for carbon footprint tracking with Firebase backend, GSAP animations, charts, and ML recommendations.

## Core Files to Create/Modify

### 1. Configuration & Setup
- `src/config/firebase.ts` - Firebase configuration
- `src/config/constants.ts` - CO2 calculation constants and mock data
- `src/types/index.ts` - TypeScript interfaces

### 2. Core Components
- `src/components/Layout.tsx` - Main layout wrapper
- `src/components/LoadingSpinner.tsx` - Loading component
- `src/components/CarbonSlider.tsx` - Custom slider for carbon inputs

### 3. Pages (with GSAP animations)
- `src/pages/Landing.tsx` - Animated landing page
- `src/pages/Onboarding.tsx` - Privacy info & location request
- `src/pages/Survey.tsx` - Carbon footprint survey with sliders
- `src/pages/Dashboard.tsx` - Personal charts & recommendations
- `src/pages/Map.tsx` - Geographic heatmap (mock implementation)

### 4. Services & Utilities
- `src/services/carbonCalculator.ts` - CO2 calculation logic
- `src/services/mlRecommender.ts` - Mock ML recommendation system
- `src/services/locationService.ts` - Geolocation & geohash utilities
- `src/hooks/useLocation.tsx` - Custom hook for location

## Implementation Strategy
- Use mock data for Firebase operations (functional UI)
- Implement all GSAP animations
- Create responsive charts with Chart.js
- Build working ML recommender with sample data
- Focus on complete user flow and interactions

## Dependencies to Add
- gsap
- chart.js
- react-chartjs-2
- ngeohash (for geohash)
- firebase (for types, will use mock data)

## Key Features
1. Auto-location detection with fallback
2. Interactive carbon survey with real-time calculations
3. Personal vs community comparison charts
4. ML-powered personalized recommendations
5. Responsive design with smooth animations