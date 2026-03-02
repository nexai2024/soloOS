import { describe, it, expect } from 'vitest';
import { createHash, randomBytes } from 'crypto';

// Test the password hashing logic directly (the functions are not exported,
// so we replicate the same algorithm and verify round-trip correctness)
function hashPassword(password: string, salt?: string) {
  const useSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + useSalt).digest('hex');
  return { hash, salt: useSalt };
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

describe('password hashing', () => {
  it('round-trips correctly', () => {
    const password = 'my-secret-password';
    const { hash, salt } = hashPassword(password);
    const storedHash = `${salt}:${hash}`;
    expect(verifyPassword(password, storedHash)).toBe(true);
  });

  it('rejects wrong password', () => {
    const { hash, salt } = hashPassword('correct-password');
    const storedHash = `${salt}:${hash}`;
    expect(verifyPassword('wrong-password', storedHash)).toBe(false);
  });

  it('generates different salts each time', () => {
    const r1 = hashPassword('same-password');
    const r2 = hashPassword('same-password');
    expect(r1.salt).not.toBe(r2.salt);
    expect(r1.hash).not.toBe(r2.hash);
  });

  it('produces consistent hash with same salt', () => {
    const r1 = hashPassword('test', 'fixed-salt');
    const r2 = hashPassword('test', 'fixed-salt');
    expect(r1.hash).toBe(r2.hash);
  });
});
