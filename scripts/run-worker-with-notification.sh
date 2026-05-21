#!/usr/bin/env bash
set -uo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stdout_log="${repo_dir}/logs/worker.stdout.log"
stderr_log="${repo_dir}/logs/worker.stderr.log"
run_stdout="${repo_dir}/logs/worker.last.stdout.log"
run_stderr="${repo_dir}/logs/worker.last.stderr.log"

mkdir -p "${repo_dir}/logs"

cd "${repo_dir}" || exit 1

: > "${run_stdout}"
: > "${run_stderr}"

npm run worker > >(tee "${run_stdout}") 2> >(tee "${run_stderr}" >&2)
exit_code=$?

timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"
host_name="$(hostname)"
status="succeeded"

if [[ ${exit_code} -ne 0 ]]; then
  status="failed"
fi

title="Tonnel airdrop worker ${status}"
message="Exit ${exit_code} at ${timestamp}."

osascript -e "display notification \"${message}\" with title \"${title}\"" >/dev/null 2>&1 || true

node scripts/send-worker-run-alert.mjs \
  "${host_name}" \
  "${timestamp}" \
  "${exit_code}" \
  "${repo_dir}" \
  "${stderr_log}" \
  "${stdout_log}" \
  "${run_stdout}" \
  "${run_stderr}" || true

exit "${exit_code}"
