#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
label="network.tokamak.tonnel-airdrop-worker"
plist_path="${HOME}/Library/LaunchAgents/${label}.plist"
node_path="$(command -v node)"
support_dir="${HOME}/Library/Application Support/TonnelAirdrop"
runtime_dir="${support_dir}/runtime"
runtime_tmp="${support_dir}/runtime.next"
previous_runtime_dir="${support_dir}/runtime.previous"
log_dir="${HOME}/Library/Logs/TonnelAirdrop"
worker_wrapper="${support_dir}/run-worker-with-notification.sh"
launch_domain="gui/$(id -u)"

mkdir -p "${HOME}/Library/LaunchAgents" "${log_dir}" "${support_dir}"

if [[ -f "${plist_path}" ]]; then
  launchctl bootout "${launch_domain}" "${plist_path}" >/dev/null 2>&1 ||
    launchctl unload "${plist_path}" >/dev/null 2>&1 ||
    true
fi

rm -rf "${runtime_tmp}"
mkdir -p "${runtime_tmp}"

rsync -a --delete \
  --exclude=".DS_Store" \
  --exclude=".git/" \
  --exclude=".next/" \
  --exclude=".vercel/" \
  --exclude="logs/" \
  --exclude="node_modules/" \
  --exclude="tmp/" \
  --exclude="tsconfig.tsbuildinfo" \
  "${repo_dir}/" \
  "${runtime_tmp}/"

if [[ -f "${runtime_tmp}/package-lock.json" ]]; then
  npm --prefix "${runtime_tmp}" ci
else
  npm --prefix "${runtime_tmp}" install
fi

chmod 600 "${runtime_tmp}"/.env* >/dev/null 2>&1 || true

rm -rf "${previous_runtime_dir}"
if [[ -d "${runtime_dir}" ]]; then
  mv "${runtime_dir}" "${previous_runtime_dir}"
fi
mv "${runtime_tmp}" "${runtime_dir}"
rm -rf "${previous_runtime_dir}"

cp "${repo_dir}/scripts/run-worker-with-notification.sh" "${worker_wrapper}"
chmod +x "${worker_wrapper}"

cat > "${plist_path}" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>WorkingDirectory</key>
  <string>${support_dir}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${worker_wrapper}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>TONNEL_AIRDROP_REPO_DIR</key>
    <string>${repo_dir}</string>
    <key>TONNEL_AIRDROP_RUNTIME_DIR</key>
    <string>${runtime_dir}</string>
    <key>TONNEL_AIRDROP_LOG_DIR</key>
    <string>${log_dir}</string>
    <key>PATH</key>
    <string>${HOME}/.cargo/bin:$(dirname "${node_path}"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>StartCalendarInterval</key>
  <array>
    <dict>
      <key>Hour</key>
      <integer>12</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>15</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>18</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>21</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>0</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>3</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>6</integer>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
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

launchctl bootstrap "${launch_domain}" "${plist_path}" 2>/dev/null ||
  launchctl load "${plist_path}"

echo "Installed ${plist_path}"
echo "Runtime: ${runtime_dir}"
echo "Logs: ${log_dir}"
