# SCI Benchmark Report

**Date**: 2026-08-23T18:05:12.958Z
**Commit**: 8b6925e
**Machine**: 14-inch MacBook Pro M1 Pro, 16GB, macOS 15
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| data-load-dnd5e | 240 | 0 B | 0 B | 399.079 | 1.206 | 400.286 |
| data-load-brancalonia | 9 | 0 B | 0 B | 14.513 | 0.044 | 14.556 |
| data-load-dnd2024 | 9 | 0 B | 0 B | 14.554 | 0.044 | 14.598 |
| data-load-apocalisse | 5 | 0 B | 0 B | 7.692 | 0.023 | 7.715 |
| calculations-1000x | 4 | 0 B | 0 B | 6.563 | 0.020 | 6.582 |
| json-serialize-character | 1 | 0 B | 776 B | 0.927 | 0.003 | 0.930 |
| build-output-analysis | 1 | 6.11 MB | 0 B | 1.653 | 0.005 | 1.658 |
| pdf-template-read | 2 | 0 B | 3.14 MB | 3.389 | 0.010 | 3.400 |
| i18n-load-single-locale | 13 | 0 B | 0 B | 21.786 | 0.066 | 21.852 |

**Total**: 471.578 mgCO₂eq across 9 tools in 284ms
