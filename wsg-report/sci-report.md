# SCI Benchmark Report

**Date**: 2026-08-23T00:37:58.805Z
**Commit**: de3f8a7
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 11 | 0 B | 0 B | 18.390 | 0.056 | 18.446 |
| data-load-brancalonia | 5 | 0 B | 0 B | 7.996 | 0.024 | 8.020 |
| data-load-dnd2024 | 7 | 0 B | 0 B | 11.430 | 0.035 | 11.465 |
| data-load-apocalisse | 3 | 0 B | 0 B | 5.613 | 0.017 | 5.630 |
| calculations-1000x | 1 | 0 B | 0 B | 1.971 | 0.006 | 1.977 |
| json-serialize-character | 0 | 0 B | 776 B | 0.754 | 0.002 | 0.756 |
| build-output-analysis | 1 | 5.31 MB | 0 B | 1.347 | 0.004 | 1.351 |
| pdf-template-read | 1 | 0 B | 3.03 MB | 1.052 | 0.003 | 1.055 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 6.159 | 0.019 | 6.178 |

**Total**: 54.879 mgCO₂eq across 9 tools in 33ms
