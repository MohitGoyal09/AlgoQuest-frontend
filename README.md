# 🎨 Sentinel Frontend

> **Next.js Dashboard for AI-Powered Employee Insights**  
> A modern, responsive dashboard for real-time burnout monitoring, network visualization, and team health analytics.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-1.0-black?style=flat)](https://ui.shadcn.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Pages](#pages)
- [Components](#components)
- [Hooks](#hooks)
- [Styling](#styling)
- [API Integration](#api-integration)
- [WebSocket](#websocket)
- [Building & Deployment](#building--deployment)

---

## Overview

Sentinel Frontend is a sophisticated Next.js application that provides an intuitive interface for the Sentinel AI-powered employee insights platform. It visualizes complex analytics data through interactive dashboards, real-time network graphs, and actionable team health metrics.

### Key Capabilities

- 📊 **Real-Time Risk Monitoring**: Live burnout risk scores with visual indicators
- 🕸️ **Network Visualization**: Interactive D3.js graphs showing team connections
- 🎮 **Simulation Controls**: Create and manage digital twins for testing
- 🌡️ **Team Health Overview**: Culture thermometer with contagion alerts

---

## Features

### 📈 Real-Time Risk Monitoring

- **Live Dashboard**: WebSocket-powered real-time updates
- **Risk Meter**: Visual gauge showing current risk levels
- **Timeline Charts**: Historical trend analysis with Recharts
- **Metric Cards**: Key performance indicators at a glance

### 🕸️ Network Visualization

- **Interactive Graphs**: D3.js-powered force-directed networks
- **Node Details**: Click to explore individual connections
- **Centrality Highlighting**: Identify hidden gems visually
- **Legend & Controls**: Filter and customize the view

### 🎮 Simulation Controls

- **Persona Creator**: Generate digital twins with different risk profiles
- **Event Injector**: Simulate real-world scenarios
- **Activity Feed**: Real-time simulation event log
- **Demo Mode**: Showcase the platform's capabilities

### 👥 Team Overview

- **Culture Thermometer**: Team health visualization
- **Contagion Alerts**: Early warning for resignation risks
- **Team Member List**: Sortable, filterable member directory
- **Aggregated Metrics**: Team-level analytics

---

## Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives
- **[Lucide React](https://lucide.dev/)** - Icon library

### Data Visualization
- **[D3.js](https://d3js.org/)** - Network graph visualization
- **[Recharts](https://recharts.org/)** - React charting library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### State Management & Data
- **React Hooks** - Local state management
- **Custom Hooks** - Reusable data fetching logic
- **WebSocket API** - Real-time communication

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing

---

## Prerequisites

### Required

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Fast, disk space efficient package manager
- **Git** - For cloning the repository

### Recommended

- **VS Code** - With extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Hero

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB for node_modules
- **Browser**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Installation

### Step 1: Clone and Navigate

```bash
# Clone the repository
git clone <repository-url>
cd sentinel/frontend
```

### Step 2: Install pnpm (if not installed)

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using Scoop (Windows)
scoop install pnpm
```

### Step 3: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Or if you prefer npm/yarn
npm install
# or
yarn install
```

### Step 4: Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/engines

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1/engines` | ✅ |
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL | `ws://localhost:8000/ws` | ✅ |

---

## Development

### Running the Development Server

```bash
# Start development server
pnpm dev

# Or with npm/yarn
npm run dev
yarn dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://your-ip:3000

### Development Features

- **Hot Module Replacement**: Instant updates on file changes
- **Fast Refresh**: React component updates without losing state
- **Source Maps**: Full debugging support
- **Type Checking**: Real-time TypeScript validation

### Building for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Linting and Type Checking

```bash
# Run ESLint
pnpm lint

# Type check without emitting
npx tsc --noEmit

# Both lint and type check
pnpm lint && npx tsc --noEmit
```

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/            # Personal risk dashboard
│   │   │   └── page.tsx
│   │   ├── network/              # Network visualization
│   │   │   └── page.tsx
│   │   ├── simulation/           # Simulation controls
│   │   │   └── page.tsx
│   │   ├── team/                 # Team overview
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Dashboard layout
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   └── favicon.ico               # Site favicon
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   │   ├── MetricCard.tsx
│   │   ├── RiskMeter.tsx
│   │   ├── TimelineChart.tsx
│   │   └── WebSocketStatus.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── network/                  # Network visualization
│   │   ├── Legend.tsx
│   │   ├── NetworkGraph.tsx
│   │   └── NodeDetails.tsx
│   ├── simulation/               # Simulation components
│   │   ├── ActivityFeed.tsx
│   │   ├── EventInjector.tsx
│   │   └── PersonaCreator.tsx
│   ├── team/                     # Team components
│   │   ├── ContagionAlert.tsx
│   │   ├── CultureThermometer.tsx
│   │   └── TeamMemberList.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
├── hooks/                        # Custom React hooks
│   ├── useNetworkData.ts
│   ├── useRiskData.ts
│   ├── useSimulation.ts
│   ├── useTeamData.ts
│   └── useWebSocket.ts
├── lib/                          # Utility functions
│   ├── api.ts                    # API client
│   ├── colors.ts                 # Color utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript types
│   └── index.ts
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   └── ...
├── .env.local                    # Local environment
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui config
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── pnpm-lock.yaml                # Lock file
├── pnpm-workspace.yaml           # Workspace config
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Architecture

### App Router Structure

The application uses Next.js 14+ App Router with route groups for organization:

```
app/
├── layout.tsx          # Root layout (fonts, metadata)
├── page.tsx            # Landing/marketing page
├── globals.css         # Global styles + Tailwind
├── (dashboard)/        # Route group (no URL segment)
│   ├── layout.tsx      # Dashboard shell (Sidebar + main)
│   ├── dashboard/      # /dashboard - Personal view
│   ├── network/        # /network - Team network
│   ├── simulation/     # /simulation - Demo controls
│   └── team/           # /team - Team health
```

### Component Organization

```
components/
├── dashboard/          # Page-specific components
├── layout/             # Shared layout components
├── network/            # Network visualization
├── simulation/         # Simulation controls
├── team/               # Team analytics
└── ui/                 # Reusable UI primitives (shadcn)
```

### State Management

We use a combination of React hooks for state management:

#### Local State
```typescript
// Component-level state
const [isOpen, setIsOpen] = useState(false);
```

#### Custom Hooks
```typescript
// Data fetching hooks
const { data, loading, error } = useRiskData(userHash);
const { networkData, refresh } = useNetworkData();
const { status, sendMessage } = useWebSocket(userHash);
```

#### Hook Pattern
```typescript
// hooks/useRiskData.ts
export function useRiskData(userHash: string | null) {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userHash) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSafetyAnalysis(userHash);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userHash]);

  return { data, loading, error, refetch: fetchData };
}
```

### API Integration Layer

All API calls are centralized in [`lib/api.ts`](lib/api.ts):

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSafetyAnalysis(userHash: string): Promise<SafetyValveData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/safety`);
  return handleResponse<SafetyValveData>(response);
}

export async function getNetworkAnalysis(userHash: string): Promise<TalentScoutData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/talent`);
  return handleResponse<TalentScoutData>(response);
}
```

---

## Pages

### Dashboard (`/dashboard`)

**Purpose**: Personal risk monitoring and insights

**Components**:
- `RiskMeter` - Visual risk level indicator
- `TimelineChart` - Historical risk trends
- `MetricCard` - Key metrics display
- `WebSocketStatus` - Connection status

**Features**:
- Real-time risk score updates
- 30-day historical trend
- Individual burnout indicators
- Context explanation requests

### Network (`/network`)

**Purpose**: Team network visualization and hidden gem identification

**Components**:
- `NetworkGraph` - D3.js force-directed graph
- `NodeDetails` - Selected node information
- `Legend` - Graph element explanations

**Features**:
- Interactive node selection
- Centrality highlighting
- Edge filtering by type
- Hidden gem identification

### Simulation (`/simulation`)

**Purpose**: Demo and testing environment

**Components**:
- `PersonaCreator` - Create digital twins
- `EventInjector` - Trigger specific events
- `ActivityFeed` - Real-time event log

**Features**:
- Multiple persona types (burnout, gem, steady, contagion)
- Real-time event injection
- Activity history
- Reset and cleanup

### Team (`/team`)

**Purpose**: Team-level health monitoring

**Components**:
- `CultureThermometer` - Team health gauge
- `ContagionAlert` - Risk warnings
- `TeamMemberList` - Member directory

**Features**:
- Aggregate risk metrics
- Contagion risk detection
- Team fragmentation analysis
- Intervention recommendations

---

## Components

### Dashboard Components

#### MetricCard

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}
```

Displays a single metric with optional trend indicator.

#### RiskMeter

```typescript
interface RiskMeterProps {
  level: RiskLevel;  // 'LOW' | 'ELEVATED' | 'CRITICAL'
  velocity: number;
  confidence: number;
}
```

Visual gauge showing current risk level with color coding.

#### TimelineChart

```typescript
interface TimelineChartProps {
  data: Array<{
    date: string;
    risk: number;
    velocity: number;
  }>;
}
```

Recharts-based line chart for historical trends.

### Network Components

#### NetworkGraph

```typescript
interface NetworkGraphProps {
  data: NetworkData;
  onNodeSelect: (node: Node) => void;
  highlightGems?: boolean;
}
```

D3.js-powered interactive network visualization.

#### NodeDetails

```typescript
interface NodeDetailsProps {
  node: Node | null;
  centralityData?: CentralityData;
}
```

Side panel showing detailed information about selected node.

### Simulation Components

#### PersonaCreator

```typescript
interface PersonaCreatorProps {
  onCreate: (persona: PersonaType, email: string) => Promise<void>;
}
```

Form for creating digital twin personas.

#### EventInjector

```typescript
interface EventInjectorProps {
  userHash: string;
  onInject: (event: EventType) => Promise<void>;
}
```

Controls for injecting simulated events.

---

## Hooks

### useWebSocket

Manages WebSocket connection for real-time updates.

```typescript
function useWebSocket(userHash: string | null): {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  lastPing: Date | null;
  sendMessage: (message: object) => void;
  requestUpdate: () => void;
}
```

**Usage**:
```typescript
const { connectionStatus, lastMessage, requestUpdate } = useWebSocket(userHash);

// Request manual refresh
requestUpdate();
```

### useRiskData

Fetches and manages risk analysis data.

```typescript
function useRiskData(userHash: string | null): {
  data: SafetyValveData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

### useNetworkData

Manages network graph data.

```typescript
function useNetworkData(): {
  data: NetworkData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

### useTeamData

Fetches team-level analytics.

```typescript
function useTeamData(teamHashes: string[]): {
  data: CultureThermometerData | null;
  loading: boolean;
  error: Error | null;
}
```

### useSimulation

Manages simulation state and actions.

```typescript
function useSimulation(): {
  personas: Persona[];
  activities: Activity[];
  createPersona: (type: PersonaType, email: string) => Promise<void>;
  injectEvent: (userHash: string, event: EventType) => Promise<void>;
}
```

---

## Styling

### Tailwind Configuration

The project uses Tailwind CSS 4 with custom configuration:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for risk levels
        risk: {
          low: "#22c55e",
          elevated: "#f59e0b",
          critical: "#ef4444",
          calibrating: "#6b7280",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Color System

| Token | Value | Usage |
|-------|-------|-------|
| `risk.low` | `#22c55e` | Healthy status |
| `risk.elevated` | `#f59e0b` | Warning status |
| `risk.critical` | `#ef4444` | Critical status |
| `risk.calibrating` | `#6b7280` | Loading/insufficient data |

### Theming

The application uses CSS variables for theming:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### shadcn/ui Components

Components are styled using the shadcn/ui design system:

```bash
# Add a new shadcn component
npx shadcn add button
npx shadcn add card
npx shadcn add dialog
```

---

## API Integration

### Base Configuration

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/engines';

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
```

### API Functions

#### Safety Valve

```typescript
// Get burnout risk analysis
export async function getSafetyAnalysis(userHash: string): Promise<SafetyValveData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/safety`);
  return handleResponse<SafetyValveData>(response);
}
```

#### Talent Scout

```typescript
// Get network centrality analysis
export async function getNetworkAnalysis(userHash: string): Promise<TalentScoutData> {
  const response = await fetch(`${API_BASE_URL}/users/${userHash}/talent`);
  return handleResponse<TalentScoutData>(response);
}
```

#### Culture Thermometer

```typescript
// Get team health analysis
export async function getTeamAnalysis(teamHashes: string[]): Promise<CultureThermometerData> {
  const response = await fetch(`${API_BASE_URL}/teams/culture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_hashes: teamHashes }),
  });
  return handleResponse<CultureThermometerData>(response);
}
```

#### Context Check

```typescript
// Check context explanation
export async function getContextCheck(
  userHash: string,
  timestamp?: string
): Promise<ContextCheckData> {
  const url = new URL(`${API_BASE_URL}/users/${userHash}/context`);
  if (timestamp) url.searchParams.set('timestamp', timestamp);
  const response = await fetch(url);
  return handleResponse<ContextCheckData>(response);
}
```

#### Simulation

```typescript
// Create persona
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

// Inject event
export async function injectEvent(
  userHash: string,
  currentRisk: RiskLevel
): Promise<InjectEventResponse> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_hash: userHash, current_risk: currentRisk }),
  });
  return handleResponse<InjectEventResponse>(response);
}
```

---

## WebSocket

### Connection Setup

```typescript
// hooks/useWebSocket.ts
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export function useWebSocket(userHash: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userHash) return;

    const ws = new WebSocket(`${WS_URL}/${userHash}`);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
    };

    return () => ws.close();
  }, [userHash]);

  const sendMessage = (data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const requestUpdate = () => {
    sendMessage({ action: 'request_update' });
  };

  return { connectionStatus, lastMessage, sendMessage, requestUpdate };
}
```

### Message Types

**Client → Server:**
```typescript
// Ping
{ action: 'ping' }

// Request manual update
{ action: 'request_update' }
```

**Server → Client:**
```typescript
// Pong response
{ type: 'pong', timestamp: '2024-01-15T10:00:00Z' }

// Risk update
{
  type: 'risk_update',
  data: {
    user_hash: '...',
    risk_level: 'CRITICAL',
    velocity: 3.2
  }
}

// Manual refresh response
{
  type: 'manual_refresh',
  data: { /* full analysis */ }
}
```

### Usage Example

```typescript
function Dashboard({ userHash }: { userHash: string }) {
  const { connectionStatus, lastMessage, requestUpdate } = useWebSocket(userHash);

  useEffect(() => {
    if (lastMessage?.type === 'risk_update') {
      // Update UI with new risk data
      console.log('New risk level:', lastMessage.data.risk_level);
    }
  }, [lastMessage]);

  return (
    <div>
      <WebSocketStatus status={connectionStatus} />
      <button onClick={requestUpdate}>Refresh Data</button>
    </div>
  );
}
```

---

## Building & Deployment

### Static Export

For static hosting (requires API to be separate):

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

```bash
# Build static export
pnpm build

# Output in dist/ directory
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api/v1/engines
      - NEXT_PUBLIC_WS_URL=ws://backend:8000/ws
    depends_on:
      - backend
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@sentinel_api_url",
    "NEXT_PUBLIC_WS_URL": "@sentinel_ws_url"
  }
}
```

### Environment-Specific Builds

```bash
# Development
pnpm dev

# Staging
NEXT_PUBLIC_API_URL=https://staging-api.sentinel.app pnpm build

# Production
NEXT_PUBLIC_API_URL=https://api.sentinel.app pnpm build
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details.

---

## 📞 Support

- **Documentation**: [Full Documentation](../docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/sentinel/issues)
- **Backend Docs**: [Backend README](../backend/README.md)

---

<p align="center">
  Built with ❤️ by the Sentinel Team
</p>
