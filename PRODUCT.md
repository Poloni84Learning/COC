# Wallcraft

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Provisional, pending optional user response: React + TypeScript + Vite in the existing Node workspace. Static output, no server credentials required.

## Users

Clash of Clans players arranging Home Village walls as names and recognizable shapes. Responsive desktop and mobile support is an assumption pending the optional question.

## Product Purpose

Turn arbitrary Vietnamese and English text into discrete wall coordinates that fit the selected Town Hall's wall inventory and 44 × 44 buildable grid.

## Capabilities and Constraints

- Town Hall 1–18 wall budgets; TH1 has no walls.
- Seven lettering styles from the supplied pixel libraries: Dancing Script, Allura, Great Vibes, Lobster, Playfair Display, Coiny and Caveat. Apply the shared composition rules to the entire Vietnamese and English alphabets, including uppercase/lowercase, Vietnamese accents, numbers and punctuation. Preserve the font baseline, advances and kerning; optional swash or blade underline.
- No word presets. The shape library is temporarily removed from the editor; existing imported shape coordinates remain readable and editable.
- A diagonal 45-degree construction frame, compensated for the village camera, plus the original square-grid frame. Both produce actual integer game coordinates.
- Any generated design outside the 44 × 44 grid or beyond the TH wall inventory is blocked in full, with a persistent warning and recovery controls. A manual stroke stops at the boundary.
- Live wall count, manual editing, undo, rotate and mirror.
- Real building assets and optional automatic placement by Town Hall, without overlap.
- Shareable web layouts and downloadable PNG, JSON and coordinate CSV.
- Official game links must originate from the game. No verified public endpoint can create game layout IDs from arbitrary coordinates; do not fabricate game links.
- Accept actual game links attached by the user; never claim their coordinates or current validity have been verified.

## Evidence on Hand

Existing assets/ and clash-of-clans-data 0.18.1. Its wall inventory for TH18 needs a documented correction from 400 to 325. Supercell release notes confirm the additional 75 level-19 walls are upgrade allowances. Existing catalog is asset evidence, not a building-count table.

## Product Principles

Lettering density: use connected thin strokes by default, preserve Vietnamese dots/accents, and never enlarge text solely to consume available walls. Allocate spare walls to complete, spaced ornaments when they fit; unused inventory is acceptable. Show main lettering and ornament counts separately.

Count actual discrete cells. Preserve recognizable shapes. Never silently truncate a requested design. Keep export limitations clear. Store personal drafts on the current device only.
