import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createRecoveryCode() {
  return randomBytes(24).toString("base64url");
}

export function hashRecoveryCode(value: string) {
  return createHash("sha256").update(value.trim(), "utf8").digest("hex");
}

export function matchesRecoveryCode(value: string, storedHash: string | null) {
  if (!storedHash || !/^[a-f0-9]{64}$/.test(storedHash)) return false;
  const candidate = Buffer.from(hashRecoveryCode(value), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return timingSafeEqual(candidate, expected);
}
