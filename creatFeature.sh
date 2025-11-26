#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./make_feature.sh <feature-name>
# Example:
#   ./make_feature.sh userProfile
#
# Creates directory "userProfile" with:
#   userProfile.server.tsx
#   userProfile.client.tsx
#   userProfile.hooks.ts
#   userProfile.services.ts
#   types.ts
#   styles.module.css
#   index.ts
#
# Abort if the target directory already exists to avoid accidental overwrite.

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <feature-name>"
  exit 2
fi

FEATURE_RAW="$1"
FEATURE_DIR="${FEATURE_RAW}"

# Prevent accidental overwrite
if [[ -e "$FEATURE_DIR" ]]; then
  echo "Error: '$FEATURE_DIR' already exists. Aborting."
  exit 3
fi

# Create directory
mkdir -p "$FEATURE_DIR"

# Derive PascalCase name for component/type usage
# Split on non-alphanumeric characters, capitalize first letter of each part.
IFS=$' _-.' read -ra PARTS <<< "$FEATURE_RAW"
COMPONENT_NAME=""
for p in "${PARTS[@]}"; do
  [[ -z "$p" ]] && continue
  # Uppercase first char, keep rest as-is
  first="${p:0:1}"
  rest="${p:1}"
  # Use tr for portability to uppercase the first char
  first_upper="$(tr '[:lower:]' '[:upper:]' <<< "${first}")"
  COMPONENT_NAME+="${first_upper}${rest}"
done

# File paths
SERVER_FILE="$FEATURE_DIR/${FEATURE_RAW}.server.tsx"
CLIENT_FILE="$FEATURE_DIR/${FEATURE_RAW}.client.tsx"
HOOKS_FILE="$FEATURE_DIR/${FEATURE_RAW}.hooks.ts"
SERVICES_FILE="$FEATURE_DIR/${FEATURE_RAW}.services.ts"
TYPES_FILE="$FEATURE_DIR/types.ts"
STYLES_FILE="$FEATURE_DIR/styles.module.css"
INDEX_FILE="$FEATURE_DIR/index.ts"

# Create server component (server-only; no client hooks)
cat > "$SERVER_FILE" <<EOF
// ${FEATURE_RAW}.server.tsx
// Server component - runs on server, returns markup only.

import type { ReactNode } from "react";
import { get${COMPONENT_NAME}Data } from "./${FEATURE_RAW}.services";

interface ${COMPONENT_NAME}ServerProps {
  children?: ReactNode;
}

export default async function ${COMPONENT_NAME}Server(_props: ${COMPONENT_NAME}ServerProps) {
  const data = await get${COMPONENT_NAME}Data();
  return (
    <section>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
EOF

# Create client component (client-only)
cat > "$CLIENT_FILE" <<EOF
"use client";
// ${FEATURE_RAW}.client.tsx
// Client component - may use hooks, event handlers, browser APIs.

import React, { useEffect, useState } from "react";
import type { ${COMPONENT_NAME}Type } from "./types";

export default function ${COMPONENT_NAME}Client() {
  const [state, setState] = useState<${COMPONENT_NAME}Type | null>(null);

  useEffect(() => {
    // client-side initialization
  }, []);

  return (
    <div>
      <button onClick={() => console.log("clicked")}>Action</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
EOF

# Create hooks file (single file for feature-specific hooks)
cat > "$HOOKS_FILE" <<EOF
// ${FEATURE_RAW}.hooks.ts
// Feature-specific hooks (client or shared)

import { useState, useEffect } from "react";
import type { ${COMPONENT_NAME}Type } from "./types";

export function use${COMPONENT_NAME}() {
  const [data, setData] = useState<${COMPONENT_NAME}Type | null>(null);

  useEffect(() => {
    // optionally load or subscribe to data
  }, []);

  return { data, setData };
}
EOF

# Create services file (thin API wrapper)
cat > "$SERVICES_FILE" <<EOF
// ${FEATURE_RAW}.services.ts
// Thin service layer for ${FEATURE_RAW} (wrap APIs / libs)

export async function get${COMPONENT_NAME}Data(): Promise<Record<string, any>> {
  // Replace with real API client call, e.g. libs/apiClient.get(...)
  return { message: "stub data for ${COMPONENT_NAME}" };
}
EOF

# Create types.ts
cat > "$TYPES_FILE" <<EOF
// types.ts
// Local types for ${FEATURE_RAW}

export type ${COMPONENT_NAME}Type = {
  id?: string;
  // add fields here
};
EOF

# Create styles.module.css
cat > "$STYLES_FILE" <<EOF
/* styles.module.css */
/* Scoped styles for ${FEATURE_RAW} */

.root {
  display: block;
}
EOF

# Create index.ts (exports)
cat > "$INDEX_FILE" <<EOF
// index.ts
export { default as ${COMPONENT_NAME}Server } from "./${FEATURE_RAW}.server";
export { default as ${COMPONENT_NAME}Client } from "./${FEATURE_RAW}.client";
export * from "./${FEATURE_RAW}.hooks";
export * from "./${FEATURE_RAW}.services";
export * from "./types";
EOF

# Set safe permissions for created files
chmod -R u+rwX,go-rw "$FEATURE_DIR"

echo "Feature scaffold created at: $FEATURE_DIR"
echo "Files created:"
echo " - $SERVER_FILE"
echo " - $CLIENT_FILE"
echo " - $HOOKS_FILE"
echo " - $SERVICES_FILE"
echo " - $TYPES_FILE"
echo " - $STYLES_FILE"
echo " - $INDEX_FILE"
