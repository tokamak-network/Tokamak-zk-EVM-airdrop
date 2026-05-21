#!/usr/bin/env bash
set -uo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stdout_log="${repo_dir}/logs/worker.stdout.log"
stderr_log="${repo_dir}/logs/worker.stderr.log"

mkdir -p "${repo_dir}/logs"

cd "${repo_dir}" || exit 1

npm run worker
exit_code=$?

if [[ ${exit_code} -eq 0 ]]; then
  exit 0
fi

timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"
host_name="$(hostname)"
title="Tonnel airdrop worker failed"
message="Exit ${exit_code} at ${timestamp}. Check logs/worker.stderr.log."

osascript -e "display notification \"${message}\" with title \"${title}\"" >/dev/null 2>&1 || true

node scripts/send-worker-failure-alert.mjs \
  "${host_name}" \
  "${timestamp}" \
  "${exit_code}" \
  "${repo_dir}" \
  "${stderr_log}" \
  "${stdout_log}" || true

exit "${exit_code}"
