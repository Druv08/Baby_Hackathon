import { SECRETS, type SecretCollectible } from "@/data/secrets";
import { recordEasterEgg, type JourneyProgress } from "@/lib/progress/model";

export type CollectResult = "collected" | "already-collected" | "unknown";

const SECRETS_BY_ID = new Map(SECRETS.map((s) => [s.id, s]));

export function getAllSecrets(): readonly SecretCollectible[] {
  return SECRETS;
}

export function getSecretById(id: string): SecretCollectible | undefined {
  return SECRETS_BY_ID.get(id);
}

export function getSecretForFuture(slug: string): SecretCollectible | undefined {
  return SECRETS.find((s) => s.futureSlug === slug);
}

/** Collects a secret by its ID. Collecting twice never increases progress. */
export function collectSecret(
  progress: JourneyProgress,
  secretId: string,
): { progress: JourneyProgress; result: CollectResult } {
  const secret = getSecretById(secretId);
  if (!secret) return { progress, result: "unknown" };
  if (progress.easterEggsFound.includes(secret.characterId)) return { progress, result: "already-collected" };
  return { progress: recordEasterEgg(progress, secret.characterId), result: "collected" };
}

export function isSecretCollected(progress: JourneyProgress, secretId: string): boolean {
  const secret = getSecretById(secretId);
  return secret !== undefined && progress.easterEggsFound.includes(secret.characterId);
}

export function getFoundSecrets(progress: JourneyProgress): SecretCollectible[] {
  return SECRETS.filter((s) => progress.easterEggsFound.includes(s.characterId));
}

export function getSecretCount(progress: JourneyProgress): number {
  return getFoundSecrets(progress).length;
}

export function areAllSecretsFound(progress: JourneyProgress): boolean {
  return getSecretCount(progress) === SECRETS.length;
}

/** The secret ending unlocks once all eight secrets are found, in any order. */
export const isSecretEndingUnlocked = areAllSecretsFound;
