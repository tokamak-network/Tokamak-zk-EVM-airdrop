import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { getConfig } from "@/lib/config";

test("getConfig reads RPC settings from the private-state CLI rpc-config.env file", () => {
  const previousHome = process.env.HOME;
  const previousRpcUrl = process.env.AIRDROP_RPC_URL;
  const previousBlockRangeCap = process.env.AIRDROP_RPC_BLOCK_RANGE_CAP;
  const previousNetwork = process.env.AIRDROP_NETWORK;
  const homeDir = mkdtempSync(path.join(tmpdir(), "tonnel-rpc-config-test-"));
  const rpcDir = path.join(
    homeDir,
    "tokamak-private-channels",
    "workspace",
    "mainnet",
  );
  const rpcConfigPath = path.join(rpcDir, "rpc-config.env");

  mkdirSync(rpcDir, { recursive: true });
  writeFileSync(
    rpcConfigPath,
    [
      "RPC_URL=https://rpc.example.test",
      "RPC_BLOCK_RANGE_CAP=777",
      "LOG_REQUESTS_PER_SECOND=5",
    ].join("\n"),
  );

  Reflect.set(process.env, "HOME", homeDir);
  Reflect.set(process.env, "AIRDROP_NETWORK", "mainnet");
  delete process.env.AIRDROP_RPC_URL;
  delete process.env.AIRDROP_RPC_BLOCK_RANGE_CAP;

  try {
    const config = getConfig();

    assert.equal(config.rpcUrl, "https://rpc.example.test");
    assert.equal(config.rpcBlockRangeCap, 777);
    assert.equal(config.rpcConfigPath, rpcConfigPath);
    assert.equal(config.rpcConfigSource, "file");
    assert.equal(
      config.cliArtifactDir,
      path.join(process.cwd(), "private-state-artifacts", "chain-id-1"),
    );
  } finally {
    restoreEnv("HOME", previousHome);
    restoreEnv("AIRDROP_RPC_URL", previousRpcUrl);
    restoreEnv("AIRDROP_RPC_BLOCK_RANGE_CAP", previousBlockRangeCap);
    restoreEnv("AIRDROP_NETWORK", previousNetwork);
    rmSync(homeDir, { recursive: true, force: true });
  }
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  Reflect.set(process.env, name, value);
}
