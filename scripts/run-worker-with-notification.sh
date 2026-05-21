#!/usr/bin/env bash
set -uo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stdout_log="${repo_dir}/logs/worker.stdout.log"
stderr_log="${repo_dir}/logs/worker.stderr.log"
env_file="${repo_dir}/.env.local"

mkdir -p "${repo_dir}/logs"

if [[ -f "${env_file}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${env_file}"
  set +a
fi

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

if [[ -n "${AIRDROP_TELEGRAM_BOT_TOKEN:-}" && -n "${AIRDROP_TELEGRAM_CHAT_ID:-}" ]]; then
  telegram_text="${title}
Host: ${host_name}
Time: ${timestamp}
Exit: ${exit_code}
Repo: ${repo_dir}
stderr: ${stderr_log}
stdout: ${stdout_log}"

  curl --fail --silent --show-error \
    --request POST \
    --data-urlencode "chat_id=${AIRDROP_TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${telegram_text}" \
    "https://api.telegram.org/bot${AIRDROP_TELEGRAM_BOT_TOKEN}/sendMessage" \
    >/dev/null || true
else
  printf '%s\n' \
    "Telegram alert skipped: AIRDROP_TELEGRAM_BOT_TOKEN and AIRDROP_TELEGRAM_CHAT_ID are not both set." \
    >&2
fi

exit "${exit_code}"
