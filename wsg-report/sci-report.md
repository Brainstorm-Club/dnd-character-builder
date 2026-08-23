# SCI Benchmark Report

**Date**: 2026-08-23T11:29:02.735Z
**Commit**: 192d3a4
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 13 | 0 B | 0 B | 21.113 | 0.064 | 21.177 |
| data-load-brancalonia | 67 | 0 B | 0 B | 111.548 | 0.337 | 111.885 |
| data-load-dnd2024 | 7 | 0 B | 0 B | 11.911 | 0.036 | 11.947 |
| data-load-apocalisse | 4 | 0 B | 0 B | 7.222 | 0.022 | 7.244 |
| calculations-1000x | 1 | 0 B | 0 B | 2.077 | 0.006 | 2.084 |
| json-serialize-character | 0 | 0 B | 776 B | 0.746 | 0.002 | 0.748 |
| build-output-analysis | 1 | 5.48 MB | 0 B | 1.217 | 0.004 | 1.221 |
| pdf-template-read | 1 | 0 B | 3.14 MB | 1.275 | 0.004 | 1.279 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 5.946 | 0.018 | 5.964 |

**Total**: 163.548 mgCO₂eq across 9 tools in 98ms
