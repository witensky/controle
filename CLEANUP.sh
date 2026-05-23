#!/bin/bash
# Run this script to remove the dead legacy files at the repo root.
# These were an old version of the app before the /src/ restructure.
# The active code lives entirely in /src/

echo "🗑  Removing legacy root-level views..."
rm -rf views/

echo "🗑  Removing legacy root-level App.tsx (active: src/App.tsx)..."
rm -f App.tsx

echo "🗑  Removing legacy root-level types.ts (active: src/types.ts)..."
rm -f types.ts

echo "🗑  Removing legacy root-level index.tsx (active: src/index.tsx)..."
rm -f index.tsx

echo "✅  Cleanup complete. Only /src/ remains."
