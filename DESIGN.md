---
name: Wallcraft
description: A countable wall-building desk for Clash of Clans layouts.
colors:
  navy-ink: "#172d40"
  muted-ink: "#536574"
  paper: "#fff"
  workspace: "#eef2f5"
  soft-surface: "#edf2f5"
  inset-surface: "#fafcfd"
  divider: "#dbe3e8"
  field-border: "#ccd7df"
  brand-orange: "#d26722"
  active-orange: "#b95316"
  tool-fill: "#ffddbd"
  tool-ink: "#853900"
  motif-fill: "#fff4e9"
  motif-ink: "#9f4e15"
  village-green: "#304a39"
  budget-green: "#5e8567"
  status-green: "#496c50"
  error-ink: "#a53b1e"
  wall-gold: "#c9ac64"
typography:
  headline: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: "28px", fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.035em" }
  title: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: "13px", fontWeight: 600 }
  body: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: "13px", fontWeight: 400 }
  label: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: "11px", fontWeight: 500 }
  text-preview: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: "22px", fontWeight: 700, lineHeight: 1.45, letterSpacing: "0.035em" }
rounded:
  badge: "4px"
  tool: "6px"
  control: "8px"
  overlay: "10px"
  panel: "14px"
spacing:
  compact: "8px"
  control: "12px"
  row: "16px"
  mobile-panel: "18px"
  workbench: "20px"
  panel: "22px"
  column-gap: "24px"
  desktop-gutter: "32px"
components:
  button-primary: { backgroundColor: "{colors.navy-ink}", textColor: "{colors.paper}", rounded: "{rounded.control}", padding: "9px 14px", height: "39px" }
  button-secondary: { backgroundColor: "{colors.paper}", textColor: "{colors.navy-ink}", rounded: "{rounded.control}", padding: "9px 14px", height: "39px" }
  button-quiet: { backgroundColor: "transparent", textColor: "{colors.muted-ink}", rounded: "{rounded.control}", padding: "8px" }
  button-icon: { backgroundColor: "transparent", textColor: "{colors.muted-ink}", rounded: "{rounded.tool}", size: "34px" }
  text-entry: { backgroundColor: "{colors.inset-surface}", textColor: "{colors.navy-ink}", typography: "{typography.text-preview}", rounded: "{rounded.control}", padding: "12px 13px" }
  mode-switch: { backgroundColor: "{colors.soft-surface}", rounded: "{rounded.control}", padding: "4px" }
  hall-badge: { backgroundColor: "{colors.soft-surface}", rounded: "{rounded.badge}", padding: "3px 6px" }
  panel: { backgroundColor: "{colors.paper}", rounded: "{rounded.panel}", padding: "22px" }
  motif-selected: { backgroundColor: "{colors.motif-fill}", textColor: "{colors.motif-ink}", rounded: "{rounded.control}", padding: "10px 6px 9px" }
  budget: { backgroundColor: "#f8fafb", textColor: "{colors.navy-ink}", padding: "22px" }
---

# Design System: Wallcraft

## Overview

**Creative North Star: "The Brick-Building Instruction Desk"**

Wallcraft pairs paper-white controls and pale blue workspace with navy ink, orange selections and a green village grid. Its character is practical, calm and playful: the layout reads as a construction booklet, while actual game sprites make the result recognizable.

Dense settings stay subordinate to the work surface. Counts, dimensions and named states make each change legible; the plan and village views represent the same discrete wall cells.

**Key Characteristics:**

- Countable cells and visible material budgets.
- White control surfaces around a dominant green canvas.
- Compact Vietnamese typography and clear selected states.
- A persistent mobile preview with refinements disclosed on demand.

**The Countable Mark Rule.** Every wall shown represents one actual grid cell; previews and exports must preserve the same coordinates.

### Artistic construction controls

Vietnamese light lettering composes the body, structural accent and tone separately. Reserve clear space between stacked marks, attach horns to the actual body edge, and size line gaps from real bounds including accents and descenders. Explicit strokes use a direct cell centerline; never fill and re-thin them or widen them merely to consume spare walls. Keep ornaments to the sides and below the name. Medium is the most balanced size; small lettering retains a minimum mark size for recognition. The full visual audit and remaining legibility limits are recorded in `docs/vietnamese-full-review.md`.

Latest density refinement: default lettering is a connected single-wall skeleton, preserving dots/accents rather than filling broad contours. Fit prefers the current size capped at medium, never grows text simply to consume the inventory. Optional surplus ornaments are separate whole groups with clearance, capped at 64 walls. The budget shows main lettering, ornaments and unspent inventory. A visible “Làm thanh chữ & thêm họa tiết” action regenerates older drafts; manual designs are otherwise preserved.

The lettering selector presents seven actual wall-cell specimens in two columns: Dancing Script, Allura, Great Vibes, Lobster, Playfair Display, Coiny and Caveat. Specimens derive from the current input; there are no word presets. Letter shapes and Vietnamese composition recipes come from `docs/all-7-fonts-json.zip`, using the common font canvas and baseline in `docs/quy-tac-ghep.md`. Preserve uppercase/lowercase, Vietnamese accents and English letters for arbitrary text. Font advances and kerning control placement before rasterization in the final game frame. Light marks retain a readable minimum size. Invalid duplicate source glyphs are reconstructed by the general composition rules; see `docs/lettering-library-review.md`. Swash/blade underlines remain optional actual wall geometry. Be Vietnam Pro remains the interface font. Supporting font sources and OFL licenses live in `public/fonts/art`.

The reference-frame control sits beneath the text and font controls, visible without opening refinements. Its options are “Chéo 45° · Theo game” and “Theo ô vuông”. The former is the default and changes real coordinates, compensating for the isometric camera. Camera view selection remains in the workbench header.

The shape library and word-example buttons are temporarily removed from the editor. Existing imported shape coordinates remain editable and exportable; text entry or a font selection starts a lettering design. Historical motif source data stays available for compatibility.

When generation exceeds either limit, the canvas shows zero artwork walls and a central white warning with the reason and a recovery button. Drawing, sharing and exporting are disabled; the budget panel labels the attempted count “Mẫu cần”. The mobile sticky preview becomes a compact warning. Boundary violations during manual editing stop the stroke and explain how to start again inside the grid.

## Colors

Navy and cool paper structure the interface; orange signals interaction, green identifies the village and available budget, and gold identifies plan-view walls. The frontmatter is the normative palette.

- **Primary:** Navy Ink anchors text, the brand mark and the export button. Active Orange supplies focus, caret and checkbox accents; Brand Orange marks the wordmark dot.
- **Secondary:** Village Green separates the work surface from controls. Budget Green fills the usage track; Status Green accompanies remaining-wall feedback.
- **Neutral:** Paper covers controls and panels; Workspace surrounds them. Soft Surface groups switches and badges; Inset Surface supports text entry and the export footer. Muted Ink, Divider and Field Border establish secondary information and boundaries.
- **State colors:** Tool Fill and Tool Ink mark a selected canvas tool. Motif Fill and Motif Ink mark the chosen pattern with a border and check. Error Ink accompanies explicit error text. Wall Gold is the flat wall swatch and plan-view fill.
- The grid alternates two muted greens, with a thin lighter grid and perimeter. Game sprites retain their own source colors.

**The Functional Orange Rule.** Use orange for active tools, selected motifs, focus and the brand dot; keep the export action navy.

## Typography

Use **Be Vietnam Pro**, with a sans-serif fallback, throughout the DOM. Normal weights (400–800) are self-hosted as TTF files in `public/fonts`, loaded with font-display swap; preserve Vietnamese diacritics. There is no separate display or monospace family. Canvas coordinate and export annotations use system-ui.

- **Headline:** Compact, bold and slightly tight; the desktop page heading uses the frontmatter role. It becomes (24px) at 1100px, (25px) at 800px and (23px) at 400px.
- **Titles and labels:** Section headings use (13px/600); the workbench uses (12px/600). Body starts at (13px), with dense secondary copy at (9–12px). Mobile form labels and core actions settle at (12px), supporting notes at (11px).
- **Text preview:** The large entry field uses the frontmatter role, increasing to (23px) on mobile. Keep user-entered names visually distinct from labels.
- Budget counts and coordinates use tabular numerals. Supporting paragraphs use generous line height (1.7–1.8) where specified.

## Layout

The centered shell is capped at (1440px), with desktop gutters (32px) and top spacing (36px). The white masthead is (78px) high. The editor has a narrow settings column (306px), a flexible workbench and a (24px) gap. Panel divisions use consistent inset padding and thin rules.

At widths up to (1100px), the settings column becomes (282px), the gap becomes (18px), and lower-priority descriptors disappear. At (800px), the masthead becomes (66px), gutters become (18px), and the editor stacks. At (400px), shell gutters become (12px).

Mobile adds a sticky, collapsible quick preview above the settings: a (46px) header plus a canvas (178px), or (166px) at 400px. It shows the live count and shares the main view state. Refinements start collapsed on mobile and open on desktop; mobile motifs form four columns rather than two. The full editing canvas remains below settings, (430px) high or (410px) at 400px. Desktop canvas height uses clamp(450px, 42vw, 650px), becoming (450px) at 1100px.

**The Complete Village Rule.** Keep the full grid and tall building sprites inside the canvas, including headroom above the far corner. The current isometric projection uses min(width/92, height/56) and starts its far corner at 14% of canvas height.

## Elevation & Depth

Panels are flat white surfaces separated by borders and tone. Small shadows are reserved for the selected creation mode, floating canvas toolbar, export menu, toast and sticky mobile preview. Do not turn the whole editor into floating cards. Buttons change background and color over (0.16s); loading uses a rotating icon. Reduced-motion preference removes animations and transitions.

## Shapes

Large panels have gentle corners (14px); normal controls (8px), icon tools (6px), badges (4px), and overlays (10px). The village is a diamond projection of a square grid; the plan is orthogonal. Cell walls remain discrete, with gold in plan view and actual wall sprites in village view. Motif previews depict their cell geometry rather than unrelated decorative illustrations.

## Components

- **Buttons:** Navy primary export; white bordered secondary import/share/coordinate actions; quiet help and dismiss actions. Selected tools use a pale orange fill. Disabled buttons use opacity (0.44) and remain visibly disabled. Hover changes tone without movement.
- **Inputs:** White bordered select, URL and coordinate fields; pale inset name textarea. Visible focus uses a (3px) Active Orange outline offset (3px). Errors appear near the affected field; game-link errors have alert semantics.
- **Switches and motifs:** Segmented groups use soft blue-gray wells and explicit selected backgrounds. Motifs add an orange border and check. Preserve aria-pressed and group labels.
- **Budget and readiness:** Show actual usage, remaining count and a thin progress track. Invalid counts switch to warm error colors and explanatory text. Export and share are disabled for empty, out-of-grid, over-budget or unplaced-building states.
- **Canvas:** View mode selects a cell and permits vertical touch scrolling. Draw/erase capture the pointer and interpolate traversed cells; only these modes suppress touch panning. One continuous stroke is one undo step. Plan and village views share coordinates, walls and buildings.
- **Coordinate access:** A labeled disclosure exposes X/Y fields (0–43), add/delete buttons and directional moves. Keep this keyboard path and the mobile instruction pointing to it; the canvas label describes the grid and this alternative.
- **Accessibility and feedback:** Icon actions have accessible names; disclosures expose expanded state; forms have labels. Toasts use status semantics and dismiss controls. Core mobile actions and coordinate fields are at least (44px) high; canvas and move icon targets become (44px). Preserve Ctrl/Cmd+Z, redo shortcuts and Escape dismissal.
- **Recovery:** Loading and retry states use the same restrained type and primary action; an empty canvas gives a concise name-entry prompt. Saving and restoration use visible state text, with drafts stored on the current device.

## Do's and Don'ts

### Do:

- Do preserve visible counts, dimensions and readiness beside the design.
- Do keep plan and village views synchronized with the same cells.
- Do retain the sticky mobile preview, collapsed refinements and coordinate controls.
- Do pair color states with labels, icons or pressed-state semantics.
- Do use the self-hosted Vietnamese font and respect reduced motion.

### Don't:

- Don't crop tall buildings or silently omit walls to fit a preview.
- Don't use orange as the default fill for every action.
- Don't make precise cell editing depend only on dragging.
- Don't hide invalid or empty states behind an enabled export action.
