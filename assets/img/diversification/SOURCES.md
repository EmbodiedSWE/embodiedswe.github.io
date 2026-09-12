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
