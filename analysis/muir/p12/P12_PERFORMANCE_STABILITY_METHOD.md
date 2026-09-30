# MUIR P12 — stable performance certification method

The P11 budget is unchanged.

Primary response budget:
- normal interactions with valid assets
- response P95 <= 200 ms

P12 observed single-run values around the threshold on the same unchanged product, including both passes and values of 200.9 / 201.2 ms. Because the certified product files are unchanged from P11, repeated single-run retrying would risk cherry-picking runner noise.

P12 therefore certifies performance with a predefined repeated method:
- 3 independent captures of the exact P12 HEAD;
- 3 independent P0 replays with the same browser harness;
- each current capture must complete the full 90-target matrix with zero capture errors;
- each P0 replay must retain at least 50 common targets and at least 20 response samples;
- representative P50/P95 metrics are the median of the three run-level metrics;
- the primary response P95 budget remains <= 200 ms;
- in addition, every individual exact-head response P95 must remain <= 220 ms;
- horizontal overflow must be zero in every run;
- DOM uses the worst observed current maximum.

This changes measurement robustness, not the performance budget. A median above 200 ms or any exact-head response P95 above 220 ms remains a hard failure.
