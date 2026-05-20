# Admin Dashboard Skill Generator Prompt

You are analyzing CoPilot Innovations' admin dashboard repositories to create a reusable skill that helps engineers build new admin panels.

## Your Task

1. **Analyze the provided repos**
   - Read package.json, tsconfig, component structure
   - Identify common patterns:
     - Framework (Next.js, React, Remix?)
     - UI library (shadcn/ui, MUI, Ant Design, custom?)
     - State management (Zustand, Redux, React Query?)
     - Data tables (TanStack Table, custom?)
     - Forms (React Hook Form, Formik?)
     - Charts (Recharts, Chart.js, D3?)
     - Auth (NextAuth, custom?)
     - API integration (tRPC, REST, GraphQL?)
     - Deployment (Vercel, self-hosted?)

2. **Research best practices online**
   - Search for "Next.js admin dashboard architecture 2026"
   - Search for "React data table best practices"
   - Search for "admin panel UI/UX patterns"
   - Search for "TypeScript form validation patterns"

3. **Create the skill**
   - Questions about: data entities, user roles, features needed, design system
   - Architecture recommendations
   - Include CoPilot's component patterns
   - Scaffolding steps

## Output

Write completed skill to: `skills/node/admin-dashboard-builder/SKILL.md`

Include:
- 12-18 targeted questions (UI is more decision-heavy)
- Component architecture recommendations
- Common CoPilot patterns (auth flow, table patterns, form patterns)
- Scaffolding steps with example components
- Testing strategy (unit + E2E)
