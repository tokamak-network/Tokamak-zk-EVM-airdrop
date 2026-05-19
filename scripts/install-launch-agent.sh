#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
label="network.tokamak.tonnel-airdrop-worker"
plist_path="${HOME}/Library/LaunchAgents/${label}.plist"
log_dir="${repo_dir}/logs"
node_path="$(command -v node)"
npm_path="$(command -v npm)"

mkdir -p "${HOME}/Library/LaunchAgents" "${log_dir}"

cat > "${plist_path}" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>WorkingDirectory</key>
  <string>${repo_dir}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${npm_path}</string>
    <string>run</string>
    <string>worker</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$(dirname "${node_path}"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>StartCalendarInterval</key>
  <array>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>21</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
  </array>
  <key>StandardOutPath</key>
  <string>${log_dir}/worker.stdout.log</string>
  <key>StandardErrorPath</key>
  <string>${log_dir}/worker.stderr.log</string>
</dict>
</plist>
PLIST

launchctl unload "${plist_path}" >/dev/null 2>&1 || true
launchctl load "${plist_path}"

echo "Installed ${plist_path}"
