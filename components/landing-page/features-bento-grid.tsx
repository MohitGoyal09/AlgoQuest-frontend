import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity, Users, Thermometer, Lock, Eye, Sparkles, Users2, ArrowUpRight } from "lucide-react"

export function FeaturesBentoGrid() {
  const features = [
    {
      title: "Safety Valve",
      subtitle: "Burnout Detection",
      description:
        "Linear regression on daily activity. Shannon entropy on work hours. Response rate for social engagement. Three signals, one risk score.",
      Icon: Activity,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      cardBg: "bg-destructive/5",
      stat: "R² confidence on every alert",
    },
    {
      title: "Talent Scout",
      subtitle: "Hidden Gem Discovery",
      description:
        "NetworkX centrality analysis finds people who bridge disconnected teams. High betweenness, low eigenvector, frequent unblocking — invisible to traditional metrics.",
      Icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      cardBg: "bg-primary/5",
      stat: "Graph-based network analysis",
    },
    {
      title: "Culture Thermometer",
      subtitle: "Team Health & Contagion",
      description:
        "SIR epidemiological model adapted from public health. Detects when burnout spreads across a team like a contagion. R₀ > 1.0 means epidemic growth.",
      Icon: Thermometer,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      cardBg: "bg-amber-500/5",
      stat: "SIR epidemic modeling",
    },
  ]

  const benefits = [
    {
      icon: Lock,
      title: "Privacy by Physics",
      description:
        "Two separate database vaults. No foreign keys between them. Identity resolution impossible without the vault key.",
    },
    {
      icon: Eye,
      title: "Metadata Only",
      description:
        "Timestamps, counts, and network structure. We never see message content, code, or files.",
    },
    {
      icon: Sparkles,
      title: "Deterministic Sandwich",
      description:
        "Math makes decisions. AI writes text. Python validation → NumPy/SciPy analysis → LLM narration.",
    },
    {
      icon: Users2,
      title: "Employee First",
      description:
        "Employees see their own wellbeing. Managers see anonymized trends. Identity reveal requires audit-logged consent.",
    },
  ]

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container px-6 mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">
            <Sparkles className="w-3 h-3 mr-1" />
            Three Engines
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Three engines.{" "}
            <span className="text-primary">One mission.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Built for managers who care about people, not just metrics.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-20 stagger-children">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "group relative overflow-hidden border-border/50 backdrop-blur-sm",
                "hover:border-border transition-colors duration-150",
                feature.cardBg
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl", feature.iconBg)}>
                    <feature.Icon className={cn("h-5 w-5", feature.iconColor)} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm font-medium text-muted-foreground mb-2">{feature.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto stagger-children">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex gap-4 p-5 rounded-xl border border-border/50 bg-card/30 hover:border-border transition-colors duration-150"
            >
              <div className="flex-shrink-0 p-2.5 h-fit rounded-lg bg-primary/8">
                <benefit.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
