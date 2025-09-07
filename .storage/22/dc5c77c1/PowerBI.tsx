import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PowerBI() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".powerbi-header", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(".powerbi-card", 
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          delay: 0.3,
          ease: "back.out(1.7)"
        }
      );

      gsap.fromTo(".feature-item", 
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 0.8,
          ease: "power2.out"
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="powerbi-header mb-8">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Analytics</h1>
          <p className="text-gray-600">
            Power BI integration for deeper insights into carbon emissions data
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="powerbi-card mb-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Power BI Dashboard Coming Soon</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              We're working on integrating advanced Power BI dashboards to provide you with 
              deeper insights into carbon emissions patterns, trends, and predictive analytics.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Database className="w-4 h-4" />
              <span className="text-sm">Enterprise Analytics Platform</span>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="powerbi-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Planned Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Time Series Analysis</h4>
                    <p className="text-sm text-gray-600">Track emissions trends over months and years</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Predictive Modeling</h4>
                    <p className="text-sm text-gray-600">AI-powered forecasting of future emissions</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Regional Comparisons</h4>
                    <p className="text-sm text-gray-600">Compare emissions across different geographic regions</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Impact Scenarios</h4>
                    <p className="text-sm text-gray-600">Model the impact of different reduction strategies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="powerbi-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Real-time Data Sync</h4>
                    <p className="text-sm text-gray-600">Live updates from your carbon tracking</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">External Data Sources</h4>
                    <p className="text-sm text-gray-600">Integration with utility companies and transport APIs</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Custom Dashboards</h4>
                    <p className="text-sm text-gray-600">Build personalized analytics views</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Export & Sharing</h4>
                    <p className="text-sm text-gray-600">Share insights with teams and organizations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Dashboard */}
        <Card className="powerbi-card">
          <CardHeader>
            <CardTitle>Dashboard Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Power BI Dashboard</p>
                <p className="text-sm">Integration coming soon...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}