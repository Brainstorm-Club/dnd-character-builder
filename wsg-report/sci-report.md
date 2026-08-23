# SCI Benchmark Report

**Date**: 2026-08-23T11:49:38.083Z
**Commit**: 9611148
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 12 | 0 B | 0 B | 20.333 | 0.061 | 20.394 |
| data-load-brancalonia | 81 | 0 B | 0 B | 134.615 | 0.407 | 135.022 |
| data-load-dnd2024 | 9 | 0 B | 0 B | 14.644 | 0.044 | 14.688 |
| data-load-apocalisse | 6 | 0 B | 0 B | 9.394 | 0.028 | 9.422 |
| calculations-1000x | 2 | 0 B | 0 B | 4.033 | 0.012 | 4.045 |
| json-serialize-character | 0 | 0 B | 776 B | 0.778 | 0.002 | 0.781 |
| build-output-analysis | 1 | 5.48 MB | 0 B | 1.210 | 0.004 | 1.214 |
| pdf-template-read | 2 | 0 B | 3.14 MB | 2.821 | 0.009 | 2.829 |
| i18n-load-single-locale | 4 | 0 B | 0 B | 7.223 | 0.022 | 7.245 |

**Total**: 195.641 mgCO₂eq across 9 tools in 117ms
