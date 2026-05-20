#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${1:-${HOME}/tokamak-private-channels/dapps/private-state/chain-id-1}"
TARGET_DIR="${2:-private-state-artifacts/chain-id-1}"

mkdir -p "${TARGET_DIR}"
cp "${SOURCE_DIR}/bridge-abi-manifest.1.json" "${TARGET_DIR}/bridge-abi-manifest.1.json"
cp "${SOURCE_DIR}/PrivateStateController.callable-abi.json" "${TARGET_DIR}/PrivateStateController.callable-abi.json"

echo "Synced private-state verifier artifacts to ${TARGET_DIR}"
