import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Activity, 
  Network, 
  Users, 
  ArrowRight, 
  Heart,
  Brain,
  Zap,
  Lock,
  BarChart3,
  Bell,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Safety Valve',
    description: 'Real-time burnout risk assessment with velocity tracking and early warning indicators.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    href: '/dashboard',
  },
  {
    icon: Network,
    title: 'Talent Scout',
    description: 'Network analysis to identify hidden gems, key connectors, and knowledge transfer patterns.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    href: '/network',
  },
  {
    icon: Users,
    title: 'Culture Thermometer',
    description: 'Team-level contagion risk analysis with actionable recommendations for managers.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    href: '/team',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Connect',
    description: 'Integrate with your existing tools. Sentinel works with Slack, GitHub, Jira, and more.',
    icon: Zap,
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'Our AI engines continuously monitor patterns to detect early signs of burnout and disengagement.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Act',
    description: 'Receive actionable insights and nudges to support your team before issues escalate.',
    icon: Bell,
  },
];

const trustSignals = [
  { icon: Lock, text: 'Privacy-first by design' },
  { icon: CheckCircle2, text: 'GDPR & SOC2 compliant' },
  { icon: BarChart3, text: 'Real-time analytics' },
  { icon: TrendingUp, text: 'Proven ROI' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Sentinel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI-Powered Team Health</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Protect your team's{' '}
                  <span className="text-blue-600">wellbeing</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Sentinel uses AI to detect burnout early, identify hidden talent, 
                  and monitor team culture—before it's too late.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 h-12 px-6 text-base">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-6 pt-4">
                {trustSignals.map((signal) => (
                  <div key={signal.text} className="flex items-center gap-2 text-sm text-slate-500">
                    <signal.icon className="h-4 w-4" />
                    <span>{signal.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl shadow-xl border p-8">
                {/* Mock Dashboard Preview */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Team Health</p>
                        <p className="text-sm text-slate-500">Real-time monitoring</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Healthy
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Active', value: '24', color: 'text-green-600' },
                      { label: 'At Risk', value: '3', color: 'text-amber-600' },
                      { label: 'Critical', value: '1', color: 'text-red-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Recent Activity</p>
                    {[
                      { text: 'Sarah\'s velocity increased', time: '2m ago', type: 'positive' },
                      { text: 'Team sync completed', time: '15m ago', type: 'neutral' },
                      { text: 'Burnout risk detected', time: '1h ago', type: 'warning' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-700">{activity.text}</span>
                        <span className="text-xs text-slate-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Three engines, one mission
            </h2>
            <p className="text-lg text-slate-600">
              Sentinel combines three powerful AI engines to give you complete visibility 
              into your team's health and performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button variant="ghost" className="gap-2 p-0 h-auto hover:bg-transparent hover:gap-3 transition-all">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-600">
              Get started in minutes and start protecting your team's wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-slate-200">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to protect your team?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of engineering teams using Sentinel to build healthier, 
            more productive workplaces.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 h-12 px-8 text-base bg-blue-600 hover:bg-blue-700">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-700 text-white hover:bg-slate-800">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold text-white">Sentinel</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/network" className="hover:text-white transition-colors">Network</Link>
              <Link href="/team" className="hover:text-white transition-colors">Team</Link>
              <Link href="/simulation" className="hover:text-white transition-colors">Simulation</Link>
            </div>
            <p className="text-sm">© 2026 Sentinel AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
