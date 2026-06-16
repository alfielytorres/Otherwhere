# Scene Setup Guide — Otherwhere (Unity)

## Required Scene Hierarchy

```
Scene: Main
├── [Managers]
│   ├── GameManager          → GameManager.cs
│   ├── TimeManager          → TimeManager.cs
│   └── PostProcess          → ComicBookEffect.cs, Volume (URP)
│
├── [World]
│   ├── Sun (Directional)    → DayNightCycle.cs
│   ├── CityRoot
│   │   ├── Building_Home    → BuildingInterior.cs
│   │   ├── Building_BPO     → BuildingInterior.cs
│   │   ├── Building_KTV     → BuildingInterior.cs
│   │   ├── Building_Gym     → BuildingInterior.cs
│   │   ├── Building_Mall    → BuildingInterior.cs
│   │   ├── Building_Church  → BuildingInterior.cs
│   │   ├── Building_Resto   → BuildingInterior.cs
│   │   └── Building_Bar     → BuildingInterior.cs
│   └── NeonLights[]         → NeonGlow.shader materials
│
├── [Player]
│   ├── PlayerRoot           → PlayerController.cs, CharacterController
│   │   └── CameraMount
│   │       └── MainCamera
│   └── PlayerNeeds          → PlayerNeeds.cs
│
├── [NPCs]
│   └── NPC_XXX[]            → NPCController.cs, NavMeshAgent, Animator
│
└── [UI] (Canvas — Screen Space Overlay)
    ├── NeedsHUD             → NeedsHUD.cs
    │   ├── NeedBar_Gutom
    │   ├── NeedBar_Lakas
    │   ├── NeedBar_Lipunan
    │   ├── NeedBar_Kasiyahan
    │   └── NeedBar_Kalinisan
    ├── ActivityMenu         → ActivityMenuUI.cs
    ├── ActivityProgress
    ├── ClockPanel
    └── FlashOverlay
```

## URP Post-Processing Profile Settings (Miles Morales look)

### Bloom
- Intensity: 1.8
- Threshold: 0.9
- Scatter: 0.7
- Tint: #8822FF (purple bloom)

### Color Adjustments
- Post Exposure: 0.1
- Contrast: 12
- Color Filter: #FFF5E0 (warm)
- Saturation: 18

### Vignette
- Intensity: 0.4
- Smoothness: 0.5
- Color: #1A0040 (deep purple)

### Chromatic Aberration
- Intensity: 0.15 (subtle, increases during speed/impact)

### Tonemapping
- Mode: ACES

## Cel Shader Setup
- Assign CelShader.shader to ALL character + building materials
- Shadow Color: #0D0526
- Rim Color: #8833FF at intensity 1.5
- Outline Width: 0.003 (characters), 0.001 (environment)

## Neon Sign Colors by Building
- Home:     #5500FF
- BPO:      #0088FF
- KTV/Bar:  #FF0080
- Gym:      #00FFAA
- Mall:     #7B2FBE
- Church:   #FFD700
- Resto:    #FF6B35
- Bar:      #FF4500

## Recommended Free Assets
- Characters: Synty Polygon City People (low-poly cel friendly)
- Buildings: Synty Polygon City Pack
- Music: Lo-fi hip hop / OPM beats (license your own)
- Font: Bebas Neue (free, Google Fonts) for all UI

## NavMesh
Bake NavMesh on CityRoot. NPCs use NavMeshAgent with:
- Speed: 2.5
- Angular Speed: 180
- Stopping Distance: 0.5
