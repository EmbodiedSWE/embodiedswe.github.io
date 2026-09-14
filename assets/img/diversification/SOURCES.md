# Diversification renders

These WebP files retain the original 1920 × 1080 resolution. They were exported
with FFmpeg (`-c:v libwebp -quality 92`) from the figure7 source PNGs at
`/home/yilang/research/embodiedswe-figures/figure7/tiles/`.
No generated detail, sharpening, or upscaling is applied.

| WebP | Source PNG relative to tiles/ |
| --- | --- |
| banana | scene/object_type/banana.png |
| carrot | scene/object_type/carrot.png |
| tomato | scene/object_type/tomato.png |
| nominal | strategy/recovery/nominal_exposure.png |
| recovery | strategy/recovery/recovery_exposure.png |
| grasp-right | strategy/grasp_side/right_first.png |
| bolting | phase/entry/bolting.png |
| ram | phase/entry/ram.png |
| gpu | phase/entry/gpu.png |
| transport | dynamics/action_noise/transport.png |
| insertion | dynamics/action_noise/insertion.png |
| daylight | phase/intermediate/original.png |
| warm | visual/warm.png |
| side | visual/side.png |

Crop centers and heights follow `figure7/make_fig7_flow.py`'s TILES manifest.
Recovery images are the source figure's multiple-exposure composites, not single
frames. Dynamics noise paths and physical-parameter ranges are illustrative SVG
annotations based on that figure builder, not additional measured trajectories.

# Diversification clips (assets/video/diversification/)

One looping mp4 (h264, 720 × 480, silent, `crf 20`) + a first-frame WebP poster per player tile, cut by
`experiments/snapshots/figure7/tools/make_web_clips.py` from the same simulation runs as the stills above.
Each clip's crop box is derived from the player's still crop centre the same way `diversification.js`
crops the WebP, so a clip lines up with the tile it replaces. The sources are time-lapses (one frame per
0.5-5 sim-seconds), so the display rate is chosen per clip for a 3-9 s loop (the three Scene clips stop after the second slice); no frames are synthesised
except the two pc_all keyframe clips (see below). The Dynamics tiles keep their annotated stills.

| clip | source (experiments/snapshots/) | frames | fps | s | KB |
| --- | --- | --- | --- | --- | --- |
| banana | backdrops/slice_banana/frames [22..62] | 41 | 12 | 3.4 | 327 |
| carrot | figure7/runs/slice_carrot/frames [22..62] | 41 | 12 | 3.4 | 319 |
| tomato | figure7/runs/dice_tomato/frames [18..62] | 45 | 12 | 3.8 | 325 |
| nominal | figure7/runs/bulb_traj/base2_clip/frames [0..697] | 234 | 30 | 7.8 | 292 |
| recovery | figure7/runs/bulb_traj/recovery_clip/frames [0..2087] | 262 | 30 | 8.7 | 423 |
| grasp-right | figure7/runs/fold_right_first_dense [1..110] | 110 | 20 | 5.5 | 288 |
| bolting | figure7/runs/pc_states/frames [0..60] | 61 | 12 | 5.1 | 271 |
| ram | figure7/runs/pc_states/frames [256..274] | 19 | 4 | 4.3 | 169 |
| gpu | figure7/runs/pc_states/frames [274..282] | 9 | 2.5 | 2.8 | 157 |
| daylight | figure7/runs/egg_states/stage/clip_day/cam [40..170] | 131 | 24 | 5.5 | 495 |
| warm | figure7/runs/egg_states/stage/clip_warm/cam [40..170] | 131 | 24 | 5.5 | 509 |
| side | figure7/runs/egg_states/stage/clip_day/side [40..170] | 131 | 24 | 5.5 | 360 |

Notes on the sources:

- **nominal / recovery** are replays (`figure7/tools/bulb_traj_replay.py`) of the recorded trajectories the
  Recovery exposures were built from: `bulb_recovery_traj/bulb_recover.npz` (recovery: grasp, the bulb slips
  and drops, the arm re-descends, regrasps, threads and seats it) and the nominal solve recorded from that
  recording's step-0 layout (`runs/bulb_base2_states`). Wide camera, every 8th / 3rd recorded step.
- **grasp-right** is a dense re-run of the swapped-sleeve fold solution (`tools/fold_right_first/solve.py`,
  400 frames over the 4410-step fold); the clip covers the first grasp and fold of the right sleeve.
- **bolting / ram / gpu** slice the recorded pc_all solve at the three entry states (0 / 256 / 274) from
  the solve camera. The RAM and GPU phases exist only as 19 and 9 keyframes 5 sim-s apart, so those two
  clips are dissolved between keyframes (`minterpolate mi_mode=blend`) rather than stepped. The Phase
  stills were staged from a camera that looks into the case; the clips keep the solve camera.
- **daylight / warm / side** are ONE recorded egg-carton trajectory (`runs/egg_states/states` 40..170)
  re-rendered from the banked states with `backdrop_run.py --mode stage` (plan `stage_clips.json`,
  a `range` sequence entry): nominal light from the solve camera and the `side` rig, then the warm3
  lighting (all 13 room lights tinted (1, 0.62, 0.32) × 0.8, task light warm) from the solve camera.
  The physical trajectory is identical across the three clips.
