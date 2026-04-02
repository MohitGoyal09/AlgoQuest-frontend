"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Zap,
  Shield,
  Heart,
  Network,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Calendar,
  MessageSquare,
  Brain,
  Activity,
  Users,
} from "lucide-react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
// @ts-ignore - canvas-confetti types
import confetti from "canvas-confetti"

interface DemoUser {
  user_hash: string
  email: string
  name: string
  persona_type: string
  description: string
  risk_level: string
  events_count: number
}

interface DemoResponse {
  success: boolean
  message: string
  users_created: number
  total_events: number
  users: DemoUser[]
  demo_mode: boolean
}

function OnboardingPageContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [demoData, setDemoData] = useState<DemoResponse | null>(null)

  const totalSteps = 4
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleLoadSampleData = async () => {
    setLoading(true)
    try {
      const response = await api.post<DemoResponse>("/demo/load-sample-data")
      setDemoData(response)
      setCurrentStep(2) // Move to step 3 (feature tour)
    } catch (error: any) {
      console.error("Failed to load sample data:", error)
      alert(error.response?.data?.detail || "Failed to load sample data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
    })

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      router.push("/dashboard?demo=true")
    }, 1500)
  }

  const steps = [
    // Step 0: Welcome
    {
      title: "Welcome to AlgoQuest",
      subtitle: "Your AI-Powered Employee Insight Engine",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Detect Burnout Before It Happens</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              AlgoQuest uses AI to analyze behavioral patterns and identify at-risk employees
              30 days before crisis, enabling proactive intervention.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardContent className="pt-6">
                <Shield className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-semibold mb-1">Safety Valve</h3>
                <p className="text-sm text-muted-foreground">
                  Detect burnout risk escalation using velocity metrics and behavioral signals
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <Zap className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold mb-1">Talent Scout</h3>
                <p className="text-sm text-muted-foreground">
                  Discover hidden gems through network analysis and unblocking patterns
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <Heart className="w-8 h-8 text-pink-500 mb-3" />
                <h3 className="font-semibold mb-1">Culture Thermometer</h3>
                <p className="text-sm text-muted-foreground">
                  Predict resignation contagion using SIR epidemic modeling
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Try Our Interactive Demo</p>
                <p className="text-xs text-muted-foreground">
                  Load sample data with 4 realistic employee personas to explore all features instantly.
                  No setup required.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 1: Load Sample Data
    {
      title: "Load Sample Data",
      subtitle: "One-click demo environment setup",
      content: (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Setting up your demo environment...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Creating 4 personas with 30 days of behavioral data
              </p>
              <div className="max-w-md mx-auto space-y-2 text-xs text-left text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Generating employee profiles...
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Creating behavioral event history...
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating risk scores and network metrics...
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Load 4 Realistic Employee Personas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Each persona includes 30 days of realistic behavioral patterns
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    name: "Sarah Chen",
                    role: "High Performer",
                    icon: Zap,
                    color: "text-emerald-500",
                    bgColor: "bg-emerald-500/10",
                    description: "Steady contributor, low risk",
                  },
                  {
                    name: "Michael Rodriguez",
                    role: "Burnout Risk",
                    icon: Shield,
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    description: "High meeting load, declining engagement",
                  },
                  {
                    name: "Emily Zhang",
                    role: "Flight Risk",
                    icon: TrendingUp,
                    color: "text-amber-500",
                    bgColor: "bg-amber-500/10",
                    description: "Declining sentiment, contagion pattern",
                  },
                  {
                    name: "David Kim",
                    role: "Hidden Gem",
                    icon: Heart,
                    color: "text-purple-500",
                    bgColor: "bg-purple-500/10",
                    description: "High potential, healthy boundaries",
                  },
                ].map((persona, idx) => (
                  <Card key={idx} className="border-2">
                    <CardContent className="pt-4">
                      <div className={`w-10 h-10 rounded-lg ${persona.bgColor} flex items-center justify-center mb-3`}>
                        <persona.icon className={`w-5 h-5 ${persona.color}`} />
                      </div>
                      <div className="font-semibold mb-1">{persona.name}</div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {persona.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{persona.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">What you'll get:</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">900+ Events</div>
                      <div className="text-muted-foreground">Commits, messages, reviews</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">30 Days History</div>
                      <div className="text-muted-foreground">Risk scores & trends</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Network className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Network Graph</div>
                      <div className="text-muted-foreground">Team collaboration patterns</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">AI Insights</div>
                      <div className="text-muted-foreground">Ready for Ask Sentinel</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLoadSampleData}
                size="lg"
                className="w-full"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Load Sample Data
              </Button>
            </>
          )}
        </div>
      ),
    },
    // Step 2: Feature Tour
    {
      title: "Explore Key Features",
      subtitle: "Discover what AlgoQuest can do",
      content: (
        <div className="space-y-6">
          {demoData && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Demo Data Loaded Successfully!
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Created {demoData.users_created} users with {demoData.total_events.toLocaleString()} behavioral events
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">What to explore:</h3>

            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Safety Valve Dashboard</CardTitle>
                    <CardDescription className="text-xs">
                      Real-time burnout risk monitoring
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>View Michael's escalating burnout pattern (LOW → ELEVATED → CRITICAL)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Explore 30-day risk trend charts and velocity metrics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Network className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Talent Scout Network</CardTitle>
                    <CardDescription className="text-xs">
                      Discover hidden gems and connectors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Find Sarah as a high-betweenness network connector</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>View unblocking patterns and knowledge transfer scores</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ask Sentinel AI Chat</CardTitle>
                    <CardDescription className="text-xs">
                      Natural language insights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Ask "Who is at highest burnout risk?" to see Michael's profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Query "Find team connectors" to discover Sarah</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    // Step 3: Complete
    {
      title: "You're All Set!",
      subtitle: "Ready to explore AlgoQuest",
      content: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Onboarding Complete!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your demo environment is ready. Explore the dashboard to see AlgoQuest in action.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Start Guide
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Navigate to Team Dashboard</div>
                  <div className="text-muted-foreground text-xs">
                    View all 4 personas and their current risk levels
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Click on Michael Rodriguez</div>
                  <div className="text-muted-foreground text-xs">
                    See the burnout escalation pattern and AI recommendations
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Try Ask Sentinel</div>
                  <div className="text-muted-foreground text-xs">
                    Ask natural language questions about your team's health
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-card border rounded-lg p-3">
              <Users className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">4 Personas</div>
              <div className="text-muted-foreground">Ready to explore</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <Activity className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">900+ Events</div>
              <div className="text-muted-foreground">30 days of data</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <Brain className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">AI Insights</div>
              <div className="text-muted-foreground">Powered by GPT-4</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <Shield className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">Privacy First</div>
              <div className="text-muted-foreground">Metadata only</div>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full"
          >
            Enter Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="gap-2">
                <Sparkles className="w-3 h-3" />
                Demo Setup
              </Badge>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
                  <CardDescription>{steps[currentStep].subtitle}</CardDescription>
                </CardHeader>
                <CardContent>{steps[currentStep].content}</CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < totalSteps - 1 && currentStep !== 1 && (
              <Button
                onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                disabled={loading}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {currentStep === 0 && (
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Skip Demo
              </Button>
            )}

            {currentStep === 1 && !loading && (
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Skip this step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingPageContent />
    </ProtectedRoute>
  )
}
