# SCI Benchmark Report

**Date**: 2026-08-23T09:39:19.090Z
**Commit**: 5120b70
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 12 | 0 B | 0 B | 20.700 | 0.063 | 20.762 |
| data-load-brancalonia | 6 | 0 B | 0 B | 10.098 | 0.031 | 10.129 |
| data-load-dnd2024 | 9 | 0 B | 0 B | 14.483 | 0.044 | 14.527 |
| data-load-apocalisse | 4 | 0 B | 0 B | 6.746 | 0.020 | 6.766 |
| calculations-1000x | 1 | 0 B | 0 B | 2.218 | 0.007 | 2.225 |
| json-serialize-character | 0 | 0 B | 776 B | 0.742 | 0.002 | 0.744 |
| build-output-analysis | 1 | 5.42 MB | 0 B | 1.417 | 0.004 | 1.422 |
| pdf-template-read | 1 | 0 B | 3.09 MB | 1.179 | 0.004 | 1.183 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 6.954 | 0.021 | 6.975 |

**Total**: 64.733 mgCO₂eq across 9 tools in 38ms
