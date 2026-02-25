import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, Zap, Heart, Network, ArrowRight, TrendingUp, Users, Eye, Lock, MessageSquare, Target, Sparkles } from "lucide-react"

export function FeaturesBentoGrid() {
  const features = [
    {
      title: "Safety Valve",
      description: "Detect burnout signals before they impact your team. Our AI monitors patterns to provide early warnings and actionable insights.",
      Icon: Shield,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      stats: "94% accuracy"
    },
    {
      title: "Talent Scout",
      description: "Identify hidden high-performers and unearth potential leaders within your organization through network analysis.",
      Icon: Zap,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      stats: "3.2x discovery"
    },
    {
      title: "Culture Engine",
      description: "Gauge team morale and engagement in real-time with anonymous feedback and sentiment analysis.",
      Icon: Heart,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      stats: "Real-time"
    },
    {
      title: "Network Analysis",
      description: "Understand communication patterns and identify key connectors in your organization.",
      Icon: Network,
      iconColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      stats: "Deep insights"
    },
  ]

  const benefits = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Employee data is always encrypted. No invasive tracking—only ethical, consent-based monitoring."
    },
    {
      icon: Eye,
      title: "Non-Invasive",
      description: "Works with existing tools without monitoring personal messages or screen activity."
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced machine learning models trained on thousands of workplace patterns."
    },
    {
      icon: Users,
      title: "Team Focused",
      description: "Built for managers who care about their people, not just metrics."
    }
  ]

  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container px-6 mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-green-500/30 text-green-400 bg-green-500/10">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Everything you need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400"> build healthier teams</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Sentinel provides the complete toolkit for understanding, protecting, and growing your engineering organization.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
          {features.map((feature, index) => (
            <Card key={index} className={cn(
              "group relative bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/20",
              "hover:-translate-y-1"
            )}>
              <CardContent className="p-6">
                <div className={cn("inline-flex p-3 rounded-xl mb-4 border", feature.bgColor, feature.borderColor)}>
                  <feature.Icon className={cn("h-6 w-6", feature.iconColor)} />
                </div>
                <div className="text-sm font-medium text-slate-500 mb-2">{feature.stats}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">{benefit.title}</h4>
                  <p className="text-slate-400 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
