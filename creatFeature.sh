#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./createFeature.sh <feature-name>
# Example:
#   ./createFeature.sh userProfile
#
# Creates directory: frontend/social-network/features/<feature-name>
# Creates files inside that directory:
#   <feature-name>.server.tsx
#   <feature-name>.client.tsx
#   <feature-name>.hooks.ts
#   <feature-name>.services.ts
#   types.ts
#   styles.module.css
#   index.ts
#
# The filenames use the feature-name exactly as passed (no normalization).
# Internal exported component/type names are PascalCase derived from the feature name.

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <feature-name>"
  exit 2
fi

FEATURE_RAW="$1"
FEATURE_ROOT="frontend/social-network/features"
TARGET_DIR="${FEATURE_ROOT}/${FEATURE_RAW}"

# Prevent accidental overwrite
if [[ -e "$TARGET_DIR" ]]; then
  echo "Error: target directory '$TARGET_DIR' already exists. Aborting."
  exit 3
fi

# Ensure parent features directory exists
mkdir -p "$FEATURE_ROOT"

# Create target directory
mkdir -p "$TARGET_DIR"

# Derive PascalCase name for internal symbols
# Split on non-alphanumeric characters (space, dash, underscore, dot)
IFS=$' \t\n_-.' read -ra PARTS <<< "$FEATURE_RAW"
PASCAL=""
for part in "${PARTS[@]}"; do
  [[ -z "$part" ]] && continue
  first="${part:0:1}"
  rest="${part:1}"
  # uppercase first char, keep rest as-is (portable via tr)
  first_upper="$(tr '[:lower:]' '[:upper:]' <<< "${first}")"
  PASCAL+="${first_upper}${rest}"
done

# File paths
SERVER_FILE="$TARGET_DIR/${FEATURE_RAW}.server.tsx"
CLIENT_FILE="$TARGET_DIR/${FEATURE_RAW}.client.tsx"
HOOKS_FILE="$TARGET_DIR/${FEATURE_RAW}.hooks.ts"
SERVICES_FILE="$TARGET_DIR/${FEATURE_RAW}.services.ts"
TYPES_FILE="$TARGET_DIR/types.ts"
STYLES_FILE="$TARGET_DIR/styles.module.css"
INDEX_FILE="$TARGET_DIR/index.ts"

# Minimal server component (server-only)
cat > "$SERVER_FILE" <<EOF
// ${FEATURE_RAW}.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface ${PASCAL}ServerProps {
  children?: ReactNode;
}

export default function ${PASCAL}Server(_props: ${PASCAL}ServerProps) {
  return <div className="${FEATURE_RAW}">{/* server-rendered: ${PASCAL}Server */}</div>;
}
EOF

# Minimal client component (client-only)
cat > "$CLIENT_FILE" <<EOF
"use client";
// ${FEATURE_RAW}.client.tsx
// Minimal client component

export default function ${PASCAL}Client() {
  return <div className="${FEATURE_RAW}">{/* client UI: ${PASCAL}Client */}</div>;
}
EOF

# Minimal hooks file
cat > "$HOOKS_FILE" <<EOF
// ${FEATURE_RAW}.hooks.ts
// Minimal hook(s) for ${FEATURE_RAW}

export function use${PASCAL}() {
  // stub: return nothing by default
  return null;
}
EOF

# Minimal services file
cat > "$SERVICES_FILE" <<EOF
// ${FEATURE_RAW}.services.ts
// Minimal service stubs for ${FEATURE_RAW}

export async function fetch${PASCAL}(): Promise<null> {
  // replace with real API call
  return null;
}
EOF

# Minimal types file
cat > "$TYPES_FILE" <<EOF
// types.ts
// Local types for ${FEATURE_RAW}

export type ${PASCAL} = {
  // add fields
};
EOF

# Minimal styles module
cat > "$STYLES_FILE" <<EOF
/* styles.module.css */
/* Scoped styles for ${FEATURE_RAW} */

.root {
  display: block;
}
EOF

# Minimal index file (re-exports)
cat > "$INDEX_FILE" <<EOF
// index.ts
export { default as ${PASCAL}Server } from "./${FEATURE_RAW}.server";
export { default as ${PASCAL}Client } from "./${FEATURE_RAW}.client";
export * from "./${FEATURE_RAW}.hooks";
export * from "./${FEATURE_RAW}.services";
export * from "./types";
EOF

# Set permissions
chmod -R u+rwX,go-rw "$TARGET_DIR"

# Output created files
echo "Created feature at: $TARGET_DIR"
echo " - $SERVER_FILE"
echo " - $CLIENT_FILE"
echo " - $HOOKS_FILE"
echo " - $SERVICES_FILE"
echo " - $TYPES_FILE"
echo " - $STYLES_FILE"
echo " - $INDEX_FILE"
