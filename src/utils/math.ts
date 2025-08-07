// Math utilities

/**
 * Converts a number to Wei (smallest unit)
 */
export function toWei(amount: number, decimals: number = 18): string {
  return (amount * Math.pow(10, decimals)).toString();
}

/**
 * Converts Wei to a number
 */
export function fromWei(amount: string, decimals: number = 18): number {
  return parseInt(amount) / Math.pow(10, decimals);
}

/**
 * Safely adds two numbers
 */
export function safeAdd(a: number, b: number): number {
  return a + b;
}

/**
 * Safely subtracts two numbers
 */
export function safeSubtract(a: number, b: number): number {
  return a - b;
}

/**
 * Safely multiplies two numbers
 */
export function safeMultiply(a: number, b: number): number {
  return a * b;
}

/**
 * Safely divides two numbers
 */
export function safeDivide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

/**
 * Calculates percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (part / total) * 100;
}

/**
 * Rounds a number to a specific number of decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Checks if a number is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
} 