# Patrón — Landing 3D scroll cinematográfica

**Estado:** canónico (referencia Mustang)  
**Skill agente:** [`.cursor/skills/cinematic-3d-scroll-landing/SKILL.md`](../../.cursor/skills/cinematic-3d-scroll-landing/SKILL.md)  
**Código:** `src/core/encargo/cinematic-3d-landing.ts` · preset `mustang-landing.ts`  
**Live ref:** https://www.altivoxai.es/assets/encargos/mustang/index.html

## Regla de producto

Si un cliente pide una landing **similar al Mustang** con **otro objeto**, el agente debe hacer **exactamente lo mismo**: mismo stack UX (sticky WebGL, scrub, cámara por scroll, HUD de beats, GLB texturizado, path 60fps). Solo cambian objeto, copy, asset slug y pivote opcional.

## Detección

`wantsCinematic3dLanding` en `local-artifact.ts` — motion (3D/scroll/…) + objeto/producto.

## Anti-patrones ya descartados

- Embed Sketchfab como experiencia principal  
- Coche de cajas / primitivos  
- `mergeGeometries` destructivo  
- Split espacial / discard shader para “puertas”  
- Texturas solo WebP en prod  

Detalle operativo completo en el skill.
