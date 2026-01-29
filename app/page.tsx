import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, Network, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Sentinel</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            AI-powered employee insights engine for privacy-first burnout detection,
            network analysis, and team health monitoring.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="flex-1 py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Activity className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Safety Valve</CardTitle>
                <CardDescription>
                  Real-time burnout risk assessment with velocity tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">View Dashboard</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Network className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Talent Scout</CardTitle>
                <CardDescription>
                  Network visualization to identify hidden gems and key connectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/network">
                  <Button variant="outline" className="w-full">Explore Network</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Culture Thermometer</CardTitle>
                <CardDescription>
                  Team-level contagion risk analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/team">
                  <Button variant="outline" className="w-full">View Team</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle>Simulation</CardTitle>
                <CardDescription>
                  Create personas and inject events for testing scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/simulation">
                  <Button variant="outline" className="w-full">Run Simulation</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>Sentinel AI Employee Insights Engine v1.0</p>
          <p className="text-sm mt-2">Privacy-first • Real-time • Actionable</p>
        </div>
      </footer>
    </div>
  );
}
