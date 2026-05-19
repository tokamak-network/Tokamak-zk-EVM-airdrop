import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { CommandTemplate } from "@/lib/config";

const execFileAsync = promisify(execFile);

export type CommandContext = Record<string, string | number>;

export async function runJsonCommand<T>(
  template: CommandTemplate,
  context: CommandContext,
): Promise<T> {
  const args = template.args.map((arg) => applyTemplate(arg, context));
  const { stdout } = await execFileAsync(template.command, args, {
    timeout: 60_000,
    maxBuffer: 1024 * 1024,
  });

  const output = stdout.trim();

  if (!output) {
    throw new Error(`${template.command} returned empty stdout.`);
  }

  return JSON.parse(output) as T;
}

export type CommandRunOptions = {
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
};

export async function runCommand(
  command: string,
  args: string[],
  options: CommandRunOptions = {},
): Promise<string> {
  const { stdout } = await execFileAsync(command, args, {
    env: options.env,
    timeout: options.timeoutMs ?? 120_000,
    maxBuffer: 20 * 1024 * 1024,
  });

  return stdout.trim();
}

export async function runCliJson<T>(
  args: string[],
  options: CommandRunOptions = {},
): Promise<T> {
  const stdout = await runCommand(
    "private-state-cli",
    [...args, "--json"],
    options,
  );

  if (!stdout) {
    throw new Error(`private-state-cli ${args.join(" ")} returned empty stdout.`);
  }

  return JSON.parse(stdout) as T;
}

function applyTemplate(value: string, context: CommandContext): string {
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const replacement = context[key];

    if (replacement === undefined) {
      throw new Error(`Missing command template value for ${match}.`);
    }

    return String(replacement);
  });
}
