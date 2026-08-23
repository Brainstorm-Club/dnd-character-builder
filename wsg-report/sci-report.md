# SCI Benchmark Report

**Date**: 2026-08-23T08:18:56.130Z
**Commit**: c63b109
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 13 | 0 B | 0 B | 21.290 | 0.064 | 21.354 |
| data-load-brancalonia | 6 | 0 B | 0 B | 9.339 | 0.028 | 9.367 |
| data-load-dnd2024 | 8 | 0 B | 0 B | 13.719 | 0.041 | 13.760 |
| data-load-apocalisse | 5 | 0 B | 0 B | 7.851 | 0.024 | 7.874 |
| calculations-1000x | 1 | 0 B | 0 B | 2.388 | 0.007 | 2.396 |
| json-serialize-character | 0 | 0 B | 776 B | 0.737 | 0.002 | 0.740 |
| build-output-analysis | 1 | 5.41 MB | 0 B | 1.424 | 0.004 | 1.428 |
| pdf-template-read | 1 | 0 B | 3.09 MB | 2.197 | 0.007 | 2.203 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 7.145 | 0.022 | 7.167 |

**Total**: 66.290 mgCO₂eq across 9 tools in 39ms
