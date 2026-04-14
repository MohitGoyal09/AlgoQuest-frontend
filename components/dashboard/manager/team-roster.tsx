"use client"

import { useState } from "react"
import { Eye, Shield, Target, TrendingUp, Users } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Employee, RiskLevel } from "@/types"
import { RiskAssessment } from "@/components/risk-assessment"
import { SkillsRadar } from "@/components/skills-radar"

interface TeamRosterProps {
  employees: Employee[]
}

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  ELEVATED: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  CRITICAL: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
}

export function TeamRoster({ employees }: TeamRosterProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  return (
    <div className="rounded-md border border-border bg-card/40 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-slate-800/50">
            <TableHead className="w-[100px]">User Hash</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Burnout Risk</TableHead>
            <TableHead>Connection Index</TableHead>
            <TableHead>Velocity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.user_hash} className="border-border hover:bg-slate-800/50">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {employee.user_hash?.slice(0, 8)}...
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{employee.role}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`border-0 ${RISK_COLORS[employee.risk_level] || RISK_COLORS.LOW}`}
                >
                  {employee.risk_level}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(employee.belongingness_score || 0) * 100} 
                    className="h-2 w-[60px] bg-slate-800"
                    indicatorColor="bg-blue-500"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {((employee.belongingness_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-1 text-xs font-mono">
                    <TrendingUp className="h-3 w-3 text-slate-500" />
                    {employee.velocity?.toFixed(2) || "0.00"}
                 </div>
              </TableCell>
              <TableCell className="text-right">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedEmployee(employee)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px] border-l border-border bg-slate-950 backdrop-blur-xl p-0 overflow-y-auto">
                    {selectedEmployee && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="p-6 border-b border-border bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                           <SheetHeader>
                              <div className="flex items-center justify-between">
                                 <SheetTitle className="text-foreground flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Employee Profile
                                 </SheetTitle>
                                 <Badge variant="outline" className="font-mono text-xs border-border">
                                    {selectedEmployee.user_hash.slice(0, 12)}
                                 </Badge>
                              </div>
                              <SheetDescription>
                                 Detailed performance and wellbeing analysis
                              </SheetDescription>
                           </SheetHeader>
                        </div>

                        <div className="px-6 pb-6 space-y-6">
                           {/* 1. Personal Skills Graph */}
                           <div className="rounded-lg border border-border bg-slate-900/40 p-4">
                              <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-purple-400">
                                 <Target className="h-4 w-4" /> Personal Skill Topology
                              </h4>
                              <div className="flex justify-center">
                                 {/* Assuming SkillsRadar can handle no data gracefully */}
                                 <SkillsRadar 
                                    data={{ technical: 80, communication: 70, leadership: 60, collaboration: 85, adaptability: 75, creativity: 65 }} 
                                    height={300} 
                                 />
                              </div>
                           </div>

                           {/* 2. Full Risk Assessment */}
                           <div className="rounded-lg border border-border bg-slate-900/40">
                              <RiskAssessment employee={selectedEmployee} />
                           </div>
                        </div>

                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
