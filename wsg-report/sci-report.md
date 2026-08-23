# SCI Benchmark Report

**Date**: 2026-08-23T00:20:39.559Z
**Commit**: d616cd2
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 15 | 0 B | 0 B | 25.005 | 0.076 | 25.081 |
| data-load-brancalonia | 7 | 0 B | 0 B | 11.562 | 0.035 | 11.597 |
| data-load-dnd2024 | 36 | 0 B | 0 B | 60.332 | 0.182 | 60.514 |
| data-load-apocalisse | 6 | 0 B | 0 B | 10.415 | 0.031 | 10.447 |
| calculations-1000x | 2 | 0 B | 0 B | 3.537 | 0.011 | 3.547 |
| json-serialize-character | 1 | 0 B | 776 B | 0.915 | 0.003 | 0.918 |
| build-output-analysis | 1 | 5.31 MB | 0 B | 2.112 | 0.006 | 2.118 |
| pdf-template-read | 3 | 0 B | 3.03 MB | 4.190 | 0.013 | 4.203 |
| i18n-load-single-locale | 10 | 0 B | 0 B | 16.752 | 0.051 | 16.803 |

**Total**: 135.228 mgCO₂eq across 9 tools in 81ms
