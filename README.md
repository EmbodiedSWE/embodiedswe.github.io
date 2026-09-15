# embodiedswe.github.io

Project page for **EmbodiedSWE: Coding Agents for Long-Horizon Dexterous Robotics**.

Static site — no build step, no dependencies. `index.html` + `assets/`.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Open it through a server rather than `file://` — the gallery videos and the
scroll-spy nav both need real HTTP.

## Layout

```
index.html              the whole page
assets/css/site.css     palette + layout (one stylesheet)
assets/js/site.js       task gallery, catalog table, filters, nav, theme
assets/js/bulb.js       scroll-scrubbed bulb intro (frame sequence on a canvas)
assets/js/title.js      title stage: paper title, authors and organizations pop in on scroll
assets/js/hero.js       moving star field behind the title stage, and its pause control
assets/js/diversification.js  five-level animated walkthrough of the original renders
assets/js/task-timeline.js  twelve-task viewer with five recorded frames per task
assets/js/pipeline.js   four-contribution loop, connectors, and stage explanations
assets/js/charts.js     the three animated SVG charts
assets/img/fig/         paper figures, re-rendered for web (overview,
                        long-horizon filmstrips, diversification)
assets/img/poster/      one poster frame per gallery clip
assets/video/           15 task rollouts, 1280px, silent, looping
```

## The animated charts

Eight charts are inline SVG built in `assets/js/charts.js` — no chart library.
They replaced every plot that used to ship as a JPEG, so `assets/img/fig/` now
holds only the three photographic figures.

| host | shows |
|---|---|
| `[data-chart="line"]`          | best-so-far score vs. wall-clock, six models |
| `[data-chart="bars"]`          | share of the benchmark solved |
| `[data-chart="spend"]`         | score vs. spend per task, log axis |
| `[data-chart="transfer-task"]` | cross-task transfer: similar / dissimilar / no hint |
| `[data-chart="transfer-emb"]`  | cross-embodiment transfer: Gen3 / xArm7 / no hint |
| `[data-chart="yield"]`         | data-engine trajectories per level, log axis |
| `[data-chart="rl-reward"]`     | PPO reward components + fitted trend |
| `[data-chart="rl-rate"]`       | PPO success / non-zero / partial rates |

Adding one means adding a `CHARTS` entry and a `<div class="chart-card"
data-chart="…">` — `mkLine(spec)` handles linear or log x, tick formatting,
legends, endpoint labels and a zero line.

Animation: an `IntersectionObserver` at `threshold: 0.3` fires **once** per
chart; children get `.animate` on a ~100 ms stagger; every transition is
`cubic-bezier(.4, 0, .2, 1)`. Lines draw on via `stroke-dashoffset` (1.1 s),
bars grow with `transform: scaleX/scaleY` off `transform-box: fill-box`
(0.8 s), and value labels fade up while counting from zero. A dashed series
would fight the draw-on, so its dash pattern is applied on `transitionend`,
once the line has finished drawing. `prefers-reduced-motion: reduce` renders
the final state with no transitions.

### Where the line data comes from

It is the paper's own, not retraced by eye. Its figure PDFs are vector, so each
series was read out of the path geometry and calibrated against that axis' own
tick marks:

```bash
pdftocairo -svg figures/base_main.pdf out.svg     # then parse the polylines
```

Series are picked by `stroke="rgb(…)"`, `stroke-width` and `stroke-dasharray`
(which is how the base and `+ tools` runs, drawn in one colour, are told
apart), and raw traces are dropped by their `stroke-opacity="0.3"`.
Coordinates are PDF y-up. Multi-panel figures need **per-panel** tick origins —
using panel 1's origin for panel 2 silently shifts the x axis, which is worth
re-checking if a figure is regenerated.

The calibration is self-checking: every extracted endpoint reproduces its
published value to ~0.001.

| series | extracted | published | source |
|---|---|---|---|
| Fable 5.1 / Opus 5 / Opus 4.8 / Sol / Terra | 0.749 / 0.661 / 0.521 / 0.440 / 0.260 | 0.75 / 0.66 / 0.52 / 0.44 / 0.26 | `T2_per_model.tex` |
| GPT-6 Astra (rebuilt from raw grades, see below) | 0.941 | 0.94 | `T2_per_model.tex` |
| similar / dissimilar / no hint | 0.599 / 0.514 / 0.520 | 0.60 / 0.51 / 0.52 | `G1_settings.tex` |
| Gen3 / xArm7 | 0.740 / 0.660 | 0.74 / 0.66 | `G1_settings.tex` |
| RL task-reward trend slope | +0.049 / 100 steps | +0.049 / 100 steps | figure annotation |

Bar and yield values are the published numbers verbatim.

The GPT-6 Astra series (`DATA.base.astra`, `DATA.spend.astra`, plus its
`MODELS` entry) is not a PDF extraction: it was added to the paper after the
five-model figures were drawn, so it is rebuilt from the raw replay grades and
token logs in `reference/cosigen_plotting.zip` (`data/astra/`,
`data/scores_astra_*.json`) with the same procedure as the paper's
`plot_base_main6.py` / `overlay_base_cost.py`: per run, best score so far on a
481-point wall-clock grid (or a 400-point log-spend grid at Astra list prices,
$10 / $1 / $50 per M uncached / cached / output tokens), averaged over the 28
tasks, then compressed to its change points. Rebuilding reproduces T2 exactly
(0.94 ± 0.03, 82 % solved, 154 min, median 39 min to solve).

### Source drift to watch (checked against the 2026-09-09 23:13 draft)

The draft is mid-update, and the site currently mirrors its **prose**. Three
things to know before editing copy:

1. **A sixth model, `GPT-6 Astra` (Codex), is now on the site** (2026-09-14):
   table row, wall-clock and spend series, and the solved-share bar, from
   `T2_per_model.tex` (0.94 ± 0.03, **82%** solved, hack rate **0%**) and the
   raw grades in `reference/cosigen_plotting.zip`. Prose drift remains in the
   paper: `code_as_solver.tex` lists six models but still says "We evaluate
   five frontier models" and "none approaches saturation", and the abstract
   still says the benchmark "remains far from saturated". The section-02 copy
   keeps the "gap is discovery" framing and adds one sentence on Astra. Note
   also that `make_tables_astra.py`'s docstring says the Astra runs were *not*
   hack-audited even though the tables print 0%.
2. **Model names shortened.** The tables now say `Sol`, `Terra`, `Astra`; the
   site still says "GPT-5.6 Sol" / "GPT-5.6 Terra", matching the prose.
3. **Tool runs: figure and table still disagree.** `tools_main.pdf` ends at
   **0.74** (Opus 5 + tools) and **0.54** (Sol + tools); `T8`'s mean row says
   **0.70** and **0.51**. Both agree exactly on the base runs (0.66 / 0.44), so
   the calibration is not in question — the two are computed differently. The
   site quotes the figure, since the figure is what it draws.

Resolved by the update: the cross-embodiment prose no longer carries the stale
0.96 / 0.92 figures, so the site's 0.74 / 0.66 / 0.52 now agrees with the paper
throughout. `gen_main.pdf` and `tools_main.pdf` were **not** changed by the
update, so the transfer and tool charts remain current. There is also a new
combined `gen_tools_main.pdf` the paper now references in place of the two
separate figures.

## Scroll motion

`assets/js/site.js` adds a small scroll-motion layer on top of the chart
animations:

- a 2 px **progress line** along the bottom of the sticky nav, driven by
  `scaleX` off scroll position;
- **reveal on scroll** — content fades up 18 px as it enters view, once each,
  via `IntersectionObserver` at `threshold: 0.12` with an `-8%` bottom margin,
  so it triggers just before an element is fully in frame;
- a **staggered** entrance for siblings inside `.lanes`, `.grid2`, `.grid3`,
  `.stats`, `.gen-notes`, and `.gallery` — 70 ms apart;
- the **project introduction** reveals on scroll below the full-screen opening,
  with the opening figure settling in from 30 px and 0.985 scale;
- `hr.rule` section dividers that **draw out from the left**;
- a capped 18 px **parallax** on the opening figure, ≥900 px viewports only.

Everything uses `cubic-bezier(.22, .61, .36, 1)` — ease-out, no overshoot.

Two implementation notes worth keeping:

**The stagger schedules when `.rv-in` is added, not an inline
`transition-delay`.** A lingering `transition-delay` applies to *every* later
transition on that element, which would have delayed the gallery cards' hover
by up to a second.

**The hidden state is gated on `html.reveal`, which only JS adds** — and it is
added in the same synchronous pass that tags the elements, so the two never
disagree. With JavaScript off, `html.reveal` is never set, nothing is hidden,
and the page degrades to plain static HTML rather than a blank screen.

`prefers-reduced-motion: reduce` drops all of it: final state, no transitions,
no parallax, no stagger.

## Full-screen opening

The page opens with the bulb intro (`assets/js/bulb.js`): a 400vh scroll track
with a pinned canvas that scrubs through 261 pre-rendered frames of a gripper
screwing in a light bulb. Over the last frames the lit bulb dissolves into the
fixed star field.

The title stage (`header.hero`, `assets/js/title.js`) pins while the bulb is
still dissolving (a 108vh overlap) and pins one page for a 175vh track (170vh on phones), so the whole reveal takes under one screen of scrolling. As
the visitor scrolls, `title.js` writes `--t` (0..1) onto every `[data-pop]`
element and CSS turns that into the pop: rise, un-blur, settle to full size.
The reveal runs in quick beats: the wordmark blooms as the bulb's last wisps go
(0–22% of the track) with the subtitle right behind it (8–30%); then the three
author tiers pop in one after another: project leads (28–42%), contributors
(38–56%), advisors (52–66%); then the institutions and the ordering note
(62–76%) and the footer (72–80%). The page holds briefly (80–100%) and the
research follows. A group may also carry an `out` window to dissolve again
(`--x`, 0..1); nothing uses it at the moment. Items inside a group overlap so they read as one cascade. The
shown progress eases toward the scroll position each frame, so a fast flick
still lets every word land. `?title=0.6` freezes the stage at a progress for
screenshots. Windows and easing are the knobs at the top of `title.js`.

Without JavaScript nothing is hidden and the stage is an ordinary page; with
`prefers-reduced-motion: reduce` the track collapses to one static page and
everything is simply shown.

`assets/js/hero.js` draws the slowly moving star field behind it: a tilted
torus of teal, sand, and blue particle streams that echo the solver, teacher,
and student loop. Canvas 2D, no external dependencies: 6,200 particles on
desktop, 2,600 on mobile, capped device-pixel ratio of 1.75. The field is fixed
behind the whole page, dims to 32% opacity once the title stage has scrolled
away, keeps moving at roughly 30 fps while offscreen, and stops when the tab is
hidden. The pause/play controls in the opening and sticky navigation stay
synchronized; reduced-motion preferences start with a static frame that
visitors can explicitly play.

## Research-page styling

The default palette continues the opening's dark sky, warm white type, and teal,
sand, and blue accents through the research content. Translucent dark panels
keep charts, tables, code, and task descriptions readable over the persistent
stars. Roomier sections and lighter headings echo the opening typography.
The navigation keeps section links in their own horizontally scrollable area,
with theme and animation controls always accessible on narrow screens.
An optional light reading theme is available; an explicit saved choice is kept.

## Animated diversification figure

The data-engine section leads with a full-width viewer ("Five hierarchical levels
of diversification") that cycles through
Scene, Strategy, Phase, Dynamics, and Visual every 6.5 seconds; it is the only
description of the five levels (the earlier L1–L5 text ladder duplicated it and
was removed). Each level leads with its name in the level colour and a short tagline,
then the explanation, then three tiles. The Scene level's tiles are short
looping muted clips from `assets/video/diversification/` (WebP posters beside
them) under a single row caption instead of per-tile labels; the other levels
show original render crops with per-tile labels; there is no multiplier readout or pause button. The two notes on verification
and token cost sit below the viewer beside the yield chart (`.gen-notes`). Individual 1920 × 1080 WebP renders in
`assets/img/diversification/` replace the tiny crops from the combined JPEG.
SVG viewBoxes preserve the original figure's framing; dynamics noise bands and
parameter ranges are SVG annotations. The complete source figure is no longer
linked or captioned; it serves only as the no-JavaScript fallback.

Level buttons pause automatic advancement for inspection (there is no Next
button, footer row or live-region status line); the timer suspends offscreen
and in hidden tabs. Reduced motion starts paused and
removes frame transitions. Without JavaScript, the original montage stays visible.

## Long-horizon task timeline

`#task-timeline` replaces the dense twelve-task filmstrip with one large 1080p
frame, a task sidebar (a select menu on mobile), and five clickable thumbnails.
Play steps through the five recorded samples every 2.4 seconds; it is not
real-time video. Task and frame selection pause playback for inspection.
Playback pauses offscreen, while an image decodes, and when the tab is hidden.
Reduced motion starts paused and disables frame fades. The original montage is
linked below the viewer and remains visible when JavaScript is unavailable.

Assets in `assets/img/task-timeline/` include sixty original-resolution WebP
frames and sixty 320 × 180 thumbnails. They load as needed for the selected task,
with only the next full-size frame prefetched during playback. Source picks,
stage descriptions, and recorded times follow the figure2 source notes; partial
outcomes are labeled rather than represented as complete solves. See that asset
folder's `SOURCES.md` for provenance and frame indices.

## Scene and research loop

The opening figure now shows only the kitchen scene and its four callouts.
`assets/img/fig/scene.webp` was rendered from the top of the paper's original
`figures/overview.pdf` at 2150 × 926 pixels using `pdftocairo` (360 DPI, crop
x=0, y=0, width=2150, height=926), then encoded as WebP at quality 94.
The complete earlier `overview.jpg` is retained.

`#pipeline` follows Figure 1 (page 2) of the September 11, 2026 draft at
`experiments/snapshots/paper_draft/Coding_agent_for_robotics.pdf` in the parent
CoSiGen workspace: New Benchmark, Agent Evaluation, Data Generation
+ VLA, and Agent Improvement. The return connection goes from stage 04 back to
the solver in stage 02, labeled “Improved agent becomes the solver.” The dashed
route remains conceptual: Section 5.1 still says the full pipeline has not been
run end to end. The scene is unchanged in the new figure; responsive images
explicitly use `height: auto` to preserve their original aspect ratios.

All connectors and SVG miniatures run concurrently, with continuous particles
and directional arrows (no stage dwell time). The solver includes agent →
solution code → simulator → simulation feedback; the teacher shows all five
diversification dimensions, a large dataset, and VLA training; the student shows
seed task → task generation → new tasks → verified outcomes → RL → coding agent.
These are conceptual animations, not additional experimental results.

Selecting a stage or Next (a pill in the loop heading) shows its explanation and
section link without interrupting the flow or automatically replacing the text
while it is read. Narrow layouts stack cards and enlarge the SVGs on phones.
There is no pause button; offscreen/tab visibility and reduced-motion settings
control playback. The loop has no footer row, caveat, or expandable
solver/teacher/student block any more. Without JavaScript, all four cards remain readable.

Loop icon sources: the two coding-agent nodes share an original inline SVG brain
outline, tinted to their stage colors. The policy-training node uses the official
[NVIDIA Isaac GR00T artwork](https://github.com/NVIDIA/Isaac-GR00T/blob/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/media/header_compress_green.png)
and [Physical Intelligence π logo](https://www.pi.website/download/brand/logo-light.svg).
The NVIDIA PNG is stored unmodified at `assets/img/fig/groot-official-header.png`;
an SVG alpha mask displays only the robot/network icon in the teacher's color.
The π path preserves the official SVG geometry and inherits the same color.
These are recolored research-figure illustrations, not claims of endorsement;
the respective marks belong to NVIDIA and Physical Intelligence.

## Search indexing is off

`index.html` carries `<meta name="robots" content="noindex, nofollow">` and
`robots.txt` disallows all crawlers, because the paper is under review. The page
is fully live and shareable by link — it just will not appear in search results.

To allow indexing, delete `robots.txt` and that one meta tag, then push.

## Before going public

- Advisor names in the title stage still link to `#`; add their pages. Institutions: 1 ByteDance Seed, 2 Yale, 3 Princeton, 4 CMU, 5 Stanford, 6 UCLA.
- Paper, arXiv, Blog and Code badges are inert placeholders; wire them up as each lands.
- The BibTeX entry is a placeholder.
