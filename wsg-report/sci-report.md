# SCI Benchmark Report

**Date**: 2026-08-23T20:23:40.249Z
**Commit**: c48dff7
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 22 | 0 B | 0 B | 37.169 | 0.112 | 37.282 |
| data-load-brancalonia | 8 | 0 B | 0 B | 13.335 | 0.040 | 13.375 |
| data-load-dnd2024 | 13 | 0 B | 0 B | 21.510 | 0.065 | 21.575 |
| data-load-apocalisse | 7 | 0 B | 0 B | 11.607 | 0.035 | 11.642 |
| calculations-1000x | 3 | 0 B | 0 B | 5.483 | 0.017 | 5.500 |
| json-serialize-character | 0 | 0 B | 776 B | 0.801 | 0.002 | 0.804 |
| build-output-analysis | 2 | 6.14 MB | 0 B | 3.121 | 0.009 | 3.131 |
| pdf-template-read | 8 | 0 B | 3.14 MB | 13.440 | 0.041 | 13.480 |
| i18n-load-single-locale | 108 | 0 B | 0 B | 179.080 | 0.541 | 179.621 |

**Total**: 286.409 mgCO₂eq across 9 tools in 171ms
