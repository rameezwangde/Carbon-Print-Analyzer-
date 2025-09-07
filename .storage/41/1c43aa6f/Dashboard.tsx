import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CarbonCalculator } from '../services/carbonCalculator';
import { MLRecommender } from '../services/mlRecommender';
import { CATEGORY_NAMES } from '../config/constants';
import { CarbonCategories, Recommendation } from '../types';
import { TrendingUp, TrendingDown, Users, Lightbulb, Map } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SurveyData {
  categories: CarbonCategories;
  totalCO2: number;
  timestamp: string;
  location: {
    lat?: number;
    lng?: number;
    city?: string;
    country?: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // Load survey data from localStorage
    const data = localStorage.getItem('carbonSurvey');
    if (data) {
      const parsed = JSON.parse(data) as SurveyData;
      setSurveyData(parsed);
      
      // Get ML recommendations
      const recs = MLRecommender.getPersonalizedRecommendations(parsed.categories);
      setRecommendations(recs);
    } else {
      navigate('/survey');
    }
  }, [navigate]);

  useEffect(() => {
    if (!surveyData) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".dashboard-header", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(".dashboard-card", 
        { opacity: 0, y: 50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.2, 
          delay: 0.3,
          ease: "back.out(1.7)"
        }
      );

      gsap.fromTo(".recommendation-item", 
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 1,
          ease: "power2.out"
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [surveyData]);

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  const { categories, totalCO2 } = surveyData;
  const categoryBreakdown = CarbonCalculator.getCategoryBreakdown(categories);
  const topCategory = CarbonCalculator.getTopCategory(categories);
  const communityStats = MLRecommender.getCommunityStats();

  // Pie chart data
  const pieData = {
    labels: categoryBreakdown.map(item => CATEGORY_NAMES[item.category]),
    datasets: [
      {
        data: categoryBreakdown.map(item => item.co2),
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
          '#EF4444', '#06B6D4', '#84CC16', '#F97316'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Bar chart data (comparison with community)
  const barData = {
    labels: ['Your Emissions', 'Community Median', 'Community 75th %'],
    datasets: [
      {
        label: 'CO₂ Emissions (kg/month)',
        data: [totalCO2, communityStats.median, communityStats.percentile75],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.02'%3E%3Cpath d='M50 50c13.8 0 25-11.2 25-25S63.8 0 50 0 25 11.2 25 25s11.2 25 25 25zm25 25c13.8 0 25-11.2 25-25S88.8 50 75 50 50 61.2 50 75s11.2 25 25 25zM25 75c13.8 0 25-11.2 25-25S38.8 25 25 25 0 36.2 0 50s11.2 25 25 25z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/10 to-green-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-green-200/10 to-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <div className="dashboard-header text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Carbon Dashboard</h1>
          <p className="text-gray-600 leading-relaxed">
            Insights and recommendations based on your Mumbai lifestyle footprint
          </p>
        </div>

        {/* Top Category Alert */}
        <Card className="dashboard-card mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Top Emitting Category</h3>
                <p className="text-blue-100">
                  <span className="font-bold text-xl">{CATEGORY_NAMES[topCategory.category]}</span>
                  {' '}accounts for <span className="font-bold">{topCategory.percentage.toFixed(1)}%</span> of your emissions
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="dashboard-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Your Emissions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Pie data={pieData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="dashboard-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mumbai Community Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={barData} options={chartOptions} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Based on {communityStats.count} users in your area
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="dashboard-card mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI-Powered Mumbai Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.id} className="recommendation-item p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(rec.difficulty)}>
                        {rec.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        -{rec.potential_reduction}kg CO₂
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate('/map')}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Map className="w-4 h-4" />
            View Community Map
          </Button>
          <Button 
            onClick={() => navigate('/survey')}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <TrendingDown className="w-4 h-4" />
            Update Survey
          </Button>
          <Button 
            onClick={() => navigate('/powerbi')}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <TrendingUp className="w-4 h-4" />
            Advanced Analytics
          </Button>
        </div>
      </div>

      <ChatBot currentPage="dashboard" />
    </div>
  );
}