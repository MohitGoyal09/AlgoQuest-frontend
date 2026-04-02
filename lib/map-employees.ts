import { Employee, RiskIndicators, UserSummary, toRiskLevel } from "@/types"

/**
 * Maps a raw UserSummary (from the API / useUsers hook) to the
 * fully-typed Employee shape expected by engine page components.
 *
 * This is a pure function -- no hooks, no side-effects.
 */
export function mapUserToEmployee(u: UserSummary): Employee {
  return {
    user_hash: u.user_hash,
    name: u.name || `User ${u.user_hash.slice(0, 4)}`,
    role: u.role || "Engineer",
    risk_level: toRiskLevel(u.risk_level),
    velocity: u.velocity || 0,
    confidence: u.confidence || 0,
    belongingness_score: u.belongingness_score ?? 0.5,
    circadian_entropy: u.circadian_entropy ?? 0.5,
    updated_at: u.updated_at || new Date().toISOString(),
    persona: "Engineer",
    indicators: {
      overwork: u.overwork ?? false,
      isolation: u.isolation ?? false,
      fragmentation: u.fragmentation ?? false,
      late_night_pattern: u.late_night_pattern ?? false,
      weekend_work: u.weekend_work ?? false,
      communication_decline: u.communication_decline ?? false,
    },
  }
}

/**
 * Convenience helper: maps an entire array of UserSummary objects
 * to Employee[].  Drop this straight into a useMemo body.
 */
export function mapUsersToEmployees(users: readonly UserSummary[]): Employee[] {
  return users.map(mapUserToEmployee)
}
