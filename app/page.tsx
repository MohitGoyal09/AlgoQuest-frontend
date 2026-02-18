import { FeaturesBentoGrid } from "@/components/landing-page/features-bento-grid"
import { LandingFooter } from "@/components/landing-page/footer"
import { LandingHero } from "@/components/landing-page/hero"
import { LandingNavbar } from "@/components/landing-page/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <LandingNavbar />
      
      <main className="flex-1 w-full">
        <LandingHero />
        <FeaturesBentoGrid />
        
        {/* Placeholder for Interactive Demo or CTA Section */}
        <section className="py-24 bg-slate-900 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="container px-6 mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Ready to transform your team?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of engineering leaders using Sentinel to build healthier, happier, and more productive teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register" className="inline-flex h-12 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-8 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                Start for free
              </a>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
