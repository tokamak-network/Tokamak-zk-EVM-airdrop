import { isIP } from "node:net";

export function getCanonicalClientIp(request: Request): string | null {
  for (const value of getClientIpCandidates(request)) {
    const normalized = normalizeClientIp(value);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function normalizeClientIp(value: string | null | undefined): string | null {
  const cleaned = cleanIpValue(value);

  if (!cleaned) {
    return null;
  }

  const withoutPort = stripPort(cleaned);
  const withoutZone = stripIpv6Zone(withoutPort);
  const version = isIP(withoutZone);

  if (version === 4) {
    return normalizeIpv4(withoutZone);
  }

  if (version === 6) {
    return normalizeIpv6(withoutZone);
  }

  return null;
}

function getClientIpCandidates(request: Request): string[] {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return [
    forwardedIp,
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
  ].filter((value): value is string => Boolean(value));
}

function cleanIpValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || null;
  }

  return trimmed;
}

function stripPort(value: string): string {
  const bracketed = value.match(/^\[([^\]]+)\](?::\d+)?$/);

  if (bracketed) {
    return bracketed[1]!;
  }

  if (isIP(value)) {
    return value;
  }

  const portMatch = value.match(/^(.+):(\d+)$/);

  if (portMatch && isIP(portMatch[1]!)) {
    return portMatch[1]!;
  }

  return value;
}

function stripIpv6Zone(value: string): string {
  const zoneIndex = value.indexOf("%");

  return zoneIndex === -1 ? value : value.slice(0, zoneIndex);
}

function normalizeIpv4(value: string): string | null {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return null;
  }

  const octets = parts.map((part) => Number(part));

  if (
    octets.some(
      (octet, index) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255 ||
        String(octet) !== parts[index],
    )
  ) {
    return null;
  }

  return octets.join(".");
}

function normalizeIpv6(value: string): string | null {
  const hextets = parseIpv6Hextets(value.toLowerCase());

  if (!hextets) {
    return null;
  }

  const mappedIpv4 = getIpv4MappedAddress(hextets);

  if (mappedIpv4) {
    return mappedIpv4;
  }

  return formatIpv6(hextets);
}

function parseIpv6Hextets(value: string): number[] | null {
  const address = replaceEmbeddedIpv4(value);
  const doubleColonParts = address.split("::");

  if (doubleColonParts.length > 2) {
    return null;
  }

  const left = parseHextetList(doubleColonParts[0]!);
  const right = parseHextetList(doubleColonParts[1] ?? "");

  if (!left || !right) {
    return null;
  }

  if (doubleColonParts.length === 1) {
    return left.length === 8 ? left : null;
  }

  const missing = 8 - left.length - right.length;

  if (missing < 1) {
    return null;
  }

  return [...left, ...Array<number>(missing).fill(0), ...right];
}

function replaceEmbeddedIpv4(value: string): string {
  const lastColonIndex = value.lastIndexOf(":");
  const ipv4Part = value.slice(lastColonIndex + 1);

  if (!ipv4Part.includes(".")) {
    return value;
  }

  const ipv4 = normalizeIpv4(ipv4Part);

  if (!ipv4) {
    return value;
  }

  const octets = ipv4.split(".").map((part) => Number(part));
  const high = ((octets[0]! << 8) | octets[1]!).toString(16);
  const low = ((octets[2]! << 8) | octets[3]!).toString(16);

  return `${value.slice(0, lastColonIndex)}:${high}:${low}`;
}

function parseHextetList(value: string): number[] | null {
  if (!value) {
    return [];
  }

  const parts = value.split(":");
  const hextets: number[] = [];

  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) {
      return null;
    }

    hextets.push(Number.parseInt(part, 16));
  }

  return hextets;
}

function getIpv4MappedAddress(hextets: number[]): string | null {
  const isMapped =
    hextets.slice(0, 5).every((hextet) => hextet === 0) &&
    hextets[5] === 0xffff;

  if (!isMapped) {
    return null;
  }

  return [
    hextets[6]! >> 8,
    hextets[6]! & 0xff,
    hextets[7]! >> 8,
    hextets[7]! & 0xff,
  ].join(".");
}

function formatIpv6(hextets: number[]): string {
  const zeroRun = findBestZeroRun(hextets);
  const parts: string[] = [];

  for (let index = 0; index < hextets.length; index += 1) {
    if (zeroRun && index === zeroRun.start) {
      parts.push("");
      index += zeroRun.length - 1;

      if (index === hextets.length - 1) {
        parts.push("");
      }

      continue;
    }

    parts.push(hextets[index]!.toString(16));
  }

  if (zeroRun?.start === 0) {
    parts.unshift("");
  }

  return parts.join(":");
}

function findBestZeroRun(
  hextets: number[],
): { start: number; length: number } | null {
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let index = 0; index <= hextets.length; index += 1) {
    if (hextets[index] === 0) {
      if (currentStart === -1) {
        currentStart = index;
      }

      currentLength += 1;
      continue;
    }

    if (currentLength > bestLength) {
      bestStart = currentStart;
      bestLength = currentLength;
    }

    currentStart = -1;
    currentLength = 0;
  }

  return bestLength >= 2 ? { start: bestStart, length: bestLength } : null;
}
