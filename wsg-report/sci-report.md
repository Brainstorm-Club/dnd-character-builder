# SCI Benchmark Report

**Date**: 2026-08-23T10:43:53.198Z
**Commit**: a1059fd
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 13 | 0 B | 0 B | 22.275 | 0.067 | 22.342 |
| data-load-brancalonia | 75 | 0 B | 0 B | 123.992 | 0.375 | 124.367 |
| data-load-dnd2024 | 10 | 0 B | 0 B | 16.711 | 0.051 | 16.762 |
| data-load-apocalisse | 4 | 0 B | 0 B | 6.891 | 0.021 | 6.912 |
| calculations-1000x | 2 | 0 B | 0 B | 2.985 | 0.009 | 2.994 |
| json-serialize-character | 1 | 0 B | 776 B | 0.867 | 0.003 | 0.870 |
| build-output-analysis | 1 | 5.48 MB | 0 B | 1.210 | 0.004 | 1.213 |
| pdf-template-read | 2 | 0 B | 3.14 MB | 2.692 | 0.008 | 2.700 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 6.901 | 0.021 | 6.922 |

**Total**: 185.082 mgCO₂eq across 9 tools in 112ms
