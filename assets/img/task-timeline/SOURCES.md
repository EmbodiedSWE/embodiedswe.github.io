# Long-horizon task frames

Source: `/home/yilang/research/embodiedswe-figures/figure2/<task>/kf<index>.png`.
These are the same five picks per task used by `make_draft2.py` and the original
website filmstrip. Each source folder's `PICKS.txt` documents its recording.

| Task folder | Selected keyframe indices |
| --- | --- |
| tshirt | 0, 2, 4, 7, 9 |
| pc_all | 0, 2, 4, 7, 9 |
| ikea_table | 0, 2, 4, 7, 9 |
| so101 | 0, 2, 4, 7, 9 |
| box_to_bin | 0, 2, 4, 7, 9 |
| slice_banana | 0, 2, 4, 7, 9 |
| syringe | 0, 1, 2, 3, 4 |
| tool_packing | 0, 1, 2, 3, 4 |
| latte | 0, 1, 2, 3, 4 |
| bulb | 0, 1, 2, 3, 4 |
| egg_carton | 0, 1, 2, 3, 4 |
| wheel_carry | 0, 1, 2, 3, 4 |

`<task>-<index>.webp` preserves the original 1920 × 1080 resolution, exported
using FFmpeg's libwebp encoder at quality 90. `<task>-<index>-thumb.webp` is a
320 × 180 thumbnail, quality 85. No generated frames or upscaling are used.

The player shows recorded times from PICKS.txt where available. T-shirt timestamps
were not supplied in that manifest; latte's runner timestamps are known to differ
from its simulation clock, so both tasks use frame labels instead. Playback
intervals are presentation timing, not simulated elapsed time or percentages.

The banana rollout is partial (6 of 7 cutting planes released). The arm-assembly
rollout attaches the forearm but ends with some loose fasteners. Their task notes
retain those qualifications from the source records. Robot labels follow the
original figure's per-task captions.
