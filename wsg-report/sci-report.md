# SCI Benchmark Report

**Date**: 2026-08-23T07:12:24.336Z
**Commit**: 4bc2856
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 11 | 0 B | 0 B | 18.673 | 0.056 | 18.730 |
| data-load-brancalonia | 4 | 0 B | 0 B | 7.264 | 0.022 | 7.286 |
| data-load-dnd2024 | 8 | 0 B | 0 B | 12.887 | 0.039 | 12.926 |
| data-load-apocalisse | 4 | 0 B | 0 B | 6.631 | 0.020 | 6.651 |
| calculations-1000x | 2 | 0 B | 0 B | 2.533 | 0.008 | 2.540 |
| json-serialize-character | 0 | 0 B | 776 B | 0.702 | 0.002 | 0.704 |
| build-output-analysis | 1 | 5.35 MB | 0 B | 1.251 | 0.004 | 1.255 |
| pdf-template-read | 1 | 0 B | 3.03 MB | 2.055 | 0.006 | 2.061 |
| i18n-load-single-locale | 88 | 0 B | 0 B | 145.591 | 0.440 | 146.031 |

**Total**: 198.184 mgCO₂eq across 9 tools in 119ms
