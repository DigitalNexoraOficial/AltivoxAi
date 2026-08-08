---
name: cinematic-3d-scroll-landing
description: >-
  Reproduce the Altivox Mustang-style cinematic 3D scroll landing for ANY product
  object. Use when a client brief asks for a premium WebGL/Three.js landing with
  scroll scrub, marketing beats, doors/interior/hood-like sequence, or a 3D model
  experience similar to the Mustang encargo.
---

# Cinematic 3D scroll landing (canonical pattern)

**Reference live:** https://www.altivoxai.es/assets/encargos/mustang/index.html  
**Builder:** `src/core/encargo/cinematic-3d-landing.ts`  
**Mustang preset:** `src/core/encargo/mustang-landing.ts`  
**Assets home:** `public/assets/encargos/<slug>/`

When a client wants “lo mismo que el Mustang pero con otro objeto”, do **exactly** this pattern — only swap object, copy, GLB, and (if the mesh supports it) the openable part. Do not invent a new architecture.

## Trigger (when to apply)

Apply if the brief combines:

- **3D / WebGL / GLB / modelación / Three.js**, and
- **scroll / cinematográfico / animación / recorrido / inmersivo**, and
- a **concrete object** (car, watch, sneaker, bottle, moto, furniture, …).

Do **not** fall back to a generic flat hero landing.

## Non‑negotiable UX (same as Mustang)

1. **Sticky full-viewport WebGL stage** + tall scrub spacer (~320–360vh).
2. **Real textured GLB** (JPEG/PNG textures). Never Sketchfab embeds as the main experience. Never primitive cubes/boxes as the product.
3. **Scroll-driven camera** via Catmull path baked to a LUT (~128 samples).
4. **Marketing HUD overlay** (`beatPanel`) that crossfades with scroll beats + progress ticks + “Scroll · label”.
5. **~5 sales beats** synced to scroll (presence → access → interior/detail → hero gaze → climax/open part).
6. **Story section** below scrub repeating the same beats for SEO/readability.
7. Brand as HUD signal; expressive fonts (Bebas Neue + DM Sans or equivalent — not Inter/Roboto).
8. Atmosphere: dark gradient stage + veil (not flat single-color).

## Performance rules (keep 60fps path)

- `setPixelRatio(1)`, `antialias: false`, no shadows, no envmap/PMREM.
- Convert materials to `MeshStandardMaterial`, `toneMapped: false`.
- rAF loop with exponential scroll damp; zero alloc in hot path.
- Prefer GLB ≤ ~250k verts when possible; optimize textures.
- Expose `window.__cinematicFps` (Mustang uses `__mustangFps`).

## Hard prohibitions (already burned)

| Never | Why |
|-------|-----|
| `mergeGeometries` / destructive mesh merge | Can leave only one part visible |
| Spatial split / shader discard for “doors” | Tears the body mesh on approach |
| `EXT_texture_webp` only GLBs in prod | White clay if browser/CDN path fails |
| Sketchfab iframe as primary | CSP / invisible in our deploy |
| HiDPI pixel ratio + AA + shadows | Drops below 60fps |

**Doors / access beats:** camera-led. Keep empty marker pivots (`DoorLPivot` / `DoorRPivot`) if useful for tests.  
**Openable lid/hood:** only attach **real** named meshes to a pivot when the GLB has separable parts (Mustang: `Kapoot_7` / `Rooye Kapoot` → `HoodPivot`). If the mesh is fused, skip attach — camera tells the story.

## Recipe for a new object (agent checklist)

1. **Slug** the object: `public/assets/encargos/<slug>/`.
2. **Source a real textured GLB** (license OK). Prefer JPEG/PNG textures. Commit `model.glb` (+ fallback if needed).
3. **Call** `buildCinematic3dScrollLandingHtml({...})` or add a thin preset like `mustang-landing.ts`.
4. **Write 5 marketing beats** in the client’s language (sales, not technical).
5. **Tune camera knots** only if the object proportions differ a lot; keep LUT bake.
6. **Open part:** set `openPartMeshPattern` only after inspecting node names in the GLB.
7. **URL fallbacks:** prod absolute → relative `/assets/...` → jsDelivr pin of the branch that has the asset.
8. **Ship:** commit asset + code, deploy, backfill encargo code-step HTML in Supabase if the job already ran, verify live scroll + HUD + FPS.
9. **Selftest:** assert `GLTFLoader`, pivots, `setPixelRatio(1)`, no `mergeGeometries`, beat copy strings.

## Spec shape

```ts
buildCinematic3dScrollLandingHtml({
  brand: clientName,
  objectTitle: "Rolex Submariner", // or whatever
  loadLabel: "Cargando Rolex 3D",
  assetSlug: "rolex-submariner",
  modelFiles: ["rolex.glb"],
  beats: [/* 5 sales beats */],
  credit: { author: "...", sourceUrl: "..." },
  pinBranch: "cursor/<branch>-4521",
  openPartMeshPattern: "", // or mesh regex if lid exists
  openPartPivotName: "HoodPivot",
  fpsGlobal: "__cinematicFps",
});
```

Detection lives in `src/core/encargo/local-artifact.ts` (`wantsCinematic3dLanding`).  
Code-role LLM prompt in `use-cases.ts` must steer toward this pattern for 3D scroll briefs.

## Ops / backfill

If the encargo already produced a step, update the stored HTML via Supabase MCP `execute_sql` in dollar-quoted chunks when the artifact changes. Keep preview URL under `/assets/encargos/<slug>/index.html` when publishing a static copy.

## Definition of done

- Live page loads the **full** textured object (not clay, not a fragment).
- Scroll feels continuous (no stutter / “a golpes”).
- HUD titles change with beats.
- Mobile + desktop viewport OK.
- No merge/split regressions.
