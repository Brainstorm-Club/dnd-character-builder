# SCI Benchmark Report

**Date**: 2026-08-23T10:08:09.277Z
**Commit**: fa773ea
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 15 | 0 B | 0 B | 25.025 | 0.076 | 25.100 |
| data-load-brancalonia | 6 | 0 B | 0 B | 10.454 | 0.032 | 10.486 |
| data-load-dnd2024 | 10 | 0 B | 0 B | 17.360 | 0.052 | 17.413 |
| data-load-apocalisse | 5 | 0 B | 0 B | 8.621 | 0.026 | 8.647 |
| calculations-1000x | 2 | 0 B | 0 B | 2.779 | 0.008 | 2.787 |
| json-serialize-character | 0 | 0 B | 776 B | 0.730 | 0.002 | 0.733 |
| build-output-analysis | 1 | 5.47 MB | 0 B | 1.548 | 0.005 | 1.553 |
| pdf-template-read | 2 | 0 B | 3.14 MB | 2.682 | 0.008 | 2.690 |
| i18n-load-single-locale | 83 | 0 B | 0 B | 137.912 | 0.417 | 138.329 |

**Total**: 207.738 mgCO₂eq across 9 tools in 124ms
