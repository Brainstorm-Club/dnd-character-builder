# SCI Benchmark Report

**Date**: 2026-08-23T07:07:09.528Z
**Commit**: 2613acc
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 14 | 0 B | 0 B | 22.618 | 0.068 | 22.687 |
| data-load-brancalonia | 8 | 0 B | 0 B | 13.034 | 0.039 | 13.074 |
| data-load-dnd2024 | 9 | 0 B | 0 B | 14.830 | 0.045 | 14.875 |
| data-load-apocalisse | 5 | 0 B | 0 B | 8.749 | 0.026 | 8.776 |
| calculations-1000x | 2 | 0 B | 0 B | 3.069 | 0.009 | 3.078 |
| json-serialize-character | 1 | 0 B | 776 B | 0.918 | 0.003 | 0.921 |
| build-output-analysis | 1 | 5.35 MB | 0 B | 1.306 | 0.004 | 1.310 |
| pdf-template-read | 4 | 0 B | 3.03 MB | 6.094 | 0.018 | 6.113 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 7.239 | 0.022 | 7.260 |

**Total**: 78.093 mgCO₂eq across 9 tools in 48ms
