// Validation utilities

/**
 * Validates if a string is a valid Starknet address
 */
export function isValidStarknetAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Starknet addresses are 66 characters long and start with 0x
  const addressRegex = /^0x[a-fA-F0-9]{64}$/;
  return addressRegex.test(address);
}

/**
 * Validates if a string is a valid hex string
 */
export function isValidHexString(hex: string): boolean {
  if (!hex || typeof hex !== 'string') {
    return false;
  }
  
  const hexRegex = /^0x[a-fA-F0-9]+$/;
  return hexRegex.test(hex);
}

/**
 * Validates if a value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validates if a value is a valid string
 */
export function isValidString(value: any): boolean {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validates if a value is a valid boolean
 */
export function isValidBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

/**
 * Validates if a value is a valid object
 */
export function isValidObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates if a value is a valid array
 */
export function isValidArray(value: any): boolean {
  return Array.isArray(value);
} 