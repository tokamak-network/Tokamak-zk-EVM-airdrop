# Agent Notes

## Local payout worker

This repository is the source of truth for the Tonnel airdrop payout worker, but launchd must not execute the worker from this `~/Documents` checkout. macOS can deny background `bash` processes access to protected `~/Documents` files after a reboot or system reset.

The launchd runtime is installed under:

- LaunchAgent: `~/Library/LaunchAgents/network.tokamak.tonnel-airdrop-worker.plist`
- Runtime copy: `~/Library/Application Support/TonnelAirdrop/runtime`
- Wrapper: `~/Library/Application Support/TonnelAirdrop/run-worker-with-notification.sh`
- Logs: `~/Library/Logs/TonnelAirdrop`

Edit worker code in this repository, then reinstall the LaunchAgent so the runtime copy is rebuilt:

```bash
npm run worker:install-launchd
```

Validate the installed runtime without sending payouts:

```bash
npm --prefix "$HOME/Library/Application Support/TonnelAirdrop/runtime" run worker -- --check
```

Do not edit the runtime copy directly. Any direct runtime edit will be replaced by the next install.
