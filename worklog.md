# RPS Builder Project - Worklog

## Project Overview
Clone of https://smartrps.rifainstitute.com/ - RPS (Rencana Pembelajaran Semester) Builder with OBE curriculum framework. Uses a master prompt template with replaceable parts (Mata Kuliah, SKS, Semester, Program Studi) to generate JSON output via LLM, with preview and save functionality.

## Tech Stack
- Next.js 16 with App Router
- TypeScript, Tailwind CSS 4, shadcn/ui (New York)
- Prisma ORM (SQLite)
- z-ai-web-dev-sdk for LLM (backend only)

---
Task ID: 1
Agent: Main Agent
Task: Setup Prisma schema with RPS model and push to database

Work Log:
- Updated prisma/schema.prisma to add RPS model with fields: id, mataKuliah, sks, semester, programStudi, deskripsi, promptText, jsonData, createdAt, updatedAt
- Added indexes on mataKuliah and programStudi for faster searches
- Ran `bun run db:push` - database synced successfully
- Prisma Client regenerated

Stage Summary:
- Database schema ready with RPS model
- Ready to build API routes and frontend

---
Task ID: 2
Agent: Main Agent
Task: Create API routes for RPS: generate (LLM), list, save, get, delete

Work Log:
- Created src/lib/rps-template.ts with:
  - RPSFormInput interface (mataKuliah, sks, semester, programStudi)
  - DEFAULT_FORM_INPUT constant (Rekayasa Perangkat Lunak example)
  - RPS_JSON_TEMPLATE constant (full JSON structure with M1-M16 fields)
  - buildMasterPrompt() function that fills placeholders with form values
- Created src/app/api/rps/generate/route.ts:
  - POST handler validates input, calls z-ai-web-dev-sdk LLM
  - System prompt forces pure JSON output
  - extractJson() helper strips markdown fences and extracts JSON object
  - Returns { success, prompt, data (parsed JSON), raw }
- Created src/app/api/rps/route.ts:
  - GET: lists all saved RPS, newest first
  - POST: validates and saves new RPS record to database
- Created src/app/api/rps/[id]/route.ts:
  - GET: fetch single RPS by id
  - DELETE: delete single RPS by id (with existence check)

Stage Summary:
- All CRUD + AI generation API routes implemented
- LLM integration working (tested: ~59-80s per generation)
- JSON extraction robust against markdown fences

---
Task ID: 3
Agent: Main Agent
Task: Build main page UI with header, tabs, form, prompt preview, JSON preview

Work Log:
- Created src/components/rps/json-preview.tsx:
  - Uses react-syntax-highlighter (Prism, oneDark theme)
  - Copy to clipboard + Download as .json file actions
  - Configurable maxHeight, filename, showActions
- Created src/components/rps/rps-builder.tsx:
  - Left column: Input form (Mata Kuliah, SKS, Semester, Program Studi, Deskripsi)
    - SKS/Semester as Select dropdowns
    - Program Studi has datalist presets
    - Master Prompt preview (auto-fills with form values, scrollable)
    - Generate button with loading state
  - Right column: JSON Preview card with Save/Copy/Download actions
    - Empty state with animated loading dots during generation
    - Tips card below preview
- Created src/components/rps/rps-saved-list.tsx:
  - Searchable list of saved RPS cards
  - Each card: title, program studi, badges (SKS/Semester/OBE), date, View Detail
  - Delete with AlertDialog confirmation
  - Detail Dialog: metadata grid + full JSON preview (scrollable)
  - Skeleton loading + empty states
- Created src/components/rps/rps-about.tsx:
  - Hero card with gradient background
  - Features grid (4 cards)
  - Usage flow (4 steps)
  - Aturan Mutlak (rules) list
- Rewrote src/app/page.tsx:
  - Sticky header with logo, title, Referensi + Buat RPS buttons
  - Tabs (Builder / Tersimpan / Tentang)
  - Footer (mt-auto, sticky to bottom)
  - Auto-switches to Saved tab after saving
- Updated src/app/layout.tsx metadata (title, description, keywords)

Stage Summary:
- Full UI implemented with responsive design (mobile-first)
- Sticky footer at bottom, header at top
- All three tabs functional

---
Task ID: 4-7
Agent: Main Agent
Task: LLM generation, save, saved list, lint, dev server, agent-browser verification

Work Log:
- LLM generation verified: POST /api/rps/generate returns valid RPS JSON
  - Generated complete RPS for "Rekayasa Perangkat Lunak" with CPL, CPMK, TAKSONOMI, M1-M16 matrix, rancangan tugas, rubrik penilaian
- Save verified: POST /api/rps returns 201, record inserted into SQLite
- agent-browser E2E verification:
  - Builder tab: form fills work, master prompt auto-updates, generate succeeds, JSON preview shows with syntax highlighting
  - Save: toast "Tersimpan! RPS 'Rekayasa Perangkat Lunak' berhasil disimpan ke database." + auto-switch to Saved tab
  - Saved tab: card displays with badges, View Detail dialog opens with metadata + JSON
  - Delete: AlertDialog "Hapus RPS ini?" -> "Ya, Hapus" -> toast "Terhapus" + empty state
  - About tab: hero, features, flow, rules all render
  - Mobile (375px): fully responsive, single column, no overflow
  - Desktop (1280px): clean two-column layout
- VLM screenshot analysis confirms: clean layout, proper spacing, no overlap, professional design
- bun run lint: passed with no errors
- dev.log: no runtime errors, all API routes returning 200/201

Stage Summary:
- ALL core functionality verified working end-to-end via agent-browser
- Lint clean, dev server stable, responsive design confirmed
- Ready for cron job setup and handover

Current Status: STABLE - all features working
- Builder (form + master prompt + AI generate + JSON preview + save)
- Saved list (search + view detail + delete)
- About (hero + features + flow + rules)
- Mobile + Desktop responsive

Unresolved Issues / Next Phase Priorities:
- Program Studi text truncated in detail dialog metadata (minor, consider allow-wrap on small screens)
- LLM generation takes 59-80s (inherent to model, consider adding streaming/progress indicator)
- Could add: edit existing RPS, export to PDF/Word, multiple RPS templates, CPL/CPMK library
