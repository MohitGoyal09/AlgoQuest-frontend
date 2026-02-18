import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, Database, Shield, Zap } from "lucide-react"

export function FeaturesBentoGrid() {
  const features = [
    {
      title: "Safety Valve",
      description: "Detect burnout signals before they impact your team. Sentinel monitors patterns to provide early warnings.",
      Icon: Shield,
      className: "md:col-span-2 md:row-span-2",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      glowColor: "bg-red-500/20"
    },
    {
      title: "Talent Scout",
      description: "Identify hidden high-performers and unearth potential leaders within your organization.",
      Icon: Zap,
      className: "md:col-span-1 md:row-span-1",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      glowColor: "bg-yellow-500/20"
    },
    {
      title: "Culture Thermometer",
      description: "Gauge team morale and engagement in real-time with anonymous feedback.",
      Icon: BarChart3,
      className: "md:col-span-1 md:row-span-1",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      glowColor: "bg-blue-500/20"
    },
    {
      title: "Integrations",
      description: "Connect with GitHub, Jira, Slack, and more.",
      Icon: Database,
      className: "md:col-span-2 md:row-span-1",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      glowColor: "bg-purple-500/20"
    },
  ]

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Everything you need to <span className="text-green-500">empower your team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sentinel provides the tools to understand, protect, and grow your engineering organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 max-w-5xl mx-auto min-h-[600px]">
           {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-8 rounded-3xl bg-card border hover:border-green-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-green-500/10",
                feature.className,
                feature.borderColor
              )}
            >
              <div
                className={cn(
                  "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  feature.glowColor
                )}
              />
              
              <div className="relative z-10">
                <div className={cn("inline-flex p-3 rounded-xl mb-4 border", feature.bgColor, feature.borderColor)}>
                  <feature.Icon className={cn("h-6 w-6", feature.iconColor)} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>

              <div className="relative z-10 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 pt-4">
                <span className={cn("text-sm font-medium flex items-center gap-1", feature.iconColor)}>
                  Learn more <span className="text-xs">→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
