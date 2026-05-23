# ZIP Export and Roblox Import Guide

HUDForge now exports a real downloadable ZIP package instead of only returning a JSON payload.

## What the ZIP contains

Every export contains five files:

```txt
manifest.json
layout.json
code/MainUI.lua
assets/assets.json
README_IMPORT.md
```

## What each file is for

- `manifest.json` — package metadata, generation ID, UI type, style, and entrypoint.
- `layout.json` — editable layout source of truth.
- `code/MainUI.lua` — deterministic Luau that builds the Roblox ScreenGui hierarchy.
- `assets/assets.json` — generated asset URLs and refs for replacing Roblox asset IDs.
- `README_IMPORT.md` — plain-English Roblox Studio import guide.

## Download behavior

The export API now returns:

- `package.format = "zip"`
- `filename` ending in `.zip`
- `download_url` as a `data:application/zip;base64,...` URL
- `zip_base64` for clients that want to decode/save manually
- `byte_size`

The browser Generate page now uses the ZIP `download_url` directly instead of building a JSON blob.

## Why this matters

This is a major activation step.

Roblox creators need something they can actually download and inspect. A ZIP with Luau, layout, assets, and import instructions feels like a tool output. A JSON payload felt like an internal API response.

## Current limitation

HUDForge cannot automatically upload images into Roblox yet.

The import guide tells users to:

1. Upload generated image URLs through Creator Hub or Asset Manager.
2. Replace every `rbxassetid://0` placeholder in `code/MainUI.lua` with uploaded Roblox asset IDs.
3. Parent the returned ScreenGui to `Players.LocalPlayer.PlayerGui`.

This is acceptable for the SaaS MVP. The Roblox Studio plugin comes later.

## Verification

Tested:

- ZIP local file structure
- ZIP central directory entry list
- export service returns ZIP package
- local API smoke returns ZIP format, filename, byte size, and base64 download URL
