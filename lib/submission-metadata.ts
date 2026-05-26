import { createHmac } from "node:crypto";

import { getCanonicalClientIp } from "@/lib/client-ip";

export type SubmissionMetadata = {
  submitterIpHash: string | null;
  submitterIpHashVersion: string | null;
  submitterUserAgentHash: string | null;
  submitterCountry: string | null;
  submitterRegion: string | null;
  submitterCity: string | null;
};

export function buildSubmissionMetadata(request: Request): SubmissionMetadata {
  const ip = getCanonicalClientIp(request);
  const userAgent = cleanHeaderValue(request.headers.get("user-agent"));
  const submitterIpHash = hashPrivateValue(ip);

  return {
    submitterIpHash,
    submitterIpHashVersion: submitterIpHash ? getMetadataSecretId() : null,
    submitterUserAgentHash: hashPrivateValue(userAgent),
    submitterCountry: normalizeLocationCode(
      request.headers.get("x-vercel-ip-country") ??
        request.headers.get("cf-ipcountry"),
    ),
    submitterRegion: normalizeLocationText(
      request.headers.get("x-vercel-ip-country-region"),
    ),
    submitterCity: normalizeLocationText(request.headers.get("x-vercel-ip-city")),
  };
}

function hashPrivateValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return createHmac("sha256", getMetadataSecret()).update(value).digest("hex");
}

function getMetadataSecret(): string {
  const secret = process.env.SUBMISSION_METADATA_SECRET ?? process.env.OPERATOR_TOKEN;

  if (!secret && (process.env.VERCEL === "1" || process.env.NODE_ENV === "production")) {
    throw new Error(
      "SUBMISSION_METADATA_SECRET or OPERATOR_TOKEN is required for submission metadata hashing.",
    );
  }

  return secret ?? "local-development-submission-metadata-secret";
}

function getMetadataSecretId(): string {
  return process.env.SUBMISSION_METADATA_SECRET_ID?.trim() || "legacy";
}

function cleanHeaderValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normalizeLocationCode(value: string | null | undefined): string | null {
  const cleaned = cleanHeaderValue(value);

  return cleaned ? cleaned.slice(0, 8).toUpperCase() : null;
}

function normalizeLocationText(value: string | null | undefined): string | null {
  const cleaned = cleanHeaderValue(value);

  return cleaned ? decodeURIComponent(cleaned).slice(0, 128) : null;
}
