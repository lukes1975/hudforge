# Generation Pipeline

HUDForge should not be an AI art toy. It should produce usable Roblox UI systems.

## Target pipeline

```txt
Prompt → structured JSON spec → real assets → browser preview → deterministic Luau export
```

## Why JSON first

The AI should not freely invent random Luau code. That is hard to trust and hard to debug.

Better approach:

1. AI creates a constrained JSON layout/spec.
2. HUDForge validates the JSON.
3. HUDForge converts the JSON into deterministic Luau.

This makes the export more predictable and safer.

## Current asset bundle

Each generation should produce a fixed UI kit, not random loose images:

1. `main_frame`
2. `primary_button`
3. `secondary_button`
4. `currency_icon`
5. `background_panel`

## Current implementation status

Done:

- Basic optimizer/spec generation exists.
- Deterministic JSON/layout to Luau export exists.
- Asset bundle generation can call FAL.
- Export package includes:
  - `manifest.json`
  - `layout.json`
  - `code/MainUI.lua`
  - `assets/assets.json`
  - `README_IMPORT.md`

Still needed:

- Real OpenRouter Gemini 2.5 Flash optimizer.
- Strict schema validation and repair.
- Better browser preview from the generated layout/assets.
- Real ZIP wrapping around the export files.
