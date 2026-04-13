// Client-side encryption for vault using WebCrypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

/**
 * Derive encryption key from user ID and app secret using HKDF
 */
async function deriveKey(userId: string, appSecret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const saltData = encoder.encode(userId);
  const keyMaterial = encoder.encode(appSecret);

  // Import key material
  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(
  data: string,
  userId: string,
  appSecret: string
): Promise<{ iv: string; cipher: string; tag: string }> {
  const key = await deriveKey(userId, appSecret);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    dataBuffer
  );

  const encryptedArray = new Uint8Array(encrypted);
  const cipherLen = encryptedArray.length - TAG_LENGTH / 8;
  const cipher = encryptedArray.slice(0, cipherLen);
  const tag = encryptedArray.slice(cipherLen);

  return {
    iv: arrayBufferToBase64(iv),
    cipher: arrayBufferToBase64(cipher),
    tag: arrayBufferToBase64(tag),
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encrypted: { iv: string; cipher: string; tag: string },
  userId: string,
  appSecret: string
): Promise<string> {
  const key = await deriveKey(userId, appSecret);

  const iv = base64ToArrayBuffer(encrypted.iv);
  const cipher = base64ToArrayBuffer(encrypted.cipher);
  const tag = base64ToArrayBuffer(encrypted.tag);

  // Combine cipher and tag
  const combined = new Uint8Array(cipher.byteLength + tag.byteLength);
  combined.set(new Uint8Array(cipher), 0);
  combined.set(new Uint8Array(tag), cipher.byteLength);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: new Uint8Array(iv),
      tagLength: TAG_LENGTH,
    },
    key,
    combined
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random app secret (run once and store in env)
 */
export function generateAppSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
