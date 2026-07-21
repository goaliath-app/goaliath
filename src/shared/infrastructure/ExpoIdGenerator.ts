import { randomUUID } from 'expo-crypto';
import type { IdGenerator } from '@/shared/domain/ports/IdGenerator';

/**
 * UUIDs from the platform's cryptographic RNG. Random (v4) rather than
 * sequential on purpose: ids are minted on the device with no coordination, so
 * two devices creating entities offline must not be able to collide when they
 * later sync (`future-features`).
 */
export class ExpoIdGenerator implements IdGenerator {
  newId(): string {
    return randomUUID();
  }
}
