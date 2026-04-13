import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives a cryptographic key from userId and master secret using PBKDF2
 */
export async function deriveUserKey(
  userId: string,
  userSalt: string
): Promise<Buffer> {
  const masterSecret = process.env.VAULT_MASTER_SECRET;
  
  if (!masterSecret) {
    throw new Error('VAULT_MASTER_SECRET not configured');
  }

  // Combine userId with master secret for key derivation
  const keyMaterial = `${userId}:${masterSecret}`;
  const salt = Buffer.from(userSalt, 'hex');

  // Derive key using PBKDF2
  const key = pbkdf2Sync(keyMaterial, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  
  return key;
}

/**
 * Generates a random salt for a user (call once during user creation)
 */
export function generateSalt(): string {
  return randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * Encrypts a secret value using AES-256-GCM
 */
export async function encryptSecret(
  plaintext: string,
  key: Buffer
): Promise<{ iv: string; cipher: string; tag: string }> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    cipher: encrypted,
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts a secret value using AES-256-GCM
 */
export async function decryptSecret(
  encrypted: { iv: string; cipher: string; tag: string },
  key: Buffer
): Promise<string> {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));

  let decrypted = decipher.update(encrypted.cipher, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypts a file buffer (for document storage)
 */
export async function encryptFile(
  buffer: Buffer,
  key: Buffer
): Promise<{ iv: string; data: string; tag: string }> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('base64'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts a file buffer
 */
export async function decryptFile(
  encrypted: { iv: string; data: string; tag: string },
  key: Buffer
): Promise<Buffer> {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.data, 'base64')),
    decipher.final(),
  ]);

  return decrypted;
}

/**
 * Hashes a password hint (one-way, for verification only)
 */
export function hashPasswordHint(hint: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(hint, salt, 10000, 32, 'sha256');
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifies a password hint against stored hash
 */
export function verifyPasswordHint(hint: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = pbkdf2Sync(hint, salt, 10000, 32, 'sha256');
  return hash.toString('hex') === hashHex;
}
