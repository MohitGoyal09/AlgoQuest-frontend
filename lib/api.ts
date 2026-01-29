import {
  APIResponse,
  SafetyValveData,
  TalentScoutData,
  CultureThermometerData,
  ContextCheckData,
  CreatePersonaResponse,
  InjectEventResponse,
  RiskLevel,
  PersonaType,
  NudgeData,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/engines';

// ============================================
// Helper Functions
// ============================================
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  const result: APIResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }
  return result.data as T;
}

// ============================================
// Safety Valve API
// ============================================

/**
 * Get burnout risk analysis for a specific user
 * GET /users/{user_hash}/safety
 */
export async function getSafetyAnalysis(userHash: string): Promise<SafetyValveData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/safety`);
  return handleResponse<SafetyValveData>(response);
}

// ============================================
// Talent Scout API
// ============================================

/**
 * Get network centrality analysis for a specific user
 * GET /users/{user_hash}/talent
 */
export async function getNetworkAnalysis(userHash: string): Promise<TalentScoutData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/talent`);
  return handleResponse<TalentScoutData>(response);
}

// ============================================
// Context Enricher API
// ============================================

/**
 * Check context explanation for a specific timestamp
 * GET /users/{user_hash}/context?timestamp=ISO8601
 */
export async function getContextCheck(
  userHash: string,
  timestamp?: string
): Promise<ContextCheckData> {
  const url = new URL(`${API_BASE_URL}/users/${userHash}/context`);
  if (timestamp) {
    url.searchParams.set('timestamp', timestamp);
  }
  const response = await fetch(url);
  return handleResponse<ContextCheckData>(response);
}

// ============================================
// Culture Thermometer API
// ============================================

/**
 * Analyze team-level contagion risk
 * POST /teams/culture
 */
export async function getTeamAnalysis(userHashes: string[]): Promise<CultureThermometerData> {
  const response = await fetch(`${API_BASE_URL}/teams/culture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_hashes: userHashes }),
  });
  return handleResponse<CultureThermometerData>(response);
}

// ============================================
// Simulation API
// ============================================

/**
 * Create a simulation persona with synthetic behavioral data
 * POST /personas
 */
export async function createPersona(
  email: string,
  personaType: PersonaType
): Promise<CreatePersonaResponse> {
  const response = await fetch(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, persona_type: personaType }),
  });
  return handleResponse<CreatePersonaResponse>(response);
}

/**
 * Inject a real-time behavioral event
 * POST /events
 */
export async function injectEvent(
  userHash: string,
  eventType: string,
  timestamp?: string,
  metadata?: Record<string, unknown>
): Promise<InjectEventResponse> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_hash: userHash,
      event_type: eventType,
      ...(timestamp && { timestamp }),
      ...(metadata && { metadata }),
    }),
  });
  return handleResponse<InjectEventResponse>(response);
}

// ============================================
// Nudge Dispatcher API
// ============================================

/**
 * Get nudge recommendation for a user
 * GET /users/{user_hash}/nudge
 */
export async function getNudge(userHash: string): Promise<NudgeData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/nudge`);
  return handleResponse<NudgeData>(response);
}

/**
 * Acknowledge a nudge action
 * POST /nudges/{nudge_id}/acknowledge
 */
export async function acknowledgeNudge(nudgeId: string, action: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/nudges/${nudgeId}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return handleResponse<void>(response);
}

// ============================================
// WebSocket Client
// ============================================

/**
 * Create a WebSocket connection for real-time updates
 * ws://localhost:8000/ws/{user_hash}
 */
export function createWebSocket(userHash: string): WebSocket {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  return new WebSocket(`${wsUrl}/${userHash}`);
}

// ============================================
// Health Check
// ============================================

/**
 * Check if the API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1/engines', '')}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
