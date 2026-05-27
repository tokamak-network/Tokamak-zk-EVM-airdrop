#!/usr/bin/env bash
set -uo pipefail

support_dir="${HOME}/Library/Application Support/TonnelAirdrop"
runtime_dir="${TONNEL_AIRDROP_RUNTIME_DIR:-${support_dir}/runtime}"
repo_dir="${TONNEL_AIRDROP_REPO_DIR:-${runtime_dir}}"
log_dir="${TONNEL_AIRDROP_LOG_DIR:-${HOME}/Library/Logs/TonnelAirdrop}"
stdout_log="${log_dir}/worker.stdout.log"
stderr_log="${log_dir}/worker.stderr.log"
run_stdout="${log_dir}/worker.last.stdout.log"
run_stderr="${log_dir}/worker.last.stderr.log"

mkdir -p "${log_dir}"

: > "${run_stdout}"
: > "${run_stderr}"

(
  cd "${runtime_dir}" &&
    npm run worker
) > >(tee "${run_stdout}") 2> >(tee "${run_stderr}" >&2)
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

node "${runtime_dir}/scripts/send-worker-run-alert.mjs" \
  "${host_name}" \
  "${timestamp}" \
  "${exit_code}" \
  "${repo_dir}" \
  "${runtime_dir}" \
  "${log_dir}" \
  "${stderr_log}" \
  "${stdout_log}" \
  "${run_stdout}" \
  "${run_stderr}" || true

exit "${exit_code}"
