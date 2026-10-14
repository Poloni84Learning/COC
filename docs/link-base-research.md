# Clash of Clans layout links

Checked 2026-10-05.

Supercell describes layout sharing as a snapshot saved when a player shares a layout inside the game. Later edits require a fresh link. Unused links may be deactivated.

Source: https://supercell.com/en/games/clashofclans/es/blog/game-updates/training-und-layoutlinks-2/

The public developer portal does not provide a verified operation to upload arbitrary layout coordinates and mint an OpenLayout identifier. This is a limitation of the supported integration, not a claim about every private game endpoint. We therefore do not manufacture a link by encoding JSON or coordinates into an ID.

Supported workflow: generate and export a wall blueprint, arrange it in-game, use the game's Share Layout operation, then attach that real link to the blueprint. The web app validates the URL structure and Town Hall, but cannot verify server-side existence, expiry, or that it matches the generated art. Editing the blueprint clears the attached link.

## Wall inventory

TH1–TH18: 0, 25, 50, 75, 100, 125, 175, 225, 250, 275, 300, 300, 300, 325, 325, 325, 325, 325.

The installed data package incorrectly records 400 at TH18. Its TH18 entry is overridden to 325. Additional allowances to upgrade existing walls must not increase inventory.

References:
- https://supercell.com/en/games/clashofclans/blog/release-notes/the-february-update-has-escaped/
- https://www.clashtrack.online/guides/town-hall/18 (325 available walls)
- https://github.com/chiefpansancolt/clash-of-clans-data (asset and building data provenance)

## Buildings

Use availablePerTownHall, countAfterMerges when present, footprint size and highest eligible normal level. Town Hall, permanent defenses, army/resource buildings, hero banners, helper hut, B.O.B.'s hut and traps are included. Optional B.O.B. hut is configurable; crafted defenses change by season and are explicitly outside this permanent-building blueprint. Maximum-level inventory is illustrative: a real player's unbuilt buildings, merged defenses and obstacles may differ. Export placement failures instead of silently dropping them.
