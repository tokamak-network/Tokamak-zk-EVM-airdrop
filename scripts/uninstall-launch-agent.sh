#!/usr/bin/env bash
set -euo pipefail

label="network.tokamak.tonnel-airdrop-worker"
plist_path="${HOME}/Library/LaunchAgents/${label}.plist"

if [[ -f "${plist_path}" ]]; then
  launchctl unload "${plist_path}" >/dev/null 2>&1 || true
  rm -f "${plist_path}"
fi

echo "Uninstalled ${plist_path}"
