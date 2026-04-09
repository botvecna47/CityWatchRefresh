# Frontend Build Failure Analysis

## The Problem
Our frontend compiler (Vite) is actively crashing during both `npm run build` and `npm run dev`. The console shows generic Rollup stack trace errors (`rollup/dist/es/shared/node-entry.js:2167`) which usually signifies a broken Javascript syntax abstract syntax tree (AST). 

Because the error is nested so deep, we know this isn't a simple module-not-found error, but either a **stray structural character** (like an orphaned `}`, `)`, or JSX tag) or an **invalid Node environment execution** (such as trying to execute `window` logic inside the server-side bundler).

## Possible Root Causes

1. **Stray JSX Bracket (Syntax Error)**: Earlier logs showed: `X [ERROR] Expected ")" but found "{"` in files we may have modified or synced from the Figma reference (possibly `SubmitReport.tsx` or `MapPage.tsx`).
2. **React-Leaflet Vite Incompatibility**: React-Leaflet requires the `window` object. If `MapPage` or `SubmitReport` runs `L.divIcon` at the root module level, Vite's build server completely crashes because it parses files in a Node context where `window.document` doesn't exist. *(Note: We implemented a partial fix for this in `MapPage`, but `SubmitReport.tsx` still has the old mock map code that needs updating too).*
3. **Peer Dependency Desync**: We installed `react-leaflet` with `--legacy-peer-deps` due to the React 19 vs. 18 collision. This could cause Rollup plugin mismatches.

## The Implementation Plan

1. **Syntax Audit via Raw TypeScript Compiler**: 
   Since Vite obscures the actual syntax error behind its pipeline, I will bypass Vite completely and run `npx -p typescript tsc --noEmit --jsx react`. This will forcefully output the exact file and exact line number causing the build breakdown.
2. **Complete the React-Leaflet Integration in `SubmitReport`**: 
   `MapPage.tsx` was fixed to dynamically load `Leaflet` inside a `useEffect`, but `SubmitReport.tsx` may still contain breaking static integrations or broken JSX. We will rewrite it.
3. **Re-Validate & Serve**:
   Once the syntax tree compiles cleanly under raw `tsc`, we will flush `.vite` cache, rebuild via `npm run build`, and confirm production readiness.
