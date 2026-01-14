# Stats Export Schema

This document defines the JSON format for the exported statistics history file.

## File Name

`ga-life-stats-<iso-date>-t<tick>.json`

## Schema Versioning

- `schemaVersion` is a positive integer.
- Current version: `1`.
- Readers should reject files with a higher version.

## JSON Shape (v1)

```json
{
  "schemaVersion": 1,
  "seed": 1735152000000,
  "tick": 120,
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
  "history": [
    {
      "tick": 0,
      "density": 0.25,
      "avgAge": 1,
      "births": 0,
      "deaths": 0,
      "geneEntropy": 2.2,
      "geneHistogram": {
        "overall": { "2": 10, "4": 8, "6": 12, "8": 6, "10": 4 },
        "up": { "2": 3, "4": 2, "6": 4, "8": 1, "10": 0 },
        "down": { "2": 2, "4": 1, "6": 4, "8": 2, "10": 1 },
        "left": { "2": 2, "4": 2, "6": 2, "8": 1, "10": 1 },
        "right": { "2": 3, "4": 3, "6": 2, "8": 2, "10": 2 }
      },
      "clusterCount": 5,
      "avgClusterSize": 3.2,
      "largestClusterSize": 9,
      "terrainBreakdown": {
        "normal": {
          "density": 0.3,
          "avgAge": 2.1,
          "geneEntropy": 2.0,
          "geneHistogram": {
            "overall": { "2": 6, "4": 5, "6": 4, "8": 3, "10": 2 },
            "up": { "2": 2, "4": 1, "6": 2, "8": 1, "10": 0 },
            "down": { "2": 1, "4": 1, "6": 1, "8": 1, "10": 1 },
            "left": { "2": 1, "4": 1, "6": 1, "8": 0, "10": 1 },
            "right": { "2": 2, "4": 2, "6": 0, "8": 1, "10": 0 }
          },
          "clusterCount": 3,
          "avgClusterSize": 3.0,
          "largestClusterSize": 6,
          "births": 1,
          "deaths": 2
        },
        "double": {
          "density": 0.2,
          "avgAge": 1.5,
          "geneEntropy": 1.8,
          "geneHistogram": {
            "overall": { "2": 2, "4": 1, "6": 3, "8": 1, "10": 1 },
            "up": { "2": 1, "4": 0, "6": 1, "8": 0, "10": 0 },
            "down": { "2": 0, "4": 0, "6": 1, "8": 0, "10": 1 },
            "left": { "2": 0, "4": 1, "6": 1, "8": 0, "10": 0 },
            "right": { "2": 1, "4": 0, "6": 0, "8": 1, "10": 0 }
          },
          "clusterCount": 1,
          "avgClusterSize": 2.0,
          "largestClusterSize": 2,
          "births": 0,
          "deaths": 1
        },
        "half": {
          "density": 0.1,
          "avgAge": 1.0,
          "geneEntropy": 1.2,
          "geneHistogram": {
            "overall": { "2": 2, "4": 2, "6": 1, "8": 0, "10": 1 },
            "up": { "2": 0, "4": 1, "6": 0, "8": 0, "10": 0 },
            "down": { "2": 1, "4": 0, "6": 0, "8": 0, "10": 0 },
            "left": { "2": 0, "4": 1, "6": 1, "8": 0, "10": 0 },
            "right": { "2": 1, "4": 0, "6": 0, "8": 0, "10": 1 }
          },
          "clusterCount": 1,
          "avgClusterSize": 1.0,
          "largestClusterSize": 1,
          "births": 0,
          "deaths": 0
        }
      }
    }
  ]
}
```

## Field Descriptions

- `schemaVersion`: Schema version of this file.
- `seed`: RNG seed at the time of export.
- `tick`: Simulation tick at the time of export.
- `params`: Simulation parameters at the time of export.
- `history`: Array of stats entries in chronological order.
  - `tick`: Tick number for this entry.
  - `density`: Alive ratio (alive / total).
  - `avgAge`: Average age of alive cells.
  - `births`: Birth events counted in that tick.
  - `deaths`: Death events counted in that tick.
  - `geneEntropy`: Shannon entropy of alive-cell gene values (overall distribution).
  - `geneHistogram`: Gene value counts across alive cells (`overall` is all loci combined).
  - `clusterCount`: Number of connected alive components (8-neighbor).
  - `avgClusterSize`: Average size of connected alive components.
  - `largestClusterSize`: Largest connected alive component size.
  - `terrainBreakdown`: Per-terrain statistics (normal/double/half).
    - `density`: Alive ratio within that terrain.
    - `avgAge`: Average age of alive cells within that terrain.
    - `geneEntropy`: Shannon entropy of alive-cell gene values within that terrain.
    - `geneHistogram`: Gene value counts within that terrain.
    - `clusterCount`: Connected alive components within that terrain (8-neighbor, terrain-restricted).
    - `avgClusterSize`: Average size of terrain-restricted components.
    - `largestClusterSize`: Largest terrain-restricted component size.
    - `births`: Birth events on that terrain in the tick.
    - `deaths`: Death events on that terrain in the tick.
