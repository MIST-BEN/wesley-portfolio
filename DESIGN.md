---
name: Wan Wenxuan Portfolio
description: 山城轨道 · the portfolio as one bilingual rail line, projects as stations, real screenshots as lit lightboxes.
colors:
  signage-white: "#f3f2ee"
  platform-panel: "#e9e8e2"
  rule-grey: "#d4d6cf"
  graphite: "#1c2024"
  graphite-2: "#3f464c"
  graphite-3: "#5f666c"
  graphite-night: "#14171a"
  pine-line: "#2e6b4f"
  pine-line-deep: "#24563f"
  platform-edge: "#f2c230"
  platform-edge-deep: "#ddab17"
  signal-green: "#6fd3a0"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Barlow, WW Hei, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(52px, 7vw, 96px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow, WW Hei, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.2vw, 56px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline-case:
    fontFamily: "Barlow, WW Hei, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 76px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow, WW Hei, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(21px, 1.9vw, 26px)"
    fontWeight: 700
    lineHeight: 1.5
  title-sm:
    fontFamily: "Barlow, WW Hei, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Barlow, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.7
    fontFeature: "tnum"
  label-en:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    letterSpacing: "0.01em"
  station-code:
    fontFamily: "Barlow, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.03em"
  numeral:
    fontFamily: "Barlow, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1
rounded:
  tag: "4px"
  control: "6px"
  frame: "8px"
  panel: "10px"
  phone: "30px"
  pill: "999px"
  stop: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  rail-x: "64px"
  rail-x-mobile: "40px"
  chip-gap: "8px"
  action-gap: "10px"
  row: "12px"
  block: "28px"
  plate-gap: "40px"
  station: "clamp(72px, 9vw, 128px)"
  container: "1360px"
components:
  button-go:
    backgroundColor: "{colors.platform-edge}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "50px"
  button-go-hover:
    backgroundColor: "{colors.platform-edge-deep}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "50px"
  button-line-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-2}"
    padding: "0 8px"
  button-quiet-hover:
    backgroundColor: "{colors.platform-panel}"
    textColor: "{colors.graphite}"
  button-light:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
  button-light-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
  signage-bar:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    height: "58px"
  direction-plate:
    backgroundColor: "{colors.pine-line}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  direction-plate-hover:
    backgroundColor: "{colors.pine-line-deep}"
  roundel:
    backgroundColor: "{colors.pine-line}"
    textColor: "{colors.white}"
    rounded: "{rounded.stop}"
    size: "36px"
  station-stop:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.stop}"
    size: "38px"
  station-stop-passed:
    backgroundColor: "{colors.pine-line-deep}"
    textColor: "{colors.white}"
  station-plate:
    textColor: "{colors.graphite}"
    typography: "{typography.headline}"
  transfer-chip:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  transfer-chip-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
  lightbox-frame:
    backgroundColor: "{colors.graphite}"
    rounded: "{rounded.frame}"
  platform-sign:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    padding: "10px 14px 12px"
  platform-code:
    backgroundColor: "{colors.pine-line}"
    textColor: "{colors.white}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
    typography: "{typography.station-code}"
  timetable-row:
    textColor: "{colors.graphite}"
    padding: "12px 0"
  departure-board:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
  departure-board-head:
    backgroundColor: "{colors.graphite-night}"
    padding: "14px 18px"
  board-go-chip:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    height: "34px"
    padding: "0 12px"
  board-go-chip-hover:
    backgroundColor: "{colors.platform-edge}"
    textColor: "{colors.graphite}"
  dialog:
    backgroundColor: "{colors.signage-white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.panel}"
    width: "min(760px, calc(100vw - 24px))"
  toast:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "{rounded.frame}"
    padding: "12px 20px"
---

# Design System: Wan Wenxuan Portfolio

## Overview

**Creative North Star: "山城轨道 · The Rail Line"**

The whole site is one bilingual metro line running from the first viewport to the terminus. Pages are stretches of track, sections are stations, real product screenshots hang as lit lightboxes on the platform, and the visitor's position is always marked. The language is public wayfinding: signage-white ground, graphite sign panels, one thick pine-green line, and a platform-edge yellow that means only "you are here" or "go".

Density is calm and civic, not decorative. Type is set like station plates: bold Chinese with a Latin grotesk underneath, never one language as an afterthought. Depth comes from graphite panels against white, not from layered cards; motion is linear rail travel with no bounce, and screenshots develop in from a washed print rather than popping. Everything the visitor reads as "proof" is real (screenshots, live demo); the DevTools interface is an illustration and is captioned as one on its own platform sign.

**Key Characteristics:**
- One continuous pine-green line (10px rail, 6px on phones) carrying numbered stops down the page.
- Bilingual station plates: Chinese display above or beside a lighter grey English line.
- Graphite lightbox frames with a platform sign (station code, name, next stop) under every screenshot.
- Yellow reserved for the current station, the train marker, focus, selection and the primary action.
- Passed stations stay lit in deep pine; the current one gets a yellow ring.

## Colors

A grounded transit palette: one line colour, one edge colour, and graphite on signage white.

### Primary
- **Pine Line** (pine-line): The line itself, the rail, stop rings, roundel, direction plate, station-code tags, rule numerals, timetable separators. It is a structural colour, carried by strokes and plates more than fills.
- **Deep Pine** (pine-line-deep): Passed stations and the direction plate's hover; "already travelled".

### Secondary
- **Platform-Edge Yellow** (platform-edge): The primary action, the train marker, the current-station ring, focus outline, text selection, the buffer stop at the rail's end, open FAQ marker. Hover darkens to **Worn Edge** (platform-edge-deep).

### Neutral
- **Signage White** (signage-white): Page ground, menu and dialog surface.
- **Platform Panel** (platform-panel): Scrollbar track, quiet-button hover.
- **Rule Grey** (rule-grey): Hairline rules between stations, rows and log entries.
- **Graphite** (graphite): Text, the signage bar, lightbox frames, platform signs, departure board, terminus, toast.
- **Graphite 2 / 3** (graphite-2, graphite-3): Secondary prose and English sub-lines respectively.
- **Night Graphite** (graphite-night): Board header row and footer; one step below graphite.
- **Signal Green** (signal-green): The "available" live dot when it sits on graphite, where pine would vanish.

### Named Rules
**The Platform Edge Rule.** Yellow marks only where you are and what to press: current station, train marker, primary action, focus. A second yellow element on a screen that is neither is a defect.

**The One Line Rule.** There is one line colour. New sections ride the pine line; they never introduce a second route colour.

## Typography

**Display Font:** Barlow 700–800 for Latin, with "WW Hei" (self-hosted Noto Sans SC 700 subset) for CJK, falling back to Noto Sans SC, PingFang SC, Microsoft YaHei.
**Body Font:** Barlow 500 with PingFang SC / Hiragino Sans GB / Microsoft YaHei for CJK body.
**Label Font:** Barlow 600 for English sub-lines; Barlow 800 for station codes and numerals.

**Character:** Station-sign grotesk: condensed-leaning, firm, tabular. Chinese carries the weight; English sits beneath it lighter and greyer, like the second line on a metro plate.

### Hierarchy
- **Display** (800, clamp 52–96px, 0.95, -0.025em): The name in the hero only.
- **Headline** (700, clamp 32–56px, 1.08): Station plates naming each section. Case-page titles use the heavier case headline (800, clamp 38–76px, 1.1), second line in pine.
- **Title** (700, clamp 21–26px, 1.5): Station leads and the terminus lead; title-sm (700, 21px) for rule, log and FAQ headings.
- **Body** (500, 17px, 1.7, tabular numerals): Prose capped at 65ch; hero intro at 34em.
- **Label** (Barlow 600, 11–15px, +0.01em): English sub-lines in graphite-3; station codes in Barlow 800 12px, +0.03em.

### Named Rules
**The Bilingual Plate Rule.** Every heading that names a place is a pair: Chinese in the display face, English beneath or beside it in Barlow 600 at roughly a third of the size, in graphite-3 (70% white on graphite). Never ALL CAPS, never letterspaced wide.

**The WW Hei Subset Rule.** The CJK display face is a subset; any change to Chinese display copy requires regenerating the subset, or glyphs fall back mid-word.

## Layout

A single centred column, max 1360px, with a fluid gutter (clamp 16–56px). Content inside `main` is indented by the rail offset (64px, 40px under 820px) so the vertical rail and its stops sit in the left margin of every station. Stations are separated by a 1px rule and generous vertical padding (clamp 72–128px); chapters on case pages are tighter (clamp 52–84px).

Station content uses asymmetric two-column grids: copy left (~0.75fr, sticky under the header), lightbox wall right (~1.35fr); the hero flips weight toward the screenshot (0.85fr / 1.25fr). Gaps are clamp 28–64px. The lightbox wall is a wide desktop shot above a phone shot and a 1:1 detail call-out.

The header is sticky: a 58px graphite signage bar over a ground-coloured line map with one evenly-spaced column per station. Responsive steps: 1100px collapses all grids to one column and unsticks copy; 820px shrinks the rail and stops, hides the station list in favour of a bar plus "now at" text, and reflows the departure board into stacked rows; 520px drops English platform sub-lines.

## Elevation & Depth

Mostly flat. Depth is tonal: graphite panels (signage bar, lightboxes, board, terminus) against signage white. Shadows are reserved for objects that physically hang: lightbox frames, the departure board, the call-out image and the dialog, all with long, soft, negative-spread drops. Rings drawn with zero-blur spread shadows are the stop and roundel vocabulary (interchange rings), not elevation.

### Shadow Vocabulary
- **Hanging lightbox** (`box-shadow: 0 30px 50px -30px rgba(28,32,36,.55)`): screenshot frames.
- **Hanging board** (`box-shadow: 0 30px 50px -34px rgba(28,32,36,.6)`): departure board.
- **Call-out lift** (`box-shadow: 0 10px 24px -14px rgba(28,32,36,.5)`): 1:1 detail image.
- **Dialog** (`box-shadow: 0 40px 80px -30px rgba(28,32,36,.6)`).
- **Interchange ring** (`box-shadow: 0 0 0 3–5px <colour>`): roundel (white), current stop (yellow), transfer-chip marker (graphite), live dot (tinted).

### Named Rules
**The Hanging Sign Rule.** Only things that hang on a platform cast a shadow. Text blocks, timetables and chips stay flat.

## Shapes

Round where the transit system is round, square-ish where it is signage. Stops, roundels, the train marker and FAQ markers are full circles; the rail and line-map track are 10px capsules; transfer and board chips are pills. Controls (buttons, tools, direction plate) take a small 6px corner; station-code tags 4px; lightbox frames 8px on top with the platform sign closing the bottom, so frame and sign read as one object. Larger panels (board, dialog, call-out) use 10px. The phone lightbox uses a 30px top radius to read as a device. The 1:1 call-out is outlined with a 2px dashed pine stroke.

## Components

### Buttons
- **Shape:** small corner (6px), 50px tall, 2px border, Barlow 700 16px.
- **Go (primary):** platform-edge yellow fill, graphite text; hover deepens to worn edge; focus ring switches to graphite so it shows against yellow.
- **Line (secondary):** 2px graphite outline, transparent; hover fills graphite with white text.
- **Quiet:** underlined graphite-2 text, 8px inline padding; hover gets the panel tint.
- **Light:** for graphite grounds; 40% white outline, fills white on hover.
- **Press:** all buttons sink 1px on `:active`; transitions 0.2s on the rail easing.

### Signage Bar and Line Map
Graphite 58px bar with a pine roundel (36px, white ring), bilingual line name, outlined tools (38px, 1.5px 28% white border) and a pine **direction plate** ("开往 联系"). Below, the line map: a 10px pine track with 20px white stops ringed in pine; passed stops fill deep pine; the current stop goes yellow with a graphite border and a 4px yellow halo. A yellow train disc with a 4px graphite border rides the track with scroll (linear, 0.25s).

### Rail and Stops (signature)
A vertical 10px pine rail runs the length of `main`, ending in a yellow buffer bar ringed in graphite. Each station has a 38px circular stop on the rail (white, 6px pine ring, Barlow 800 code); passed stops fill deep pine with white text; the current stop adds a 5px yellow halo. On the terminus, stops invert to graphite.

### Station Plates
The section heading as a metro plate: headline Chinese with English inline beside it, and **transfer chips** pushed right: 38px pills with a 1.5px graphite outline and a small white interchange-ring marker; hover fills graphite.

### Lightboxes and Platform Signs (signature)
Real screenshots sit in a 10px graphite frame (8px top corners, hanging shadow). Directly beneath, a graphite **platform sign**: pine station-code tag (WW-01, WW-02), bilingual name, and a right-aligned "下一站 / Next" link. Phone shots use a 9px frame with 30px top corners. An illustrated interface must say so on its platform sign ("界面示意图，非产品截图 / Illustration, not a product screenshot"). Below-the-fold images develop from a grey, blurred, washed print over 1.6s on first arrival; reduced motion and the motion toggle skip it.

### Timetable
Spec lists as a timetable: 2px graphite top rule, rows of bilingual label (min 88px) and bold value, 1px rule-grey separators. Tech stacks inside a value are separated by pine middots.

### Departure Board
Projects listed as a graphite departure board (10px corners, hanging shadow); night-graphite header with bilingual column labels; rows separated by 10% white hairlines, faint hover tint. The last column holds pill "go" chips (34px, 40% white outline) that fill yellow on hover. Under 820px rows stack into blocks with middot-joined metadata.

### Rules, Log and FAQ
Numbered rules use a large Barlow 800 pine numeral (44px; 34px compact) in a 72px column. The log is a mini line: 14px pine-ringed dots, dates in pine tabular numerals. FAQ items are rule-separated details with a 32px circular plus that rotates 45° and turns yellow when open.

### Dialog and Toast
Project overview dialog: signage-white panel, 2px graphite border, 10px corners, dimmed graphite backdrop, sticky 42px circular close (white, yellow on hover). Actions reuse the go/line pairing at 46px. Toast is a graphite 8px capsule that slides up from the bottom edge on the rail easing.

### Terminus
The contact station is a full-bleed graphite section; the email address is set in Barlow 800 at clamp 28–58px with a 3px yellow underline that becomes yellow text on hover.

## Do's and Don'ts

### Do:
- **Do** put every new section on the line: a station plate, a stop on the rail, and a code in the WW-NN sequence.
- **Do** keep yellow (#f2c230) for the current position, the train, focus and the single primary action.
- **Do** frame real screenshots in graphite with a platform sign, and caption illustrations as illustrations on that sign.
- **Do** pair Chinese and English on every place name, English in Barlow 600 graphite-3.
- **Do** move along the line linearly (`cubic-bezier(.16,1,.3,1)` for UI, linear for the train) and honour the motion toggle and reduced motion.

### Don't:
- **Don't** introduce a second route colour or recolour the line per section.
- **Don't** use yellow as decoration, a highlight band or a second CTA.
- **Don't** add shadows to text blocks, chips or timetables; only hanging objects drop shadows.
- **Don't** present the DevTools interface, or any mock, as a product screenshot.
- **Don't** set English labels in ALL CAPS with wide tracking; signage English here is sentence case.
