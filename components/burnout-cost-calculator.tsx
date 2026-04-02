"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Info,
  Download,
  Share2,
  Calculator
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BurnoutCostCalculatorProps {
  criticalCount?: number
  elevatedCount?: number
  className?: string
  autoFetch?: boolean
}

interface Industry {
  key: string
  name: string
  turnover_multiplier: number
  productivity_multiplier: number
}

const INDUSTRIES: Industry[] = [
  { key: "tech", name: "Technology", turnover_multiplier: 1.5, productivity_multiplier: 0.3 },
  { key: "finance", name: "Financial Services", turnover_multiplier: 2.0, productivity_multiplier: 0.4 },
  { key: "healthcare", name: "Healthcare", turnover_multiplier: 1.8, productivity_multiplier: 0.35 },
  { key: "retail", name: "Retail", turnover_multiplier: 1.2, productivity_multiplier: 0.25 },
  { key: "manufacturing", name: "Manufacturing", turnover_multiplier: 1.3, productivity_multiplier: 0.28 },
  { key: "education", name: "Education", turnover_multiplier: 1.4, productivity_multiplier: 0.3 },
  { key: "default", name: "General", turnover_multiplier: 1.5, productivity_multiplier: 0.3 }
]

/**
 * Animated counter hook for smooth number transitions
 */
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let animationFrameId: number
    const startTime = Date.now()
    const startValue = current

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const value = startValue + (target - startValue) * easeOutQuart

      setCurrent(value)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return current
}

/**
 * Format currency with K/M suffixes
 */
function formatCurrency(value: number, decimals: number = 0): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}K`
  }
  return `$${value.toFixed(0)}`
}

export function BurnoutCostCalculator({
  criticalCount = 1,
  elevatedCount = 2,
  className,
  autoFetch = false
}: BurnoutCostCalculatorProps) {
  const [avgSalary, setAvgSalary] = useState(120000)
  const [selectedIndustry, setSelectedIndustry] = useState("tech")
  const [userAdjusted, setUserAdjusted] = useState(false)
  const [manualHighRisk, setManualHighRisk] = useState(criticalCount)
  const [manualElevated, setManualElevated] = useState(elevatedCount)

  // Use props directly or user-adjusted manual values
  const actualHighRisk = userAdjusted ? manualHighRisk : criticalCount
  const actualElevated = userAdjusted ? manualElevated : elevatedCount

  const industry = INDUSTRIES.find(i => i.key === selectedIndustry) || INDUSTRIES[0]

  const calculations = useMemo(() => {
    // Constants
    const CRITICAL_TURNOVER_PROBABILITY = 0.65
    const ELEVATED_TURNOVER_PROBABILITY = 0.25
    const PRODUCTIVITY_LOSS_MONTHS = 3
    const INTERVENTION_SUCCESS_RATE = 0.70
    const INTERVENTION_COST_PER_PERSON = 2000

    // Critical employees
    const criticalReplacementCost =
      actualHighRisk * avgSalary * industry.turnover_multiplier * CRITICAL_TURNOVER_PROBABILITY
    const criticalProductivityLoss =
      actualHighRisk * (avgSalary / 12) * PRODUCTIVITY_LOSS_MONTHS * industry.productivity_multiplier

    // Elevated employees (reduced impact)
    const elevatedReplacementCost =
      actualElevated * avgSalary * industry.turnover_multiplier * ELEVATED_TURNOVER_PROBABILITY
    const elevatedProductivityLoss =
      actualElevated * (avgSalary / 12) * (PRODUCTIVITY_LOSS_MONTHS / 2) * industry.productivity_multiplier

    const totalReplacementCost = criticalReplacementCost + elevatedReplacementCost
    const totalProductivityLoss = criticalProductivityLoss + elevatedProductivityLoss
    const potentialCost = totalReplacementCost + totalProductivityLoss

    // With intervention
    const interventionCost = (actualHighRisk + actualElevated) * INTERVENTION_COST_PER_PERSON
    const preventedCost = potentialCost * INTERVENTION_SUCCESS_RATE
    const savings = preventedCost - interventionCost
    const roi = interventionCost > 0 ? (savings / interventionCost * 100) : 0

    return {
      potentialCost,
      interventionCost,
      savings,
      roi,
      breakdown: {
        replacementCost: totalReplacementCost,
        productivityLoss: totalProductivityLoss,
        criticalImpact: criticalReplacementCost + criticalProductivityLoss,
        elevatedImpact: elevatedReplacementCost + elevatedProductivityLoss
      }
    }
  }, [avgSalary, industry, actualHighRisk, actualElevated])

  // Animated values for impact
  const animatedCost = useAnimatedCounter(calculations.potentialCost, 1200)
  const animatedSavings = useAnimatedCounter(calculations.savings, 1200)
  const animatedROI = useAnimatedCounter(calculations.roi, 1200)

  const handleExport = () => {
    const report = `
Burnout Cost Calculator Report
Generated: ${new Date().toLocaleDateString()}

INPUTS:
- High Risk Employees: ${actualHighRisk}
- Elevated Risk Employees: ${actualElevated}
- Average Salary: ${formatCurrency(avgSalary)}
- Industry: ${industry.name}

CALCULATIONS:
- Potential Cost (Without Intervention): ${formatCurrency(calculations.potentialCost)}
- Intervention Cost: ${formatCurrency(calculations.interventionCost)}
- Potential Savings: ${formatCurrency(calculations.savings)}
- ROI: ${calculations.roi.toFixed(0)}%

BREAKDOWN:
- Replacement Costs: ${formatCurrency(calculations.breakdown.replacementCost)}
- Productivity Loss: ${formatCurrency(calculations.breakdown.productivityLoss)}
- Critical Employee Impact: ${formatCurrency(calculations.breakdown.criticalImpact)}
- Elevated Employee Impact: ${formatCurrency(calculations.breakdown.elevatedImpact)}

Note: Assumes 70% intervention success rate based on industry research.
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `burnout-roi-${new Date().getTime()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareText = `Burnout Prevention ROI: ${formatCurrency(calculations.savings)} savings with ${calculations.roi.toFixed(0)}% ROI by preventing ${actualHighRisk + actualElevated} employees from burning out.`

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch (err) {
      }
    } else {
      navigator.clipboard.writeText(shareText)
      alert('ROI summary copied to clipboard!')
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Burnout Cost Calculator
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Calculate the financial impact of preventing employee burnout
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {actualHighRisk + actualElevated} at risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="space-y-4">
          {/* Employee Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-risk" className="text-xs text-muted-foreground">
                  High Risk
                </Label>
                <span className="text-sm font-mono font-semibold text-red-400">
                  {actualHighRisk}
                </span>
              </div>
              <Slider
                id="high-risk"
                min={0}
                max={20}
                step={1}
                value={[actualHighRisk]}
                onValueChange={(v) => {
                  setManualHighRisk(v[0])
                  setUserAdjusted(true)
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="elevated" className="text-xs text-muted-foreground">
                  Elevated Risk
                </Label>
                <span className="text-sm font-mono font-semibold text-amber-400">
                  {actualElevated}
                </span>
              </div>
              <Slider
                id="elevated"
                min={0}
                max={20}
                step={1}
                value={[actualElevated]}
                onValueChange={(v) => {
                  setManualElevated(v[0])
                  setUserAdjusted(true)
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Average Salary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="salary" className="text-xs text-muted-foreground">
                Avg Employee Salary
              </Label>
              <span className="text-sm font-mono font-semibold">
                {formatCurrency(avgSalary)}
              </span>
            </div>
            <Slider
              id="salary"
              min={60000}
              max={250000}
              step={10000}
              value={[avgSalary]}
              onValueChange={(v) => setAvgSalary(v[0])}
              className="w-full"
            />
          </div>

          {/* Industry Selector */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-xs text-muted-foreground">
              Industry
            </Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger id="industry" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(ind => (
                  <SelectItem key={ind.key} value={ind.key}>
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Big Impact Numbers */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          {/* Potential Cost */}
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs font-medium text-muted-foreground">
                  Potential Cost (No Action)
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Estimated cost of turnover and productivity loss if at-risk employees
                        burn out without intervention.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono">
              {formatCurrency(animatedCost, 1)}
            </div>
          </div>

          {/* Potential Savings */}
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-muted-foreground">
                  Potential Savings (With Intervention)
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Expected savings from preventing burnout through early intervention,
                        minus intervention costs. Assumes 70% success rate.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-400 font-mono">
              {formatCurrency(animatedSavings, 1)}
            </div>
          </div>

          {/* ROI */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-semibold text-foreground">Return on Investment</span>
            <Badge variant="outline" className="text-base font-mono px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-1.5 text-primary" />
              {animatedROI.toFixed(0)}%
            </Badge>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide">
              COST BREAKDOWN
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs mb-2 font-semibold">Calculation Details:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Replacement: {industry.turnover_multiplier}x salary</li>
                    <li>• Productivity: {industry.productivity_multiplier}x salary over 3 months</li>
                    <li>• Critical risk: 65% turnover probability</li>
                    <li>• Elevated risk: 25% turnover probability</li>
                    <li>• Intervention: $2,000 per person</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Replacement Costs</span>
              <span className="font-mono font-medium">
                {formatCurrency(calculations.breakdown.replacementCost, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Productivity Loss</span>
              <span className="font-mono font-medium">
                {formatCurrency(calculations.breakdown.productivityLoss, 1)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Intervention Cost</span>
              <span className="font-mono font-medium">
                {formatCurrency(calculations.interventionCost, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Critical Impact</span>
              <span className="font-mono font-medium text-red-400">
                {formatCurrency(calculations.breakdown.criticalImpact, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elevated Impact</span>
              <span className="font-mono font-medium text-amber-400">
                {formatCurrency(calculations.breakdown.elevatedImpact, 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Calculations based on industry research benchmarks. Assumes 70% intervention
            success rate for preventing burnout-related turnover. Actual results vary
            by organization size, culture, and intervention quality.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
