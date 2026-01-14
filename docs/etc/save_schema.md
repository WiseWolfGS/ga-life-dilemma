# Save File Schema

This document defines the JSON format for the simulation save file.

## File Name

`ga-life-settings-<iso-date>-t<tick>[-label].json`

## Schema Versioning

- `schemaVersion` is a positive integer.
- Current version: `1`.
- Readers should reject files with a higher version.

## JSON Shape (v1)

```json
{
  "schemaVersion": 1,
  "grid": {
    "width": 80,
    "height": 60,
    "cells": [
      { "isAlive": true, "gene": [2, 4, 6, 8], "age": 3 }
    ],
    "terrain": ["normal"]
  },
  "params": {
    "alpha": 4,
    "beta": -0.15,
    "gamma": 1,
    "mu": 20,
    "nu": 27.5,
    "delta": -0.07,
    "epsilon": 0.03,
    "p_mut": 0.02
  },
  "seed": 1735152000000,
  "initialDensity": 0.25,
  "rngState": 123456,
  "tick": 120
}
```

## Field Descriptions

- `schemaVersion`: Schema version of this file.
- `grid`: Current grid state.
  - `width`: Grid width.
  - `height`: Grid height.
  - `cells`: Flattened array of cells.
    - `isAlive`: Whether the cell is alive.
    - `gene`: Gene values `[U, D, L, R]`.
    - `age`: Age of the cell.
  - `terrain`: Flattened terrain array (`normal`, `double`, `half`).
- `params`: Simulation parameters at save time.
- `seed`: RNG seed at save time.
- `initialDensity`: Initial density used for grid creation.
- `rngState`: Current RNG internal state.
- `tick`: Current simulation tick.
