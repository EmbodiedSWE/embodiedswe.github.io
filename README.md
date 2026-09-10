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
assets/js/charts.js     the three animated SVG charts
assets/img/fig/         paper figures, re-rendered for web (overview,
                        long-horizon filmstrips, diversification, 4 failure modes)
assets/img/poster/      one poster frame per gallery clip
assets/video/           15 task rollouts, 1280px, silent, looping
```

## The animated charts

Nine charts are inline SVG built in `assets/js/charts.js` — no chart library.
They replaced every plot that used to ship as a JPEG, so `assets/img/fig/` now
holds only the three photographic figures.

| host | shows |
|---|---|
| `[data-chart="line"]`          | best-so-far score vs. wall-clock, five models |
| `[data-chart="bars"]`          | share of the benchmark solved |
| `[data-chart="spend"]`         | score vs. spend per task, log axis |
| `[data-chart="transfer-task"]` | cross-task transfer: similar / dissimilar / no hint |
| `[data-chart="transfer-emb"]`  | cross-embodiment transfer: Gen3 / xArm7 / no hint |
| `[data-chart="tools"]`         | with and without the harness tools, both models |
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
| similar / dissimilar / no hint | 0.599 / 0.514 / 0.520 | 0.60 / 0.51 / 0.52 | `G1_settings.tex` |
| Gen3 / xArm7 | 0.740 / 0.660 | 0.74 / 0.66 | `G1_settings.tex` |
| Opus 5, Sol (tool experiment, base) | 0.661 / 0.440 | 0.66 / 0.44 | `T8_tools_per_task.tex` |
| RL task-reward trend slope | +0.049 / 100 steps | +0.049 / 100 steps | figure annotation |

Bar and yield values are the published numbers verbatim.

### Source drift to watch (checked against the 2026-09-09 23:13 draft)

The draft is mid-update, and the site currently mirrors its **prose**. Three
things to know before editing copy:

1. **A sixth model, `Astra` (Codex), is in the tables and figures but not the
   prose.** `T2_per_model.tex` gives it mean 0.94 ± 0.03, success **82%**, hack
   rate **0%**; `base_main.pdf` and `base_cost.pdf` were redrawn with six
   series. But `code_as_solver.tex` still says "We evaluate five frontier
   models" and "none approaches saturation", and the abstract still says the
   benchmark "remains far from saturated". **The site shows the five-model
   story.** Adding Astra means re-extracting `base_main`/`base_cost` and
   rewriting the "Frontier agents remain unsaturated" section — a narrative
   call, not a mechanical one.
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
  `.stats`, `.ladder`, `.gallery` and `.fm-row` — 70 ms apart;
- a **hero entrance** on load (eyebrow → title → tagline → authors → badges,
  90 ms apart) with the opening figure settling in from 30 px and 0.985 scale;
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

## Search indexing is off

`index.html` carries `<meta name="robots" content="noindex, nofollow">` and
`robots.txt` disallows all crawlers, because the paper is under review. The page
is fully live and shareable by link — it just will not appear in search results.

To allow indexing, delete `robots.txt` and that one meta tag, then push.

## Before going public

- Author list is a placeholder (`Author list withheld — anonymous submission`).
- Paper, arXiv and Blog badges are inert placeholders; wire them up as each lands.
- The BibTeX entry is a placeholder.
- The Code badge points at the org, not a repo.
