import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COMMUNITY_DATA, CATEGORY_NAMES } from '../config/constants';
import { CarbonCalculator } from '../services/carbonCalculator';

export default function Map() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".map-header", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(".map-container", 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: "back.out(1.7)" }
      );

      gsap.fromTo(".community-card", 
        { opacity: 0, x: 50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          delay: 0.5,
          ease: "power2.out"
        }
      );

      // Animate map markers
      gsap.fromTo(".map-marker", 
        { scale: 0, rotation: 180 },
        { 
          scale: 1, 
          rotation: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 1,
          ease: "back.out(1.7)"
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const communityData = MOCK_COMMUNITY_DATA.map(user => ({
    ...user,
    total_co2: CarbonCalculator.calculateTotalCO2(user.categories)
  }));

  const getEmissionColor = (co2: number) => {
    if (co2 < 200) return 'bg-green-500';
    if (co2 < 400) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEmissionSize = (co2: number) => {
    if (co2 < 200) return 'w-4 h-4';
    if (co2 < 400) return 'w-6 h-6';
    return 'w-8 h-8';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="map-header mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Carbon Map</h1>
          <p className="text-gray-600">
            Explore carbon emissions in Mumbai and Navi Mumbai area
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mock Map */}
          <div className="lg:col-span-2">
            <Card className="map-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mumbai & Navi Mumbai - Carbon Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-96 overflow-hidden"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5f3ff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                >
                  {/* Mumbai landmarks */}
                  <div className="absolute top-4 left-4 text-center text-gray-600 font-medium text-sm">
                    🏛️ Gateway of India
                  </div>
                  <div className="absolute top-1/2 left-1/3 text-center text-gray-600 font-medium text-sm">
                    🏢 BKC
                  </div>
                  <div className="absolute bottom-4 right-4 text-center text-gray-600 font-medium text-sm">
                    🌊 Navi Mumbai
                  </div>
                  
                  {/* Community markers */}
                  {communityData.map((user, index) => (
                    <div
                      key={user.uid}
                      className={`map-marker absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getEmissionColor(user.total_co2)} ${getEmissionSize(user.total_co2)} rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform`}
                      style={{
                        left: user.city === 'Mumbai' ? `${25 + index * 10}%` : `${65 + (index % 2) * 10}%`,
                        top: user.city === 'Mumbai' ? `${35 + (index % 3) * 15}%` : `${50 + (index % 2) * 15}%`,
                      }}
                      onClick={() => setSelectedUser(user)}
                      title={`${user.city} - ${user.total_co2.toFixed(1)} kg CO₂/month`}
                    />
                  ))}
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                    <h4 className="font-semibold text-sm mb-2">Emission Levels</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Low (&lt;200 kg/month)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span>Medium (200-400 kg)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                        <span>High (&gt;400 kg)</span>
                      </div>
                    </div>
                  </div>

                  {/* City Labels */}
                  <div className="absolute top-6 left-1/4 bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Mumbai
                  </div>
                  <div className="absolute top-6 right-1/4 bg-green-500/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Navi Mumbai
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Community Stats */}
          <div className="space-y-6">
            <Card className="community-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Users</span>
                    <Badge variant="outline">{communityData.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Emissions</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {(communityData.reduce((sum, u) => sum + u.total_co2, 0) / communityData.length).toFixed(1)} kg
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mumbai Users</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {communityData.filter(u => u.city === 'Mumbai').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Navi Mumbai Users</span>
                    <Badge className="bg-green-100 text-green-800">
                      {communityData.filter(u => u.city === 'Navi Mumbai').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedUser && (
              <Card className="community-card border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    User Details - {selectedUser.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Emissions</span>
                      <span className="font-semibold">{selectedUser.total_co2.toFixed(1)} kg/month</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Top Categories:</h4>
                      {Object.entries(selectedUser.categories)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([category, value]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="text-gray-600">{CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}</span>
                            <span>{value as number} units</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="community-card text-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Back to Your Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}