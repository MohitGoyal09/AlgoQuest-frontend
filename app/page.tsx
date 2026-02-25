import { FeaturesBentoGrid } from "@/components/landing-page/features-bento-grid"
import { LandingFooter } from "@/components/landing-page/footer"
import { LandingHero } from "@/components/landing-page/hero"
import { LandingNavbar } from "@/components/landing-page/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Shield, Zap, Heart, Users, MessageSquare, Play, Star } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Tools",
      description: "Integrate with GitHub, Slack, Jira, and more. We only analyze work patterns—never personal messages.",
      icon: Zap
    },
    {
      number: "02", 
      title: "AI Analysis",
      description: "Our machine learning models identify risk signals and hidden talent patterns automatically.",
      icon: Heart
    },
    {
      number: "03",
      title: "Get Insights",
      description: "Receive actionable insights, early warnings, and personalized recommendations.",
      icon: Shield
    },
    {
      number: "04",
      title: "Take Action",
      description: "Use these insights to prevent burnout, recognize top performers, and build a healthier culture.",
      icon: Users
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering",
      company: "TechCorp",
      content: "Sentinel helped us identify burnout risk in 3 team members before it became a problem. We saved months of potential productivity loss.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Engineering Manager", 
      company: "StartupXYZ",
      content: "The hidden talent discovery feature found an incredible engineer who'd been quietly excelling. She's now leading our platform team.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "CTO",
      company: "ScaleUp Inc",
      content: "Finally, a tool that actually helps managers care for their teams without being invasive. Our retention improved by 40%.",
      avatar: "ER"
    }
  ]

  const logos = ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Arc"]

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col font-sans">
      <LandingNavbar />
      
      <main className="flex-1 w-full">
        <LandingHero />
        <FeaturesBentoGrid />
        
        {/* How It Works Section */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="container px-6 mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400 bg-blue-500/10">
                How It Works
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-6">
                Get started in <span className="text-blue-400">minutes</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Four simple steps to transform how you understand and manage your team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 h-full">
                    <div className="text-6xl font-bold text-slate-700/50 mb-4">{step.number}</div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                      <step.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 h-6 w-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-slate-950">
          <div className="container px-6 mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-green-500/30 text-green-400 bg-green-500/10">
                <Star className="w-3 h-3 mr-1" />
                Loved by Engineering Leaders
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-6">
                Trusted by teams everywhere
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="bg-slate-900/80 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-green-500 text-green-500" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="py-12 bg-slate-950 border-y border-slate-800">
          <div className="container px-6 mx-auto">
            <p className="text-center text-sm text-slate-500 mb-8">TRUSTED BY TEAMS AT</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
              {logos.map((logo, i) => (
                <span key={i} className="text-xl font-bold text-slate-400">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#0b101b] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)]" />
          <div className="container px-6 mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your team?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Join thousands of engineering leaders using Sentinel to build healthier, happier, and more productive teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg shadow-green-600/25 transition-all duration-300 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-lg transition-all duration-300">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
