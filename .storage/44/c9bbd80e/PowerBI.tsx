import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatBot } from '../components/ChatBot';

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
    <div 
      ref={containerRef} 
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%),
          url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='0.02'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-rule='nonzero'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/10 to-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="powerbi-header mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Analytics</h1>
          <p className="text-gray-600 leading-relaxed">
            Power BI integration for deeper insights into Mumbai carbon emissions data
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="powerbi-card mb-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Power BI Dashboard Coming Soon</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              We're working on integrating advanced Power BI dashboards to provide you with 
              deeper insights into Mumbai's carbon emissions patterns, trends, and predictive analytics.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Database className="w-4 h-4" />
              <span className="text-sm">Enterprise Analytics Platform</span>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="powerbi-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Planned Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="feature-item flex items-start gap-3 p-3 bg-blue-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Mumbai Time Series Analysis</h4>
                    <p className="text-sm text-gray-600">Track emissions trends across Mumbai and Navi Mumbai over months and years</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-green-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">AI Predictive Modeling</h4>
                    <p className="text-sm text-gray-600">ML-powered forecasting of future emissions based on Mumbai lifestyle patterns</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-purple-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Regional Comparisons</h4>
                    <p className="text-sm text-gray-600">Compare emissions across Mumbai, Navi Mumbai, Pune, and other Indian cities</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-orange-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Local Impact Scenarios</h4>
                    <p className="text-sm text-gray-600">Model the impact of Mumbai Metro, local trains, and other green initiatives</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="powerbi-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="feature-item flex items-start gap-3 p-3 bg-blue-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Real-time Mumbai Data</h4>
                    <p className="text-sm text-gray-600">Live updates from your carbon tracking and Mumbai community insights</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-green-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Local Data Sources</h4>
                    <p className="text-sm text-gray-600">Integration with MSEB, Mumbai Metro, and local transport APIs</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-purple-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Custom Mumbai Dashboards</h4>
                    <p className="text-sm text-gray-600">Build personalized analytics views for Mumbai lifestyle patterns</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-start gap-3 p-3 bg-orange-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Community Sharing</h4>
                    <p className="text-sm text-gray-600">Share insights with Mumbai environmental groups and organizations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Dashboard */}
        <Card className="powerbi-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle>Mumbai Analytics Dashboard Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-lg h-64 flex items-center justify-center shadow-inner">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Power BI Mumbai Dashboard</p>
                <p className="text-sm">Advanced analytics integration coming soon...</p>
                <p className="text-xs text-gray-400 mt-2">Featuring Mumbai-specific insights and recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChatBot currentPage="powerbi" />
    </div>
  );
}