# SCI Benchmark Report

**Date**: 2026-08-23T09:07:18.704Z
**Commit**: cb03f7c
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 14 | 0 B | 0 B | 24.004 | 0.073 | 24.077 |
| data-load-brancalonia | 6 | 0 B | 0 B | 9.533 | 0.029 | 9.561 |
| data-load-dnd2024 | 13 | 0 B | 0 B | 21.979 | 0.066 | 22.045 |
| data-load-apocalisse | 6 | 0 B | 0 B | 10.151 | 0.031 | 10.182 |
| calculations-1000x | 2 | 0 B | 0 B | 3.518 | 0.011 | 3.529 |
| json-serialize-character | 0 | 0 B | 776 B | 0.729 | 0.002 | 0.731 |
| build-output-analysis | 1 | 5.42 MB | 0 B | 1.744 | 0.005 | 1.749 |
| pdf-template-read | 2 | 0 B | 3.09 MB | 2.904 | 0.009 | 2.912 |
| i18n-load-single-locale | 87 | 0 B | 0 B | 143.593 | 0.434 | 144.027 |

**Total**: 218.814 mgCO₂eq across 9 tools in 131ms
