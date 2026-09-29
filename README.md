# FALLEN HAIR

Fallen Hair is the personal creative studio and portfolio of Murari, focusing on film editing, motion direction, and visual storytelling. This repository contains the complete web application—an editorial, typography-driven frontend coupled with **JIGS**, a serverless, multi-provider AI studio assistant that handles project exploration, interactive brief qualification, and structured enquiry intake.

---

## Overview

The site is designed to communicate editorial discipline, visual restraint, and technical craft. It serves as both a public exhibition of Murari's work across video editing and photography, and a structured point of contact for potential collaborators.

Rather than relying on generic contact forms or third-party iframe widgets, the site integrates **JIGS** (Jigs Intelligent Guidance System)—an in-house conversational assistant embedded directly into the studio interface. JIGS allows visitors to explore previous projects, understand Murari's creative process, and qualify project briefs through an interactive dialogue that leads into a transparent, pre-submission review flow.

---

## Features

- **Editorial Frontend:** Custom typography and layout system built with semantic CSS variables, fluid clamp-based type scales, and high visual contrast.
- **Cinematic Video Presentation:** Custom video player (`CinematicVideo.jsx`) featuring viewport-aware intersection autoplay, timeline scrubber, volume controls, fullscreen support, playback speed adjustment, and Picture-in-Picture.
- **Curated Photography Gallery:** Asymmetric editorial layout presenting photographic work across landscape, portrait, and panoramic formats.
- **Theme System (Dark & Light Modes):** 
  - Light mode: Alabaster / warm ivory canvas (`#F1ECE6`) with charcoal typography (`#2E2E2E`) and rosewood accents (`#7D4047`).
  - Dark mode: Deep espresso canvas (`#171615`) with warm ivory typography (`#F1ECE6`), greige secondary text (`#DDD5CD`), and lifted rosewood details (`#8F4D55`).
  - Manual editorial toggle in navigation bar with persistent `localStorage` synchronization and OS `prefers-color-scheme` fallback.
- **Zero-FOUC Theme Initialization:** Synchronous inline `<script>` in `<head>` applies `data-theme` prior to initial paint, preventing any theme flash.
- **Initial Readiness & Loading Layer:** Restrained deep espresso overlay (`LoadingScreen.jsx`) with a breathing wordmark; waits strictly for critical first-viewport requirements (`document.fonts.ready`, DOM layout stability via double `requestAnimationFrame`) and exits early as soon as ready, bounded by an 1800ms hard safety ceiling.
- **Wordmark & Hair Drawing Sequence:** Signature SVG stroke-by-stroke drawing animation where organic hair strands physically weave through the `FALLEN HAIR.` wordmark and settle into stillness.
- **3D Spatial Workspace:** Interactive WebGL portfolio environment powered by Three.js and React Three Fiber.
- **JIGS AI Studio Assistant:**
  - Conversational interaction for project queries and creative direction.
  - Conversational qualification of project requirements, timeline, and budget.
  - Transparent review screen (`BEFORE WE SEND THIS THROUGH`) before dispatch.
  - Full inline field editing with `Enter` (save) and `Escape` (cancel) shortcuts.
  - Real-time email validation and a non-blocking missing-details warning.
  - Zero-data-loss failure handling with clear retry triggers and a one-click clipboard brief copy fallback.
- **Accessibility & Motion Preferences:** Complete `@media (prefers-reduced-motion: reduce)` support across all GSAP timelines, SVG drawing sequences, and CSS transitions.
- **Edge Deployment Ready:** Dual-compatible serverless architecture supporting Cloudflare Pages Functions and Node-compatible serverless runtimes.

---

## JIGS

JIGS is the conversational studio assistant built to handle client intake and project exploration directly on the site.

### Workflow & Lifecycle
1. **Dialogue & Qualification:** Visitors interact with JIGS via a modal conversation window. As the visitor describes their project, the assistant extracts structured metadata (project type, deliverables, description, timeline, budget) without forcing rigid form fields.
2. **Pre-Submission Review:** When the visitor is ready, JIGS presents a structured review screen titled **"BEFORE WE SEND THIS THROUGH"**, grouping information into *Contact Information* and *Project Brief*. Every field is displayed with status indicators (`PROVIDED` vs `NOT DISCUSSED`).
3. **Inline Editing:** Visitors can edit any field directly within the review screen without losing conversation context or leaving the modal.
4. **Safety & Confirmation:** If submission fails due to network or service issues, user data remains intact with an immediate retry option and a one-click "COPY DETAILS" button. Confirmation messages truthfully acknowledge that project details have been recorded in the studio log without making unverified claims of automated emails or turnaround guarantees.

### Multi-Provider AI Architecture
JIGS uses a provider-agnostic AI orchestrator (`api/jigs/ai/orchestrator.js`) that supports automated failover:
- **Groq:** OpenAI-compatible REST endpoint using `llama-3.3-70b-versatile` for fast conversational turns.
- **Google Gemini:** Direct REST generateContent integration (`gemini-2.5-flash` or configured `GEMINI_MODEL`) with zero third-party SDK dependencies.
- **Fallback Behavior:** If the primary provider experiences a rate limit (HTTP 429), timeout, or configuration error, the orchestrator automatically routes the request to the alternate provider.
- **Static Fallback:** If all configured providers are unavailable or offline, JIGS returns a pre-configured, graceful studio fallback message with direct contact details rather than throwing an unhandled runtime error.

All provider credentials and API keys remain strictly on the server and are never exposed to client bundles.

---

## Architecture

```
Browser (React 19 SPA)
  │
  ├─ Static Assets & CDN ───> Cloudflare Pages / Vercel Edge Cache
  │
  └─ API Request (/api/jigs-chat)
       │
       ▼
     Cloudflare Pages Functions Adapter (functions/api/jigs-chat.js)
       OR Vercel Serverless Handler (api/jigs-chat.js)
       OR Vite Local Dev Middleware (vite.config.js)
       │
       ▼
     JIGS Pipeline (api/jigs-chat.js)
       │
       ├─ Security Guardian (api/jigs/security.js)
       │    ├─ Client IP detection (cf-connecting-ip / x-forwarded-for)
       │    ├─ Sliding-window rate limiting
       │    ├─ Request validation & bounds checking
       │    └─ Prompt-injection pattern scanning
       │
       ├─ Session Manager (api/jigs/session.js)
       │    ├─ HMAC-SHA256 session token verification
       │    ├─ Timing-safe signature checks
       │    └─ Database-backed session/enquiry ownership resolution
       │
       ├─ Context Manager (api/jigs/context.js)
       │    ├─ Rolling conversation history compression
       │    └─ PII boundary enforcement (strips email/phone from AI prompt)
       │
       ├─ AI Orchestrator (api/jigs/ai/orchestrator.js)
       │    ├─ Provider failover: Groq ⇄ Google Gemini
       │    └─ Response schema validation
       │
       ▼
     Supabase Database (PostgreSQL)
       ├─ enquiries (structured client project briefs)
       └─ enquiry_messages (full transcript logs)
```

### Dual-Runtime Adapter Architecture
The backend pipeline in `api/jigs-chat.js` is written as a pure function:
```javascript
export async function processJigsChat({ method, headers, body, ip, config })
```
- **Cloudflare Pages:** [functions/api/jigs-chat.js](file:///Users/murari/Desktop/FALLEN_HAIR/WEBSITE/functions/api/jigs-chat.js) acts as an Edge Functions adapter, mapping Cloudflare's `context.request` and `context.env` to `processJigsChat`.
- **Node / Vercel:** [api/jigs-chat.js](file:///Users/murari/Desktop/FALLEN_HAIR/WEBSITE/api/jigs-chat.js) also exports a default HTTP handler `(req, res)` for standard Node-compatible serverless environments.
- **Local Development:** [vite.config.js](file:///Users/murari/Desktop/FALLEN_HAIR/WEBSITE/vite.config.js) includes an embedded `apiDevMiddleware` that intercepts `/api/jigs-chat` calls during `npm run dev` and executes the backend logic directly with local environment variables.

---

## Security Model

The repository enforces application-level and cryptographic security boundaries:

- **HMAC-SHA256 Signed Session Tokens:** Session tokens are cryptographically signed using a server-side secret (`JIGS_SESSION_SECRET`). Tokens contain `sessionId`, `createdAt`, and `expiresAt` (2-hour validity window).
- **Timing-Safe Verification:** Token signatures are compared using `crypto.timingSafeEqual` to prevent timing attack vulnerabilities.
- **Persistent Database-Backed Ownership:** Enquiries are authoritatively associated with a session in Supabase (via dedicated column or JSONB metadata). Client-supplied enquiry IDs are treated as untrusted hints; mutations are only executed if the session authoritatively owns the target enquiry.
- **Cross-Session Isolation:** Sessions cannot read, modify, or submit enquiries created by other sessions.
- **Prompt Injection Defense:** Input messages are scanned against prompt injection heuristics before reaching the model context.
- **PII Boundary Enforcement:** The client and server explicitly strip visitor email addresses and phone numbers before formatting the prompt payload sent to Groq or Google Gemini.
- **Rate Limiting:** Sliding-window rate limiting (default: 30 requests per 60 seconds per IP) protects backend endpoints.
- **Credential Isolation:** Supabase service-role keys and LLM provider keys exist exclusively in server environments and are never prefixed with `VITE_` or bundled into client code.

---

## Verification

The codebase includes automated test suites covering session security, ownership isolation, and edge runtime adapters.

### Automated Test Suites
1. **Session Security & Ownership Hardening Suite:**
   - Location: `test/session_security_test.mjs`
   - **47/47 passing assertions**
   - Verifies: session token generation, HMAC verification, expiration checks, tampering rejection, database-backed enquiry creation, idempotent updates, cross-session attack prevention (403 Forbidden), clean `NEW CHAT` session boundary separation, and serverless stateless persistence across simulated container cold starts.
2. **Cloudflare Pages Adapter Suite:**
   - Location: `test/cloudflare_adapter_test.mjs`
   - **19/19 passing assertions**
   - Verifies: Cloudflare Pages Functions `onRequest` integration, preflight CORS handling (OPTIONS -> 204), method enforcement (GET -> 405), malformed JSON rejection (400), client IP extraction (`cf-connecting-ip` with `x-forwarded-for` fallback), rate-limit triggering on edge IPs, and session token generation.

### Static Analysis & Build Verification
- **Linter:** `npm run lint` uses [oxlint](https://oxc.rs) to verify JavaScript and React syntax across the project.
- **Build:** `npm run build` runs [Vite](https://vite.dev) production bundling, validating module resolution, CSS module compilation, and asset inlining.

---

## Technology

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | React 19, JavaScript (ES modules) |
| **Build & Tooling** | Vite 8, Rolldown / Rollup bundler, Oxlint |
| **Styling** | Vanilla CSS Modules, CSS custom properties (tokens), Zero-FOUC inline scripts |
| **Animation & Motion** | GSAP 3 (ScrollTrigger, timelines, SVG stroke draw), Lenis (smooth scroll) |
| **3D & WebGL** | Three.js, React Three Fiber, React Three Drei |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Admin Dashboard Auth) |
| **Serverless & Edge** | Cloudflare Pages Functions, Node.js Serverless runtime |
| **AI Providers** | Google Gemini REST API (`gemini-2.5-flash`), Groq API (`llama-3.3-70b-versatile`) |

---

## Project Structure

```
.
├── api/                  # Server-side API handlers and JIGS pipeline
│   ├── jigs/             # Modular JIGS subsystems (AI, context, security, session, validation)
│   └── jigs-chat.js      # Main API router and unified pipeline handler
├── functions/            # Cloudflare Pages Functions edge adapters
│   └── api/jigs-chat.js  # Cloudflare onRequest adapter for /api/jigs-chat
├── public/               # Static assets (fonts, video, redirects, routes)
│   ├── _redirects        # Cloudflare Pages SPA client-side routing rules
│   ├── _routes.json      # Cloudflare Pages function routing specification
│   └── videos/           # Optimized MP4 media assets
├── src/                  # React 19 application source
│   ├── app/              # Root App shell, Lenis provider, and SPA Router
│   ├── assets/           # Photography and portrait image assets
│   ├── components/       # Reusable components (Navbar, Footer, Video Player, Loading Screen)
│   │   └── Jigs/         # JIGS frontend modal, launcher, review cards, and session hooks
│   ├── context/          # React contexts (ReadinessContext, JigsModalContext)
│   ├── data/             # Static project and photography metadata
│   ├── hooks/            # Custom hooks (useTheme, useGsap, useJigsSession)
│   ├── lib/              # Configured utilities (gsapConfig, lenisConfig, navigation)
│   ├── pages/            # Page components (Home, Work, Photography, About, Contact, Workspace, JigsAdmin)
│   ├── sections/         # Homepage sections (Hero, WordmarkHair, Identity, SelectedWork, AboutHuman)
│   └── styles/           # Design system tokens, variables, typography, and global resets
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration scripts
└── test/                 # Automated test suites (security and Cloudflare adapter)
```

---

## Local Development

### 1. Clone & Install
```bash
git clone https://github.com/murari1123/Fallen-Hair.git
cd Fallen-Hair
npm install
```

### 2. Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Fill in the appropriate configuration keys in `.env` (see [Environment Variables](#environment-variables) below).

### 3. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173/`. Vite's embedded API development middleware will automatically handle `/api/jigs-chat` requests.

### 4. Run Verification & Linting
```bash
# Run static code analysis
npm run lint

# Run production build
npm run build

# Run Cloudflare adapter test suite
node test/cloudflare_adapter_test.mjs

# Run session security test suite (requires valid SUPABASE and JIGS keys in .env)
node --env-file=.env test/session_security_test.mjs
```

---

## Environment Variables

The application separates server-side secrets from public client variables. Reference `.env.example` for template values.

### Server-Side Only Secrets (Never expose to client or prefix with `VITE_`)
| Variable | Description |
|:---|:---|
| `SUPABASE_URL` | Supabase project URL (`https://your-project.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret (used for authoritative server-side DB access) |
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini models |
| `GEMINI_MODEL` | *(Optional)* Model identifier (default: `gemini-2.5-flash`) |
| `GROQ_API_KEY` | Groq Cloud API key for Llama models |
| `GROQ_MODEL` | *(Optional)* Model identifier (default: `llama-3.3-70b-versatile`) |
| `AI_PROVIDER_MODE` | Provider selection strategy: `'auto'` (default), `'gemini'`, or `'groq'` |
| `JIGS_SESSION_SECRET` | 64-character random hex string used to sign and verify HMAC session tokens |
| `JIGS_MAX_MESSAGE_LENGTH` | *(Optional)* Maximum message length in characters (default: `1500`) |
| `JIGS_RATE_LIMIT_REQUESTS`| *(Optional)* Maximum requests allowed per rate limit window (default: `30`) |
| `JIGS_RATE_LIMIT_WINDOW`  | *(Optional)* Rate limit window in milliseconds (default: `60000`) |

### Client-Side Variables (Inlined by Vite at build time)
| Variable | Description |
|:---|:---|
| `VITE_SUPABASE_URL` | Supabase project URL (must match `SUPABASE_URL`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous / public publishable key |
| `VITE_ENABLE_JIGS_AI` | Feature flag toggle for JIGS interface (`true` or `false`) |

---

## Database

The project uses [Supabase](https://supabase.com) (PostgreSQL) for persistence.

### Tables
- **`enquiries`:** Stores qualified project enquiries, client contact info, structured brief parameters (`project_type`, `timeline`, `budget`, `deliverables`, `creative_direction`), AI generated summaries, qualification scores, and the cryptographic `session_id`.
- **`enquiry_messages`:** Stores sequential conversation transcripts (`sender`, `content`, `timestamp`) associated with each enquiry record.

### Current Repository Note
The repository contains an additive migration in `supabase/migrations/20260917000001_jigs_v3_additive.sql` that adds and indexes the `session_id` column on the `enquiries` table. The baseline DDL schema that originally created the `enquiries` and `enquiry_messages` tables and their associated Row Level Security (RLS) policies was provisioned directly in the Supabase management console and is not currently checked into `supabase/migrations/` as a standalone initial creation script.

---

## Deployment

The application is architected for deployment on [Cloudflare Pages](https://pages.cloudflare.com) with Cloudflare Pages Functions.

### Cloudflare Pages Configuration
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Compatibility flag:** `nodejs_compat` (configured in `wrangler.toml` for Node crypto utilities)
- **Compatibility date:** `2026-09-18`
- **Routing:**
  - `public/_redirects`: Directs all non-file traffic to `/index.html` with status 200 for client-side routing.
  - `public/_routes.json`: Restricts Pages Functions execution strictly to `/api/*`, allowing all static assets to be served directly from Cloudflare's global edge cache.

### Alternative Runtime Support
The repository also includes `vercel.json` and a standard Node-compatible export in `api/jigs-chat.js`, allowing deployment on Vercel or Node.js serverless platforms.

---

## Design & Motion

- **Visual System:** The design language uses an editorial palette of warm ivory (`#F1ECE6`), deep espresso (`#171615`), warm greige (`#DDD5CD`), and rosewood accents (`#7D4047`).
- **Typography:** Uses system typographic hierarchies (`Helvetica Neue`, `Arial`, `SF Mono`) for instant rendering performance and high legibility.
- **Physical Settling & Restraint:** Animations avoid decorative bounce or continuous distraction. The hero hair-drawing animation reveals stroke-by-stroke over ~1.8 seconds, experiences a subtle micro-relaxation of tension, and settles into complete stillness.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected at the OS level, motion sequences are bypassed and elements render immediately in their resting states.

---

## Current Status

Fallen Hair is an actively maintained, production-grade website and studio platform. The codebase is maintained as a clean, single-contributor project with strict testing and verification standards.

---

## License

License: Not currently specified. All visual works, photography, video edits, and branding are copyright Murari / Fallen Hair. All rights reserved.
