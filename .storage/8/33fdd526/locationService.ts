import * as ngeohash from 'ngeohash';
import { Location } from '../types';

export class LocationService {
  static async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock reverse geocoding (in real app, use Google Maps Geocoding API)
          const location: Location = {
            lat: latitude,
            lng: longitude,
            city: 'San Francisco', // Mock city
            country: 'USA', // Mock country
          };
          
          resolve(location);
        },
        () => {
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  static generateGeohash(lat: number, lng: number, precision: number = 5): string {
    return ngeohash.encode(lat, lng, precision);
  }

  static getLocationFromGeohash(geohash: string): { lat: number; lng: number } {
    return ngeohash.decode(geohash);
  }

  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static getMockCities(): Location[] {
    return [
      { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
      { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
      { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: USA' },
      { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
      { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
    ];
  }
}