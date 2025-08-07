// Crypto utilities

/**
 * Generates a random hex string of specified length
 */
export function generateRandomHex(length: number = 32): string {
  const bytes = new Uint8Array(length / 2);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Converts a string to a hex string
 */
export function stringToHex(str: string): string {
  return '0x' + Array.from(str, char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

/**
 * Converts a hex string to a regular string
 */
export function hexToString(hex: string): string {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return String.fromCharCode(...hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

/**
 * Converts a number to a hex string
 */
export function numberToHex(num: number): string {
  return '0x' + num.toString(16);
}

/**
 * Converts a hex string to a number
 */
export function hexToNumber(hex: string): number {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return parseInt(hex, 16);
}

/**
 * Pads a hex string to a specific length
 */
export function padHex(hex: string, length: number): string {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return '0x' + hex.padStart(length, '0');
}

/**
 * Checks if a string is a valid hex string
 */
export function isHexString(str: string): boolean {
  if (!str.startsWith('0x')) {
    return false;
  }
  return /^0x[a-fA-F0-9]+$/.test(str);
} 